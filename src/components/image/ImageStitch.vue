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
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
      <el-icon :size="48" class="text-gray-400 dark:text-gray-500 mb-4"><Upload /></el-icon>
      <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽图片到此处，或点击上传</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">支持多张图片，按上传顺序拼接</p>
    </div>

    <!-- 图片列表 & 设置 -->
    <div v-if="images.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">已选择 {{ images.length }} 张图片</h3>
        <el-button type="danger" link @click="clearAll"><el-icon><Delete /></el-icon> 清空</el-button>
      </div>

      <!-- 图片预览列表（可拖拽排序） -->
      <div class="flex flex-wrap gap-3">
        <div v-for="(img, index) in images" :key="index" class="relative group">
          <img :src="img.preview" class="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
          <button @click="removeImage(index)" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <el-icon :size="10"><Close /></el-icon>
          </button>
          <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 rounded-b-lg">{{ index + 1 }}</div>
        </div>
      </div>

      <!-- 拼接设置 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">拼接方向</label>
          <el-radio-group v-model="direction">
            <el-radio-button label="vertical">纵向</el-radio-button>
            <el-radio-button label="horizontal">横向</el-radio-button>
          </el-radio-group>
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">间距 (px)</label>
          <el-input-number v-model="gap" :min="0" :max="50" />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">背景色</label>
          <el-color-picker v-model="bgColor" show-alpha />
        </div>
      </div>

      <el-button type="primary" @click="stitch" :loading="processing">
        <el-icon><Switch /></el-icon>
        开始拼接
      </el-button>
    </div>

    <!-- 结果预览 -->
    <div v-if="resultUrl" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">拼接结果</h3>
        <el-button type="primary" @click="download">
          <el-icon><Download /></el-icon>
          下载图片
        </el-button>
      </div>
      <div class="flex justify-center overflow-auto">
        <img :src="resultUrl" class="max-w-full max-h-[500px] object-contain rounded-lg border border-gray-200 dark:border-gray-700" />
      </div>
      <p class="text-sm text-gray-500 mt-2 text-center">{{ resultWidth }} × {{ resultHeight }} px</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Close, Delete, Switch, Download } from '@element-plus/icons-vue'

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const processing = ref(false)
const images = ref<{ file: File; preview: string; width: number; height: number }[]>([])
const direction = ref<'vertical' | 'horizontal'>('vertical')
const gap = ref(0)
const bgColor = ref('#ffffff')
const resultUrl = ref('')
const resultWidth = ref(0)
const resultHeight = ref(0)

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(Array.from(files))
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files))
}

const addFiles = async (files: File[]) => {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const preview = URL.createObjectURL(file)
    const img = new Image()
    await new Promise<void>(resolve => { img.onload = () => resolve(); img.src = preview })
    images.value.push({ file, preview, width: img.naturalWidth, height: img.naturalHeight })
  }
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(images.value[index].preview)
  images.value.splice(index, 1)
}

const clearAll = () => {
  images.value.forEach(img => URL.revokeObjectURL(img.preview))
  images.value = []
  resultUrl.value = ''
}

const stitch = async () => {
  if (images.value.length < 2) return
  processing.value = true

  const loadedImages: HTMLImageElement[] = []
  for (const img of images.value) {
    const el = new Image()
    await new Promise<void>(resolve => { el.onload = () => resolve(); el.src = img.preview })
    loadedImages.push(el)
  }

  const g = gap.value
  let canvasW: number, canvasH: number

  if (direction.value === 'vertical') {
    // 统一宽度到第一张图
    const targetW = loadedImages[0].naturalWidth
    canvasW = targetW
    canvasH = loadedImages.reduce((sum, img) => sum + (img.naturalHeight / img.naturalWidth) * targetW, 0) + g * (loadedImages.length - 1)
  } else {
    const targetH = loadedImages[0].naturalHeight
    canvasH = targetH
    canvasW = loadedImages.reduce((sum, img) => sum + (img.naturalWidth / img.naturalHeight) * targetH, 0) + g * (loadedImages.length - 1)
  }

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // 背景色
  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, canvasW, canvasH)

  let offset = 0
  for (const img of loadedImages) {
    if (direction.value === 'vertical') {
      const targetW = loadedImages[0].naturalWidth
      const drawH = (img.naturalHeight / img.naturalWidth) * targetW
      ctx.drawImage(img, 0, offset, targetW, drawH)
      offset += drawH + g
    } else {
      const targetH = loadedImages[0].naturalHeight
      const drawW = (img.naturalWidth / img.naturalHeight) * targetH
      ctx.drawImage(img, offset, 0, drawW, targetH)
      offset += drawW + g
    }
  }

  resultUrl.value = canvas.toDataURL('image/png')
  resultWidth.value = canvasW
  resultHeight.value = canvasH
  processing.value = false
}

const download = () => {
  const a = document.createElement('a')
  a.href = resultUrl.value
  a.download = `stitched_${Date.now()}.png`
  a.click()
}
</script>
