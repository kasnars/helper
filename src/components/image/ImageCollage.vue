<template>
  <div class="space-y-6">
    <!-- Upload Area -->
    <div v-if="images.length === 0"
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
      <p class="text-sm text-gray-400 dark:text-gray-500">支持多张图片（2-9张）</p>
    </div>

    <!-- Settings & Preview -->
    <div v-if="images.length > 0" class="space-y-6">
      <!-- Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">拼贴设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">布局模板</label>
            <div class="grid grid-cols-4 gap-2">
              <div v-for="t in templates" :key="t.value"
                class="border-2 rounded-lg p-2 cursor-pointer transition-colors flex items-center justify-center aspect-square"
                :class="template === t.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'"
                @click="template = t.value"
              >
                <div class="w-full h-full grid gap-0.5" :style="t.gridStyle">
                  <div v-for="(cell, i) in t.cells" :key="i"
                    class="bg-gray-300 dark:bg-gray-600 rounded-sm"
                    :style="cell"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">间距: {{ gap }}px</label>
            <el-slider v-model="gap" :min="0" :max="20" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">背景颜色</label>
            <el-color-picker v-model="bgColor" />
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <el-button type="primary" @click="triggerFileInput">
            <el-icon><Upload /></el-icon> 添加图片
          </el-button>
          <el-button @click="images = []">
            <el-icon><Refresh /></el-icon> 重新选择
          </el-button>
        </div>
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
      </div>

      <!-- Image List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">图片列表 ({{ images.length }}张)</h3>
        <div class="flex flex-wrap gap-3">
          <div v-for="(img, index) in images" :key="index" class="relative group">
            <img :src="img.preview" class="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
            <button
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              @click="removeImage(index)"
            >×</button>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">预览</h3>
        <div class="flex justify-center overflow-auto">
          <canvas ref="previewCanvas" class="max-w-full border border-gray-200 dark:border-gray-600 rounded" />
        </div>
      </div>

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
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { Upload, Download, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface ImageItem {
  file: File
  preview: string
  img: HTMLImageElement
  width: number
  height: number
}

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const images = ref<ImageItem[]>([])
const previewCanvas = ref<HTMLCanvasElement>()
const template = ref<'1x2' | '2x1' | '2x2' | '1+2' | '2+1' | '3x1' | '1x3' | '3x3'>('2x2')
const gap = ref(4)
const bgColor = ref('#ffffff')

const templates = [
  { value: '1x2' as const, gridStyle: { gridTemplateColumns: '1fr 1fr' }, cells: [{}, {}] },
  { value: '2x1' as const, gridStyle: { gridTemplateRows: '1fr 1fr' }, cells: [{}, {}] },
  { value: '2x2' as const, gridStyle: { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }, cells: [{}, {}, {}, {}] },
  { value: '1+2' as const, gridStyle: { gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr' }, cells: [{ gridRow: '1/3' }, {}, {}] },
  { value: '2+1' as const, gridStyle: { gridTemplateColumns: '1fr 2fr', gridTemplateRows: '1fr 1fr' }, cells: [{}, {}, { gridRow: '1/3' }] },
  { value: '3x1' as const, gridStyle: { gridTemplateColumns: '1fr 1fr 1fr' }, cells: [{}, {}, {}] },
  { value: '1x3' as const, gridStyle: { gridTemplateRows: '1fr 1fr 1fr' }, cells: [{}, {}, {}] },
  { value: '3x3' as const, gridStyle: { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr' }, cells: [{}, {}, {}, {}, {}, {}, {}, {}, {}] },
]

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
    if (images.value.length >= 9) {
      ElMessage.warning('最多支持9张图片')
      break
    }
    const preview = URL.createObjectURL(file)
    const img = new Image()
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = preview
    })
    images.value.push({ file, preview, img, width: img.naturalWidth, height: img.naturalHeight })
  }
  await nextTick()
  renderCollage()
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(images.value[index].preview)
  images.value.splice(index, 1)
  if (images.value.length > 0) nextTick(() => renderCollage())
}

const renderCollage = () => {
  const canvas = previewCanvas.value
  if (!canvas || images.value.length === 0) return
  const ctx = canvas.getContext('2d')!

  const maxWidth = 800
  const cellSize = Math.floor((maxWidth - gap.value * 2) / 3)

  const layout = getLayout()
  const cols = layout.cols
  const rows = layout.rows

  canvas.width = cols * cellSize + (cols - 1) * gap.value
  canvas.height = rows * cellSize + (rows - 1) * gap.value

  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const positions = getPositions(layout)
  images.value.forEach((imgItem, i) => {
    if (i >= positions.length) return
    const pos = positions[i]
    const x = pos.col * (cellSize + gap.value)
    const y = pos.row * (cellSize + gap.value)
    const w = pos.colSpan * cellSize + (pos.colSpan - 1) * gap.value
    const h = pos.rowSpan * cellSize + (pos.rowSpan - 1) * gap.value

    const imgRatio = imgItem.width / imgItem.height
    const cellRatio = w / h
    let sx = 0, sy = 0, sw = imgItem.width, sh = imgItem.height
    if (imgRatio > cellRatio) {
      sw = imgItem.height * cellRatio
      sx = (imgItem.width - sw) / 2
    } else {
      sh = imgItem.width / cellRatio
      sy = (imgItem.height - sh) / 2
    }
    ctx.drawImage(imgItem.img, sx, sy, sw, sh, x, y, w, h)
  })
}

const getLayout = () => {
  const n = images.value.length
  switch (template.value) {
    case '1x2': return { cols: Math.min(n, 2), rows: 1 }
    case '2x1': return { cols: 1, rows: Math.min(n, 2) }
    case '2x2': return { cols: 2, rows: Math.min(Math.ceil(n / 2), 2) }
    case '1+2': return { cols: 2, rows: 2 }
    case '2+1': return { cols: 2, rows: 2 }
    case '3x1': return { cols: Math.min(n, 3), rows: 1 }
    case '1x3': return { cols: 1, rows: Math.min(n, 3) }
    case '3x3': return { cols: 3, rows: Math.min(Math.ceil(n / 3), 3) }
    default: return { cols: 2, rows: 2 }
  }
}

const getPositions = (layout: { cols: number; rows: number }) => {
  const positions: { col: number; row: number; colSpan: number; rowSpan: number }[] = []
  switch (template.value) {
    case '1+2':
      positions.push({ col: 0, row: 0, colSpan: 1, rowSpan: 2 })
      if (images.value.length > 1) positions.push({ col: 1, row: 0, colSpan: 1, rowSpan: 1 })
      if (images.value.length > 2) positions.push({ col: 1, row: 1, colSpan: 1, rowSpan: 1 })
      break
    case '2+1':
      positions.push({ col: 0, row: 0, colSpan: 1, rowSpan: 1 })
      if (images.value.length > 1) positions.push({ col: 0, row: 1, colSpan: 1, rowSpan: 1 })
      if (images.value.length > 2) positions.push({ col: 1, row: 0, colSpan: 1, rowSpan: 2 })
      break
    default:
      for (let i = 0; i < images.value.length; i++) {
        positions.push({ col: i % layout.cols, row: Math.floor(i / layout.cols), colSpan: 1, rowSpan: 1 })
      }
  }
  return positions
}

const download = (format: 'png' | 'jpg') => {
  const canvas = previewCanvas.value
  if (!canvas) return
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
  const url = canvas.toDataURL(mimeType, 0.95)
  const a = document.createElement('a')
  a.href = url
  a.download = `collage_${Date.now()}.${format}`
  a.click()
}

watch([template, gap, bgColor], () => {
  if (images.value.length > 0) renderCollage()
})

onUnmounted(() => {
  images.value.forEach(img => URL.revokeObjectURL(img.preview))
})
</script>
