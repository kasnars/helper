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
          <p class="text-sm text-gray-500 mb-2">像素画预览</p>
          <div class="flex justify-center overflow-hidden">
            <canvas ref="previewCanvas" class="max-w-full max-h-[300px] object-contain rounded" />
          </div>
        </div>
      </div>

      <!-- 参数设置 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">像素化设置</h3>

        <!-- 像素块大小 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
            像素块大小: <span class="font-semibold text-blue-600">{{ pixelSize }}px</span>
          </label>
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="size in pixelSizeOptions"
              :key="size"
              @click="pixelSize = size; applyPixelation()"
              class="p-3 rounded-lg border-2 transition-all text-center"
              :class="pixelSize === size
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              "
            >
              <div class="text-lg font-bold text-gray-900 dark:text-white">{{ size }}</div>
              <div class="text-xs text-gray-500">{{ size === 4 ? '精细' : size === 8 ? '适中' : size === 16 ? '粗糙' : '极粗糙' }}</div>
            </button>
          </div>
        </div>

        <!-- 颜色数量 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
            颜色数量: <span class="font-semibold text-blue-600">{{ colorCount }}色</span>
          </label>
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="count in colorCountOptions"
              :key="count"
              @click="colorCount = count; applyPixelation()"
              class="p-3 rounded-lg border-2 transition-all text-center"
              :class="colorCount === count
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              "
            >
              <div class="text-lg font-bold text-gray-900 dark:text-white">{{ count }}</div>
              <div class="text-xs text-gray-500">色</div>
            </button>
          </div>
        </div>

        <!-- 实时预览开关 -->
        <div class="flex items-center gap-3">
          <el-switch v-model="realtimePreview" @change="handleRealtimeToggle" />
          <span class="text-sm text-gray-600 dark:text-gray-400">实时预览</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-center gap-3">
        <el-button v-if="!realtimePreview" type="primary" @click="applyPixelation">
          <el-icon><Refresh /></el-icon>
          应用效果
        </el-button>
        <el-button type="primary" size="large" @click="download('png')">
          <el-icon><Download /></el-icon>
          下载像素画 PNG
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
import { ref, watch } from 'vue'
import { Upload, Download, Refresh } from '@element-plus/icons-vue'

const fileInput = ref<HTMLInputElement>()
const previewCanvas = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const imageSrc = ref('')
const originalImage = ref<HTMLImageElement | null>(null)
const pixelSize = ref(8)
const colorCount = ref(16)
const realtimePreview = ref(true)

const pixelSizeOptions = [4, 8, 16, 32]
const colorCountOptions = [8, 16, 32, 64]

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
    applyPixelation()
  }
  img.src = imageSrc.value
}

// 量化颜色
const quantizeColor = (r: number, g: number, b: number, levels: number): [number, number, number] => {
  const step = 255 / (levels - 1)
  const qr = Math.round(r / step) * step
  const qg = Math.round(g / step) * step
  const qb = Math.round(b / step) * step
  return [Math.min(255, qr), Math.min(255, qg), Math.min(255, qb)]
}

const applyPixelation = () => {
  const canvas = previewCanvas.value
  const img = originalImage.value
  if (!canvas || !img) return

  const ctx = canvas.getContext('2d')!
  const size = pixelSize.value

  // 计算缩放后的尺寸
  const scaledW = Math.floor(img.naturalWidth / size)
  const scaledH = Math.floor(img.naturalHeight / size)

  // 先画到临时 canvas 缩小
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = scaledW
  tmpCanvas.height = scaledH
  const tmpCtx = tmpCanvas.getContext('2d')!
  tmpCtx.drawImage(img, 0, 0, scaledW, scaledH)

  // 读取像素数据并量化颜色
  const imageData = tmpCtx.getImageData(0, 0, scaledW, scaledH)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const [qr, qg, qb] = quantizeColor(data[i], data[i + 1], data[i + 2], colorCount.value)
    data[i] = qr
    data[i + 1] = qg
    data[i + 2] = qb
  }
  tmpCtx.putImageData(imageData, 0, 0)

  // 设置目标画布尺寸（像素化后的实际像素数）
  canvas.width = scaledW
  canvas.height = scaledH

  // 禁用抗锯齿，画出像素块效果
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(tmpCanvas, 0, 0)
}

const handleRealtimeToggle = (val: boolean) => {
  if (val) applyPixelation()
}

// 监听参数变化
watch(pixelSize, () => {
  if (realtimePreview.value) applyPixelation()
})
watch(colorCount, () => {
  if (realtimePreview.value) applyPixelation()
})

const download = (format: 'png' | 'jpg') => {
  const canvas = previewCanvas.value
  if (!canvas) return
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
  const url = canvas.toDataURL(mimeType, 0.95)
  const a = document.createElement('a')
  a.href = url
  a.download = `pixel_art_${pixelSize.value}px_${colorCount.value}colors_${Date.now()}.${format}`
  a.click()
}
</script>
