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
      <p class="text-sm text-gray-400 dark:text-gray-500">将图片转换为 ASCII 字符画</p>
    </div>

    <div v-if="imageSrc" class="space-y-6">
      <!-- Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">输出宽度: {{ outputWidth }} 字符</label>
            <el-slider v-model="outputWidth" :min="20" :max="200" @change="generate" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">字符集</label>
            <el-select v-model="charset" @change="generate">
              <el-option label="标准 (详细)" value="standard" />
              <el-option label="简单" value="simple" />
              <el-option label="密集" value="dense" />
              <el-option label="方块" value="blocks" />
            </el-select>
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">选项</label>
            <div class="space-y-2">
              <el-checkbox v-model="invert" @change="generate">反转明暗</el-checkbox>
            </div>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <el-button @click="reset">
            <el-icon><Refresh /></el-icon> 重新选择
          </el-button>
          <el-button type="primary" @click="copyText">
            <el-icon><CopyDocument /></el-icon> 复制文本
          </el-button>
          <el-button @click="downloadTxt">
            <el-icon><Download /></el-icon> 下载 .txt
          </el-button>
        </div>
      </div>

      <!-- Preview -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">预览</h3>
        <div class="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[500px]">
          <pre class="text-green-400 font-mono text-[6px] leading-[7px] whitespace-pre select-all">{{ asciiOutput }}</pre>
        </div>
      </div>

      <!-- HTML Preview (colored) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">彩色预览</h3>
        <div class="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[500px]">
          <div ref="colorPreview" class="font-mono text-[6px] leading-[7px] whitespace-pre" v-html="colorOutput" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { Upload, Download, Refresh, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const imageSrc = ref('')
const outputWidth = ref(80)
const charset = ref<'standard' | 'simple' | 'dense' | 'blocks'>('standard')
const invert = ref(false)
const asciiOutput = ref('')
const colorOutput = ref('')
const colorPreview = ref<HTMLDivElement>()

let originalImage: HTMLImageElement | null = null

const charsets = {
  standard: '@%#*+=-:. ',
  simple: '#@=-:. ',
  dense: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  blocks: '█▓▒░ ',
}

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
    originalImage = img
    nextTick(() => generate())
  }
  img.src = imageSrc.value
}

const generate = () => {
  if (!originalImage) return
  const img = originalImage
  const chars = charsets[charset.value]
  const w = outputWidth.value
  const ratio = img.naturalHeight / img.naturalWidth
  const charAspect = 0.5 // characters are taller than wide
  const h = Math.round(w * ratio * charAspect)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  const imgData = ctx.getImageData(0, 0, w, h)

  let ascii = ''
  let colored = ''
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const r = imgData.data[i]
      const g = imgData.data[i + 1]
      const b = imgData.data[i + 2]
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
      const idx = invert.value
        ? Math.round(brightness * (chars.length - 1))
        : Math.round((1 - brightness) * (chars.length - 1))
      const ch = chars[Math.min(idx, chars.length - 1)]
      ascii += ch
      colored += `<span style="color:rgb(${r},${g},${b})">${ch === ' ' ? '&nbsp;' : ch}</span>`
    }
    ascii += '\n'
    colored += '\n'
  }
  asciiOutput.value = ascii
  colorOutput.value = colored
}

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(asciiOutput.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadTxt = () => {
  const blob = new Blob([asciiOutput.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ascii_art_${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const reset = () => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
  imageSrc.value = ''
  originalImage = null
  asciiOutput.value = ''
  colorOutput.value = ''
}

onUnmounted(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
})
</script>
