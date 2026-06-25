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
      <p class="text-sm text-gray-400 dark:text-gray-500">从图片中拾取颜色</p>
    </div>

    <div v-if="imageSrc" class="space-y-6">
      <!-- Toolbar -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600"
            :style="{ backgroundColor: pickedColor.hex }"
          />
          <div class="text-sm">
            <p class="font-mono font-semibold text-gray-900 dark:text-white">{{ pickedColor.hex }}</p>
            <p class="text-gray-500 dark:text-gray-400">{{ pickedColor.rgb }}</p>
          </div>
        </div>
        <el-button @click="reset">
          <el-icon><Refresh /></el-icon> 重新选择
        </el-button>
      </div>

      <!-- Canvas Area -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-auto">
        <div class="flex justify-center relative">
          <canvas
            ref="canvas"
            class="cursor-crosshair border border-gray-200 dark:border-gray-600 rounded"
            @mousemove="onMouseMove"
            @click="onCanvasClick"
          />
          <!-- Magnifier -->
          <div v-if="showMagnifier"
            class="absolute pointer-events-none border-2 border-white shadow-lg rounded-full overflow-hidden"
            :style="magnifierStyle"
          >
            <canvas ref="magnifierCanvas" :width="magnifierSize" :height="magnifierSize" />
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-white rounded-full" />
          </div>
        </div>
      </div>

      <!-- Saved Colors -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">收藏的颜色</h3>
          <el-button size="small" @click="addCurrentColor">
            <el-icon><Plus /></el-icon> 收藏当前颜色
          </el-button>
        </div>
        <div v-if="savedColors.length > 0" class="flex flex-wrap gap-2">
          <div v-for="(c, index) in savedColors" :key="index" class="group relative">
            <div
              class="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform"
              :style="{ backgroundColor: c.hex }"
              :title="c.hex"
              @click="copyColor(c.hex)"
            />
            <button
              class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              @click="savedColors.splice(index, 1)"
            >×</button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 dark:text-gray-500">点击图片拾取颜色，然后收藏</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, nextTick } from 'vue'
import { Upload, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface ColorInfo {
  hex: string
  rgb: string
  r: number
  g: number
  b: number
}

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const imageSrc = ref('')
const canvas = ref<HTMLCanvasElement>()
const magnifierCanvas = ref<HTMLCanvasElement>()
const showMagnifier = ref(false)
const magnifierSize = 120
const magnifierScale = 8

const pickedColor = reactive<ColorInfo>({ hex: '#000000', rgb: 'rgb(0, 0, 0)', r: 0, g: 0, b: 0 })
const savedColors = ref<ColorInfo[]>([])
const magnifierStyle = ref<Record<string, string>>({})

let imageData: ImageData | null = null
let canvasW = 0
let canvasH = 0

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
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
  imageSrc.value = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    nextTick(() => {
      const c = canvas.value!
      const maxW = 800
      const scale = Math.min(1, maxW / img.naturalWidth)
      c.width = Math.round(img.naturalWidth * scale)
      c.height = Math.round(img.naturalHeight * scale)
      canvasW = c.width
      canvasH = c.height
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0, c.width, c.height)
      imageData = ctx.getImageData(0, 0, c.width, c.height)
    })
  }
  img.src = imageSrc.value
}

const getColorAt = (x: number, y: number): ColorInfo | null => {
  if (!imageData) return null
  const px = Math.round(x)
  const py = Math.round(y)
  if (px < 0 || py < 0 || px >= canvasW || py >= canvasH) return null
  const i = (py * canvasW + px) * 4
  const r = imageData.data[i]
  const g = imageData.data[i + 1]
  const b = imageData.data[i + 2]
  const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase()
  return { hex, rgb: `rgb(${r}, ${g}, ${b})`, r, g, b }
}

const onMouseMove = (e: MouseEvent) => {
  const c = canvas.value
  if (!c) return
  const rect = c.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const color = getColorAt(x, y)
  if (color) {
    Object.assign(pickedColor, color)
    showMagnifier.value = true
    updateMagnifier(x, y, e)
  }
}

const updateMagnifier = (x: number, y: number, e: MouseEvent) => {
  const magX = x - magnifierSize / 2
  const magY = y - magnifierSize - 20
  magnifierStyle.value = {
    left: `${magX}px`,
    top: `${magY}px`,
    width: `${magnifierSize}px`,
    height: `${magnifierSize}px`,
  }

  const mc = magnifierCanvas.value
  const c = canvas.value
  if (!mc || !c) return
  const mctx = mc.getContext('2d')!
  mctx.imageSmoothingEnabled = false

  const srcSize = magnifierSize / magnifierScale
  const sx = x - srcSize / 2
  const sy = y - srcSize / 2
  mctx.clearRect(0, 0, magnifierSize, magnifierSize)
  mctx.drawImage(c, sx, sy, srcSize, srcSize, 0, 0, magnifierSize, magnifierSize)
}

const onCanvasClick = (e: MouseEvent) => {
  const c = canvas.value
  if (!c) return
  const rect = c.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const color = getColorAt(x, y)
  if (color) {
    Object.assign(pickedColor, color)
    ElMessage.success(`已拾取 ${color.hex}`)
  }
}

const addCurrentColor = () => {
  if (savedColors.value.some(c => c.hex === pickedColor.hex)) {
    ElMessage.warning('该颜色已收藏')
    return
  }
  savedColors.value.push({ ...pickedColor })
  ElMessage.success('已收藏')
}

const copyColor = async (hex: string) => {
  try {
    await navigator.clipboard.writeText(hex)
    ElMessage.success(`已复制 ${hex}`)
  } catch {
    ElMessage.error('复制失败')
  }
}

const reset = () => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
  imageSrc.value = ''
  imageData = null
  showMagnifier.value = false
}

onUnmounted(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
})
</script>
