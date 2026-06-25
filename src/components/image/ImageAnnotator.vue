<template>
  <div class="space-y-6">
    <!-- Upload Area -->
    <div v-if="!imageSrc"
      class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      :class="{ 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20': isDragging }"
    >
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
      <el-icon :size="48" class="text-gray-400 dark:text-gray-500 mb-4"><Upload /></el-icon>
      <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽图片到此处，或点击上传</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">支持 PNG、JPEG、WebP 等格式</p>
    </div>

    <div v-if="imageSrc" class="space-y-6">
      <!-- Toolbar -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex flex-wrap items-center gap-3">
          <el-radio-group v-model="tool" size="small">
            <el-radio-button label="pen">画笔</el-radio-button>
            <el-radio-button label="arrow">箭头</el-radio-button>
            <el-radio-button label="rect">矩形</el-radio-button>
            <el-radio-button label="circle">圆形</el-radio-button>
            <el-radio-button label="text">文字</el-radio-button>
            <el-radio-button label="mosaic">马赛克</el-radio-button>
          </el-radio-group>
          <el-color-picker v-model="color" size="small" />
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">线宽:</span>
            <el-slider v-model="lineWidth" :min="1" :max="20" :style="{ width: '100px' }" />
          </div>
          <div class="flex items-center gap-2">
            <el-button size="small" :disabled="historyIndex < 1" @click="undo">
              撤销
            </el-button>
            <el-button size="small" :disabled="historyIndex >= history.length - 1" @click="redo">
              重做
            </el-button>
          </div>
          <el-button size="small" @click="reset">
            <el-icon><Refresh /></el-icon> 重新选择
          </el-button>
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-auto">
        <div class="flex justify-center">
          <canvas
            ref="canvas"
            class="cursor-crosshair border border-gray-200 dark:border-gray-600 rounded"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
          />
        </div>
      </div>

      <!-- Text Input Dialog -->
      <el-dialog v-model="showTextInput" title="输入文字" width="300px">
        <el-input v-model="textInputValue" placeholder="输入标注文字" @keyup.enter="confirmText" />
        <template #footer>
          <el-button @click="showTextInput = false">取消</el-button>
          <el-button type="primary" @click="confirmText">确定</el-button>
        </template>
      </el-dialog>

      <!-- Download -->
      <div class="flex gap-3 justify-center">
        <el-button type="primary" @click="download('png')">
          <el-icon><Download /></el-icon> 下载 PNG
        </el-button>
        <el-button @click="download('jpg')">
          <el-icon><Download /></el-icon> 下载 JPEG
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { Upload, Download, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const imageSrc = ref('')
const canvas = ref<HTMLCanvasElement>()
const tool = ref<'pen' | 'arrow' | 'rect' | 'circle' | 'text' | 'mosaic'>('pen')
const color = ref('#FF0000')
const lineWidth = ref(3)
const showTextInput = ref(false)
const textInputValue = ref('')

let originalImage: HTMLImageElement | null = null
let isDrawing = false
let startX = 0
let startY = 0
let history: ImageData[] = []
let historyIndex = -1
let textX = 0
let textY = 0

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadImage(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file?.type.startsWith('image/')) loadImage(file)
}

const loadImage = (file: File) => {
  imageSrc.value = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    originalImage = img
    nextTick(() => {
      const c = canvas.value!
      const maxW = 800
      const scale = Math.min(1, maxW / img.naturalWidth)
      c.width = Math.round(img.naturalWidth * scale)
      c.height = Math.round(img.naturalHeight * scale)
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0, c.width, c.height)
      saveHistory()
    })
  }
  img.src = imageSrc.value
}

const getCtx = () => canvas.value?.getContext('2d')!

const saveHistory = () => {
  const ctx = getCtx()
  if (!ctx || !canvas.value) return
  const data = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)
  history = history.slice(0, historyIndex + 1)
  history.push(data)
  historyIndex++
  if (history.length > 50) {
    history.shift()
    historyIndex--
  }
}

const undo = () => {
  if (historyIndex > 0) {
    historyIndex--
    getCtx().putImageData(history[historyIndex], 0, 0)
  }
}

const redo = () => {
  if (historyIndex < history.length - 1) {
    historyIndex++
    getCtx().putImageData(history[historyIndex], 0, 0)
  }
}

const getPos = (e: MouseEvent) => {
  const rect = canvas.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

const onMouseDown = (e: MouseEvent) => {
  const pos = getPos(e)
  startX = pos.x
  startY = pos.y

  if (tool.value === 'text') {
    textX = pos.x
    textY = pos.y
    showTextInput.value = true
    return
  }

  isDrawing = true
  if (tool.value === 'pen') {
    const ctx = getCtx()
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDrawing) return
  const pos = getPos(e)
  const ctx = getCtx()

  if (tool.value === 'pen') {
    ctx.strokeStyle = color.value
    ctx.lineWidth = lineWidth.value
    ctx.lineCap = 'round'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  } else if (tool.value === 'mosaic') {
    const size = lineWidth.value * 3
    const sx = Math.max(0, pos.x - size / 2)
    const sy = Math.max(0, pos.y - size / 2)
    const imgData = ctx.getImageData(sx, sy, size, size)
    const avg = [0, 0, 0]
    let count = 0
    for (let i = 0; i < imgData.data.length; i += 4) {
      avg[0] += imgData.data[i]
      avg[1] += imgData.data[i + 1]
      avg[2] += imgData.data[i + 2]
      count++
    }
    avg[0] = Math.round(avg[0] / count)
    avg[1] = Math.round(avg[1] / count)
    avg[2] = Math.round(avg[2] / count)
    ctx.fillStyle = `rgb(${avg[0]},${avg[1]},${avg[2]})`
    ctx.fillRect(sx, sy, size, size)
  }
}

const onMouseUp = (e: MouseEvent) => {
  if (!isDrawing) return
  isDrawing = false
  const pos = getPos(e)
  const ctx = getCtx()

  ctx.strokeStyle = color.value
  ctx.lineWidth = lineWidth.value
  ctx.fillStyle = color.value

  if (tool.value === 'arrow') {
    drawArrow(ctx, startX, startY, pos.x, pos.y)
  } else if (tool.value === 'rect') {
    ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY)
  } else if (tool.value === 'circle') {
    const rx = (pos.x - startX) / 2
    const ry = (pos.y - startY) / 2
    ctx.beginPath()
    ctx.ellipse(startX + rx, startY + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  saveHistory()
}

const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
  const headLen = 15
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
  ctx.stroke()
}

const confirmText = () => {
  if (!textInputValue.value.trim()) {
    showTextInput.value = false
    return
  }
  const ctx = getCtx()
  ctx.fillStyle = color.value
  ctx.font = `${lineWidth.value * 5 + 12}px sans-serif`
  ctx.fillText(textInputValue.value, textX, textY)
  textInputValue.value = ''
  showTextInput.value = false
  saveHistory()
}

const download = (format: 'png' | 'jpg') => {
  const c = canvas.value
  if (!c) return
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
  const url = c.toDataURL(mimeType, 0.95)
  const a = document.createElement('a')
  a.href = url
  a.download = `annotated_${Date.now()}.${format}`
  a.click()
}

const reset = () => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
  imageSrc.value = ''
  originalImage = null
  history = []
  historyIndex = -1
}

onUnmounted(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
})
</script>
