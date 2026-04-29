<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Tools -->
        <div class="flex items-center gap-2">
          <el-button
            v-for="tool in tools"
            :key="tool.name"
            :type="currentTool === tool.name ? 'primary' : 'default'"
            @click="currentTool = tool.name"
          >
            <el-icon>
              <component :is="tool.icon" />
            </el-icon>
          </el-button>
        </div>

        <el-divider direction="vertical" />

        <!-- Color -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">颜色:</span>
          <el-color-picker v-model="strokeColor" />
        </div>

        <!-- Size -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">粗细:</span>
          <el-slider v-model="strokeWidth" :min="1" :max="20" class="w-24" />
        </div>

        <el-divider direction="vertical" />

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <el-button @click="undo" :disabled="historyIndex <= 0">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button @click="redo" :disabled="historyIndex >= history.length - 1">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button @click="clearCanvas">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>

        <el-divider direction="vertical" />

        <!-- Export -->
        <div class="flex items-center gap-2">
          <el-button type="primary" @click="downloadImage">
            <el-icon><Download /></el-icon>
            保存图片
          </el-button>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="cursor-crosshair block"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawingTouch"
        @touchmove.prevent="drawTouch"
        @touchend.prevent="stopDrawing"
      />
    </div>

    <!-- Canvas Size -->
    <div class="flex gap-4 justify-center">
      <span class="text-sm text-gray-500">画布尺寸:</span>
      <el-radio-group v-model="canvasSize" size="small" @change="resizeCanvas">
        <el-radio-button label="800x600">800 × 600</el-radio-button>
        <el-radio-button label="1200x800">1200 × 800</el-radio-button>
        <el-radio-button label="1920x1080">1920 × 1080</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Edit,
  CircleCheck,
  Remove,
  ArrowLeft,
  ArrowRight,
  Delete,
  Download,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const tools = [
  { name: 'pen', icon: Edit },
  { name: 'line', icon: Remove },
  { name: 'rect', icon: 'Square' as any },
  { name: 'circle', icon: 'CircleCheck' as any },
  { name: 'eraser', icon: 'Erase' as any },
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentTool = ref('pen')
const strokeColor = ref('#000000')
const strokeWidth = ref(3)
const canvasSize = ref('800x600')

const canvasWidth = ref(800)
const canvasHeight = ref(600)

let isDrawing = false
let startX = 0
let startY = 0
let snapshot: ImageData | null = null

// History
const history = ref<ImageData[]>([])
const historyIndex = ref(-1)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Set white background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  saveHistory()
})

const getCoordinates = (e: MouseEvent): [number, number] => {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return [e.clientX - rect.left, e.clientY - rect.top]
}

const getTouchCoordinates = (e: TouchEvent): [number, number] => {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const touch = e.touches[0]
  return [touch.clientX - rect.left, touch.clientY - rect.top]
}

const startDrawing = (e: MouseEvent) => {
  isDrawing = true
  const [x, y] = getCoordinates(e)
  startX = x
  startY = y
  
  const ctx = canvasRef.value!.getContext('2d')!
  snapshot = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value)
  
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.strokeStyle = currentTool.value === 'eraser' ? '#FFFFFF' : strokeColor.value
  ctx.lineWidth = strokeWidth.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

const draw = (e: MouseEvent) => {
  if (!isDrawing) return
  
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  const [x, y] = getCoordinates(e)
  
  if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    ctx.lineTo(x, y)
    ctx.stroke()
  } else if (currentTool.value === 'line') {
    ctx.putImageData(snapshot!, 0, 0)
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(x, y)
    ctx.stroke()
  } else if (currentTool.value === 'rect') {
    ctx.putImageData(snapshot!, 0, 0)
    ctx.strokeRect(startX, startY, x - startX, y - startY)
  } else if (currentTool.value === 'circle') {
    ctx.putImageData(snapshot!, 0, 0)
    ctx.beginPath()
    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))
    ctx.arc(startX, startY, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
}

const stopDrawing = () => {
  if (!isDrawing) return
  isDrawing = false
  saveHistory()
}

const startDrawingTouch = (e: TouchEvent) => {
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  startDrawing(mouseEvent as any)
}

const drawTouch = (e: TouchEvent) => {
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  draw(mouseEvent as any)
}

const saveHistory = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Remove redo states
  history.value = history.value.slice(0, historyIndex.value + 1)
  
  history.value.push(ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value))
  historyIndex.value++
  
  // Limit history
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (historyIndex.value <= 0) return
  historyIndex.value--
  restoreHistory()
}

const redo = () => {
  if (historyIndex.value >= history.value.length - 1) return
  historyIndex.value++
  restoreHistory()
}

const restoreHistory = () => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx || history.value.length === 0) return
  
  ctx.putImageData(history.value[historyIndex.value], 0, 0)
}

const clearCanvas = () => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  saveHistory()
}

const resizeCanvas = () => {
  const [w, h] = canvasSize.value.split('x').map(Number)
  canvasWidth.value = w
  canvasHeight.value = h
  
  // Clear history on resize
  setTimeout(() => {
    clearCanvas()
  }, 0)
}

const downloadImage = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `whiteboard_${Date.now()}.png`
  link.click()
  ElMessage.success('已保存')
}
</script>
