<template>
  <div class="space-y-6">
    <!-- 上传区域 -->
    <div
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

    <!-- 编辑区域 -->
    <div v-if="imageSrc" class="space-y-4">
      <!-- 预览 -->
      <div class="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-xl p-4 overflow-auto">
        <canvas ref="canvasRef" class="max-w-full max-h-[400px] object-contain" />
      </div>

      <!-- 旋转控制 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">旋转 & 翻转</h3>

        <!-- 快捷按钮 -->
        <div class="flex flex-wrap gap-2">
          <el-button @click="rotate(-90)"><el-icon><RefreshLeft /></el-icon> 左转90°</el-button>
          <el-button @click="rotate(90)"><el-icon><RefreshRight /></el-icon> 右转90°</el-button>
          <el-button @click="rotate(180)">旋转180°</el-button>
          <el-button @click="flip('horizontal')"><el-icon><Sort /></el-icon> 水平翻转</el-button>
          <el-button @click="flip('vertical')"><el-icon><Sort /></el-icon> 垂直翻转</el-button>
        </div>

        <!-- 自定义角度 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
            自定义角度: <span class="font-semibold text-blue-600">{{ angle }}°</span>
          </label>
          <div class="flex items-center gap-4">
            <el-slider v-model="angle" :min="-180" :max="180" :step="1" class="flex-1" />
            <el-input-number v-model="angle" :min="-180" :max="180" :step="1" size="small" />
          </div>
        </div>

        <!-- 背景色（旋转非90度倍数时需要填充） -->
        <div class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">填充背景色</label>
          <el-color-picker v-model="bgColor" show-alpha />
          <el-checkbox v-model="transparentBg">透明背景</el-checkbox>
        </div>

        <div class="flex gap-2">
          <el-button type="primary" @click="applyRotation" :loading="processing">应用旋转</el-button>
          <el-button @click="resetAngle">重置</el-button>
        </div>
      </div>

      <!-- 下载 -->
      <div v-if="resultUrl" class="flex justify-center">
        <el-button type="primary" size="large" @click="download">
          <el-icon><Download /></el-icon>
          下载图片
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick , onUnmounted} from 'vue'
import { Upload, RefreshLeft, RefreshRight, Sort, Download } from '@element-plus/icons-vue'

const fileInput = ref<HTMLInputElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const processing = ref(false)
const imageSrc = ref('')
const originalImage = ref<HTMLImageElement | null>(null)
const angle = ref(0)
const bgColor = ref('#ffffff')
const transparentBg = ref(false)
const resultUrl = ref('')

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
    originalImage.value = img
    drawImage(img, 0, false, false)
  }
  img.src = imageSrc.value
}

const drawImage = (img: HTMLImageElement, rot: number, flipH: boolean, flipV: boolean) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!

  const rad = (rot * Math.PI) / 180
  const absCos = Math.abs(Math.cos(rad))
  const absSin = Math.abs(Math.sin(rad))
  const newW = Math.ceil(img.naturalWidth * absCos + img.naturalHeight * absSin)
  const newH = Math.ceil(img.naturalWidth * absSin + img.naturalHeight * absCos)

  canvas.width = newW
  canvas.height = newH

  ctx.clearRect(0, 0, newW, newH)

  if (!transparentBg.value) {
    ctx.fillStyle = bgColor.value
    ctx.fillRect(0, 0, newW, newH)
  }

  ctx.save()
  ctx.translate(newW / 2, newH / 2)
  ctx.rotate(rad)
  if (flipH) ctx.scale(-1, 1)
  if (flipV) ctx.scale(1, -1)
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
  ctx.restore()
}

const rotate = (deg: number) => {
  angle.value = (angle.value + deg + 360) % 360
  if (angle.value > 180) angle.value -= 360
  if (originalImage.value) drawImage(originalImage.value, angle.value, false, false)
}

const flipState = ref({ h: false, v: false })

const flip = (dir: 'horizontal' | 'vertical') => {
  if (dir === 'horizontal') flipState.value.h = !flipState.value.h
  else flipState.value.v = !flipState.value.v
  if (originalImage.value) drawImage(originalImage.value, angle.value, flipState.value.h, flipState.value.v as any)
}

const applyRotation = () => {
  if (!canvasRef.value) return
  processing.value = true
  const format = transparentBg.value ? 'image/png' : 'image/jpeg'
  resultUrl.value = canvasRef.value.toDataURL(format, 0.95)
  processing.value = false
}

const resetAngle = () => {
  angle.value = 0
  flipState.value = { h: false, v: false }
  if (originalImage.value) drawImage(originalImage.value, 0, false, false)
}

const download = () => {
  if (!resultUrl.value) return
  const a = document.createElement('a')
  a.href = resultUrl.value
  const ext = transparentBg.value ? 'png' : 'jpg'
  a.download = `rotated_${Date.now()}.${ext}`
  a.click()
}

// 清理 Object URL 防止内存泄漏
onUnmounted(() => {
  if (imageSrc.value && typeof imageSrc.value === "string") URL.revokeObjectURL(imageSrc.value)
})
</script>
