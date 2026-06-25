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
      <!-- 对比预览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-center">
          <p class="text-sm text-gray-500 mb-2">原图</p>
          <div class="flex justify-center overflow-hidden">
            <img :src="imageSrc" class="max-w-full max-h-[300px] object-contain rounded" />
          </div>
        </div>
        <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-center">
          <p class="text-sm text-gray-500 mb-2">效果预览</p>
          <div class="flex justify-center overflow-hidden">
            <canvas ref="previewCanvas" class="max-w-full max-h-[300px] object-contain rounded" />
          </div>
        </div>
      </div>

      <!-- 去色模式 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">去色模式</h3>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            v-for="mode in modes"
            :key="mode.value"
            @click="currentMode = mode.value; applyEffect()"
            class="p-3 rounded-lg border-2 transition-all text-center"
            :class="currentMode === mode.value
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            "
          >
            <div class="text-2xl mb-1">{{ mode.icon }}</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ mode.label }}</div>
          </button>
        </div>

        <!-- 亮度/对比度微调 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              亮度调整: <span class="font-semibold text-blue-600">{{ brightness }}</span>
            </label>
            <el-slider v-model="brightness" :min="-100" :max="100" :step="1" @change="applyEffect" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              对比度调整: <span class="font-semibold text-blue-600">{{ contrast }}</span>
            </label>
            <el-slider v-model="contrast" :min="-100" :max="100" :step="1" @change="applyEffect" />
          </div>
        </div>

        <el-button @click="resetAdjustments">重置调整</el-button>
      </div>

      <!-- 下载 -->
      <div class="flex justify-center gap-3">
        <el-button type="primary" size="large" @click="download('png')">
          <el-icon><Download /></el-icon>
          下载 PNG
        </el-button>
        <el-button size="large" @click="download('jpg')">
          <el-icon><Download /></el-icon>
          下载 JPEG
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Upload, Download } from '@element-plus/icons-vue'

const fileInput = ref<HTMLInputElement>()
const previewCanvas = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const imageSrc = ref('')
const originalImage = ref<HTMLImageElement | null>(null)
const originalImageData = ref<ImageData | null>(null)
const currentMode = ref('grayscale')
const brightness = ref(0)
const contrast = ref(0)

const modes = [
  { value: 'grayscale', label: '灰度', icon: '⬛' },
  { value: 'sepia', label: '复古', icon: '🟤' },
  { value: 'invert', label: '反色', icon: '🔄' },
  { value: 'binary', label: '黑白', icon: '🔲' },
]

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
    const canvas = previewCanvas.value!
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    originalImageData.value = ctx.getImageData(0, 0, canvas.width, canvas.height)
    applyEffect()
  }
  img.src = imageSrc.value
}

const applyEffect = () => {
  const canvas = previewCanvas.value
  if (!canvas || !originalImageData.value) return
  const ctx = canvas.getContext('2d')!
  const imageData = new ImageData(
    new Uint8ClampedArray(originalImageData.value.data),
    originalImageData.value.width,
    originalImageData.value.height
  )
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2]

    // 去色处理
    switch (currentMode.value) {
      case 'grayscale': {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        r = g = b = gray
        break
      }
      case 'sepia': {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b
        const sg = 0.349 * r + 0.686 * g + 0.168 * b
        const sb = 0.272 * r + 0.534 * g + 0.131 * b
        r = Math.min(255, sr); g = Math.min(255, sg); b = Math.min(255, sb)
        break
      }
      case 'invert': {
        r = 255 - r; g = 255 - g; b = 255 - b
        break
      }
      case 'binary': {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        r = g = b = gray > 128 ? 255 : 0
        break
      }
    }

    // 亮度调整
    if (brightness.value !== 0) {
      r += brightness.value * 2.55
      g += brightness.value * 2.55
      b += brightness.value * 2.55
    }

    // 对比度调整
    if (contrast.value !== 0) {
      const factor = (259 * (contrast.value + 255)) / (255 * (259 - contrast.value))
      r = factor * (r - 128) + 128
      g = factor * (g - 128) + 128
      b = factor * (b - 128) + 128
    }

    data[i] = Math.max(0, Math.min(255, r))
    data[i + 1] = Math.max(0, Math.min(255, g))
    data[i + 2] = Math.max(0, Math.min(255, b))
  }

  ctx.putImageData(imageData, 0, 0)
}

const resetAdjustments = () => {
  brightness.value = 0
  contrast.value = 0
  applyEffect()
}

const download = (format: 'png' | 'jpg') => {
  const canvas = previewCanvas.value
  if (!canvas) return
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
  const url = canvas.toDataURL(mimeType, 0.95)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentMode.value}_${Date.now()}.${format}`
  a.click()
}

// 清理 Object URL 防止内存泄漏
onUnmounted(() => {
  if (imageSrc.value && typeof imageSrc.value === "string") URL.revokeObjectURL(imageSrc.value)
})
</script>
