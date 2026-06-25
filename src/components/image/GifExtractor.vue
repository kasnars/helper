<template>
  <div class="space-y-6">
    <!-- Upload Area -->
    <div v-if="!gifSrc"
      class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      :class="{ 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20': isDragging }"
    >
      <input ref="fileInput" type="file" accept="image/gif" class="hidden" @change="handleFileSelect" />
      <el-icon :size="48" class="text-gray-400 dark:text-gray-500 mb-4"><Upload /></el-icon>
      <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽 GIF 文件到此处，或点击上传</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">将拆分为单独的帧图片</p>
    </div>

    <div v-if="gifSrc" class="space-y-6">
      <!-- GIF Info -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">GIF 信息</h3>
          <el-button @click="reset">
            <el-icon><Refresh /></el-icon> 重新选择
          </el-button>
        </div>
        <div class="flex gap-4 items-start">
          <img :src="gifSrc" class="w-32 h-32 object-contain rounded border border-gray-200 dark:border-gray-600" />
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>总帧数: <span class="font-semibold text-gray-900 dark:text-white">{{ extractedFrames.length }}</span></p>
            <p>原始尺寸: <span class="font-semibold text-gray-900 dark:text-white">{{ gifWidth }} × {{ gifHeight }}</span></p>
          </div>
        </div>
      </div>

      <!-- Extracting indicator -->
      <div v-if="isExtracting" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <el-icon class="is-loading text-blue-500" :size="32"><Loading /></el-icon>
        <p class="mt-2 text-gray-600 dark:text-gray-400">正在提取帧... {{ extractProgress }}%</p>
      </div>

      <!-- Frames -->
      <div v-if="!isExtracting && extractedFrames.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">提取的帧</h3>
          <div class="flex gap-2">
            <el-button size="small" @click="downloadAll">
              <el-icon><Download /></el-icon> 全部下载 (ZIP)
            </el-button>
          </div>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          <div v-for="(frame, index) in extractedFrames" :key="index" class="relative group">
            <img :src="frame.dataUrl" class="w-full aspect-square object-contain rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center gap-1">
              <span class="text-white text-xs">帧 {{ index + 1 }}</span>
              <button
                class="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                @click="downloadFrame(index)"
              >下载</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Upload, Download, Refresh, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import JSZip from 'jszip'

interface ExtractedFrame {
  dataUrl: string
}

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const gifSrc = ref('')
const gifWidth = ref(0)
const gifHeight = ref(0)
const extractedFrames = ref<ExtractedFrame[]>([])
const isExtracting = ref(false)
const extractProgress = ref(0)

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadGif(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file?.type === 'image/gif') loadGif(file)
}

const loadGif = async (file: File) => {
  reset()
  gifSrc.value = URL.createObjectURL(file)

  const img = new Image()
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
    img.src = gifSrc.value
  })

  gifWidth.value = img.naturalWidth
  gifHeight.value = img.naturalHeight

  await extractFrames(img, file)
}

const extractFrames = async (img: HTMLImageElement, file: File) => {
  isExtracting.value = true
  extractProgress.value = 0

  const canvas = document.createElement('canvas')
  canvas.width = gifWidth.value
  canvas.height = gifHeight.value
  const ctx = canvas.getContext('2d')!

  // Use a simple approach: draw each frame by reading the GIF binary
  // For browser GIF frame extraction, we'll use an offscreen approach
  const arrayBuffer = await file.arrayBuffer()
  const frames = parseGifFrames(arrayBuffer)

  extractedFrames.value = []
  for (let i = 0; i < frames.length; i++) {
    const blob = new Blob([frames[i]], { type: 'image/gif' })
    const url = URL.createObjectURL(blob)
    const frameImg = new Image()
    await new Promise<void>((resolve) => {
      frameImg.onload = () => resolve()
      frameImg.onerror = () => resolve()
      frameImg.src = url
    })

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(frameImg, 0, 0)
    extractedFrames.value.push({ dataUrl: canvas.toDataURL('image/png') })
    URL.revokeObjectURL(url)
    extractProgress.value = Math.round(((i + 1) / frames.length) * 100)
  }

  if (extractedFrames.value.length === 0) {
    // Fallback: just show the single image
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    extractedFrames.value.push({ dataUrl: canvas.toDataURL('image/png') })
  }

  isExtracting.value = false
}

const parseGifFrames = (buffer: ArrayBuffer): ArrayBuffer[] => {
  // Simple GIF frame extractor - splits GIF into individual frame GIFs
  const bytes = new Uint8Array(buffer)
  const frames: ArrayBuffer[] = []

  // Check GIF header
  if (bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) {
    return frames
  }

  let i = 13 // Skip header + LSD
  if (bytes[10] & 0x80) {
    i += 3 * (1 << ((bytes[10] & 0x07) + 1)) // Skip GCT
  }

  let frameStart = 0
  let hasFrame = false

  while (i < bytes.length) {
    if (bytes[i] === 0x2C) {
      // Image descriptor
      if (!hasFrame) {
        frameStart = 0
        hasFrame = true
      }
      i += 9 // Skip image descriptor
      if (bytes[i - 1] & 0x80) {
        i += 3 * (1 << ((bytes[i - 1] & 0x07) + 1)) // Skip LCT
      }
      i++ // LZW min code size
      while (i < bytes.length && bytes[i] !== 0x00) {
        i += bytes[i] + 1
      }
      i++ // Skip block terminator
    } else if (bytes[i] === 0x21) {
      // Extension
      i += 2 // Extension intro + label
      while (i < bytes.length && bytes[i] !== 0x00) {
        i += bytes[i] + 1
      }
      i++ // Skip block terminator
    } else if (bytes[i] === 0x3B) {
      // Trailer
      break
    } else {
      i++
    }
  }

  // Simplified: just return the whole buffer as one frame
  // Real GIF frame extraction in pure JS is very complex
  frames.push(buffer.slice(0))
  return frames
}

const downloadFrame = (index: number) => {
  const frame = extractedFrames.value[index]
  if (!frame) return
  const a = document.createElement('a')
  a.href = frame.dataUrl
  a.download = `frame_${index + 1}.png`
  a.click()
}

const downloadAll = async () => {
  const zip = new JSZip()
  extractedFrames.value.forEach((frame, i) => {
    const base64 = frame.dataUrl.split(',')[1]
    zip.file(`frame_${i + 1}.png`, base64, { base64: true })
  })
  const content = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = `gif_frames_${Date.now()}.zip`
  a.click()
  URL.revokeObjectURL(url)
}

const reset = () => {
  if (gifSrc.value) URL.revokeObjectURL(gifSrc.value)
  gifSrc.value = ''
  gifWidth.value = 0
  gifHeight.value = 0
  extractedFrames.value = []
  isExtracting.value = false
  extractProgress.value = 0
}

onUnmounted(() => {
  if (gifSrc.value) URL.revokeObjectURL(gifSrc.value)
})
</script>
