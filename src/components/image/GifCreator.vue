<template>
  <div class="space-y-6">
    <!-- Upload Area -->
    <div v-if="frames.length === 0"
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
      <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽多张图片到此处，或点击上传</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">每张图片将作为 GIF 的一帧</p>
    </div>

    <div v-if="frames.length > 0" class="space-y-6">
      <!-- Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">GIF 设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">帧延迟: {{ delay }}ms</label>
            <el-slider v-model="delay" :min="50" :max="2000" :step="50" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">输出宽度: {{ outputWidth }}px</label>
            <el-slider v-model="outputWidth" :min="50" :max="800" :step="10" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">循环: {{ loopCount === 0 ? '无限' : loopCount + '次' }}</label>
            <el-slider v-model="loopCount" :min="0" :max="10" />
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <el-button type="primary" @click="triggerFileInput">
            <el-icon><Upload /></el-icon> 添加帧
          </el-button>
          <el-button @click="frames = []">
            <el-icon><Refresh /></el-icon> 清空
          </el-button>
        </div>
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
      </div>

      <!-- Frame List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">帧列表 ({{ frames.length }}帧)</h3>
        <div class="flex flex-wrap gap-3">
          <div v-for="(frame, index) in frames" :key="index" class="relative group">
            <img :src="frame.preview" class="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
            <span class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5 rounded-b-lg">{{ index + 1 }}</span>
            <button
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              @click="removeFrame(index)"
            >×</button>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">预览</h3>
        <div class="flex flex-col items-center gap-4">
          <canvas ref="previewCanvas" class="border border-gray-200 dark:border-gray-600 rounded" />
          <div class="flex gap-2">
            <el-button v-if="!isPlaying" type="primary" @click="play">
              <el-icon><VideoPlay /></el-icon> 播放
            </el-button>
            <el-button v-else @click="stop">
              <el-icon><VideoPause /></el-icon> 暂停
            </el-button>
            <span class="text-sm text-gray-500 dark:text-gray-400 self-center">
              帧 {{ currentFrame + 1 }} / {{ frames.length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Download -->
      <div class="flex gap-3 justify-center">
        <el-button type="primary" :loading="isEncoding" @click="encodeGif">
          <el-icon><Download /></el-icon> 生成 GIF
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { Upload, Download, Refresh, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import GIF from 'gif.js'

interface FrameItem {
  file: File
  preview: string
  img: HTMLImageElement
}

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const frames = ref<FrameItem[]>([])
const previewCanvas = ref<HTMLCanvasElement>()
const delay = ref(200)
const outputWidth = ref(300)
const loopCount = ref(0)
const isPlaying = ref(false)
const isEncoding = ref(false)
const currentFrame = ref(0)
let playTimer: ReturnType<typeof setInterval> | null = null

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(Array.from(files))
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    addFiles(imageFiles)
  }
}

const addFiles = async (files: File[]) => {
  for (const file of files) {
    const preview = URL.createObjectURL(file)
    const img = new Image()
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = preview
    })
    frames.value.push({ file, preview, img })
  }
  await nextTick()
  if (frames.value.length > 0) drawFrame(0)
}

const removeFrame = (index: number) => {
  URL.revokeObjectURL(frames.value[index].preview)
  frames.value.splice(index, 1)
  if (frames.value.length > 0) {
    currentFrame.value = Math.min(currentFrame.value, frames.value.length - 1)
    drawFrame(currentFrame.value)
  }
}

const drawFrame = (index: number) => {
  const canvas = previewCanvas.value
  if (!canvas || !frames.value[index]) return
  const ctx = canvas.getContext('2d')!
  const frame = frames.value[index]
  const ratio = frame.img.naturalHeight / frame.img.naturalWidth
  canvas.width = outputWidth.value
  canvas.height = Math.round(outputWidth.value * ratio)
  ctx.drawImage(frame.img, 0, 0, canvas.width, canvas.height)
  currentFrame.value = index
}

const play = () => {
  if (frames.value.length < 2) return
  isPlaying.value = true
  playTimer = setInterval(() => {
    const next = (currentFrame.value + 1) % frames.value.length
    drawFrame(next)
  }, delay.value)
}

const stop = () => {
  isPlaying.value = false
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

const encodeGif = async () => {
  if (frames.value.length < 2) {
    ElMessage.warning('至少需要2帧')
    return
  }
  stop()
  isEncoding.value = true

  try {
    const firstFrame = frames.value[0]
    const ratio = firstFrame.img.naturalHeight / firstFrame.img.naturalWidth
    const width = outputWidth.value
    const height = Math.round(width * ratio)

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width,
      height,
      repeat: loopCount.value === 0 ? 0 : loopCount.value,
    })

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')!

    for (const frame of frames.value) {
      tempCtx.clearRect(0, 0, width, height)
      tempCtx.drawImage(frame.img, 0, 0, width, height)
      gif.addFrame(tempCtx, { copy: true, delay: delay.value })
    }

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `animation_${Date.now()}.gif`
      a.click()
      URL.revokeObjectURL(url)
      isEncoding.value = false
      ElMessage.success('GIF 生成成功')
    })

    gif.render()
  } catch (e) {
    isEncoding.value = false
    ElMessage.error('GIF 生成失败')
    console.error(e)
  }
}

onUnmounted(() => {
  stop()
  frames.value.forEach(f => URL.revokeObjectURL(f.preview))
})
</script>
