<template>
  <div class="space-y-6">
    <!-- 上传区域 -->
    <div
      v-if="!imageSrc"
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

    <!-- 切图操作区域 -->
    <div v-if="imageSrc" class="space-y-4">
      <!-- 原图预览 -->
      <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 overflow-auto">
        <canvas ref="previewCanvas" class="max-w-full max-h-[350px] object-contain mx-auto block" />
      </div>

      <!-- 切图模式选择 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h3 class="font-semibold text-gray-900 dark:text-white">切图设置</h3>
        <div class="flex flex-wrap gap-2">
          <el-radio-group v-model="gridMode" @change="onModeChange">
            <el-radio-button :value="'3x3'">3×3 九宫格</el-radio-button>
            <el-radio-button :value="'2x2'">2×2 四宫格</el-radio-button>
            <el-radio-button :value="'4x4'">4×4 十六宫格</el-radio-button>
          </el-radio-group>
        </div>
        <div class="flex gap-2 flex-wrap">
          <el-button type="primary" @click="splitImage">
            <el-icon><Grid /></el-icon>
            开始切图
          </el-button>
          <el-button @click="resetImage">
            <el-icon><RefreshRight /></el-icon>
            重新上传
          </el-button>
        </div>
      </div>

      <!-- 切图结果 -->
      <div v-if="splits.length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            切图预览（共 {{ splits.length }} 张）
          </h3>
          <el-button type="success" @click="downloadAll" :loading="downloading">
            <el-icon><Download /></el-icon>
            一键下载 ZIP
          </el-button>
        </div>

        <!-- 九宫格预览 -->
        <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 overflow-auto">
          <canvas ref="gridCanvas" class="max-w-full max-h-[400px] object-contain mx-auto block" />
        </div>

        <!-- 单张预览列表 -->
        <div class="grid gap-3" :class="gridColsClass">
          <div
            v-for="(split, index) in splits"
            :key="index"
            class="relative group bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors"
            :class="selectedSplit === index ? 'border-blue-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'"
            @click="selectedSplit = index"
          >
            <img :src="split.dataUrl" class="w-full aspect-square object-cover" />
            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
              {{ split.row + 1 }}-{{ split.col + 1 }}
            </div>
          </div>
        </div>

        <!-- 选中切图放大预览 -->
        <div v-if="selectedSplit >= 0 && splits[selectedSplit]" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-gray-900 dark:text-white">
              第 {{ splits[selectedSplit].row + 1 }} 行，第 {{ splits[selectedSplit].col + 1 }} 列
            </h4>
            <div class="flex gap-2">
              <el-button size="small" @click="previewSingle(selectedSplit)">
                <el-icon><View /></el-icon> 预览
              </el-button>
              <el-button size="small" type="primary" @click="downloadSingle(selectedSplit)">
                <el-icon><Download /></el-icon> 下载
              </el-button>
            </div>
          </div>
          <div class="flex justify-center">
            <img :src="splits[selectedSplit].dataUrl" class="max-w-full max-h-[300px] object-contain rounded-lg" />
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            {{ splits[selectedSplit].width }} × {{ splits[selectedSplit].height }} px
          </p>
        </div>
      </div>
    </div>

    <!-- 单张预览弹窗 -->
    <el-dialog v-model="previewVisible" title="切图预览" width="60%" :close-on-click-modal="true" destroy-on-close>
      <div class="flex justify-center">
        <img v-if="previewDataUrl" :src="previewDataUrl" class="max-w-full max-h-[60vh] object-contain" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick , onUnmounted} from 'vue'
import { Upload, Grid, RefreshRight, Download, View } from '@element-plus/icons-vue'
import JSZip from 'jszip'

interface SplitPiece {
  dataUrl: string
  blob: Blob
  row: number
  col: number
  width: number
  height: number
}

const fileInput = ref<HTMLInputElement>()
const previewCanvas = ref<HTMLCanvasElement>()
const gridCanvas = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const imageSrc = ref('')
const originalImage = ref<HTMLImageElement | null>(null)
const gridMode = ref<'3x3' | '2x2' | '4x4'>('3x3')
const splits = ref<SplitPiece[]>([])
const selectedSplit = ref(-1)
const downloading = ref(false)
const previewVisible = ref(false)
const previewDataUrl = ref('')

const gridColsClass = computed(() => {
  const mode = gridMode.value
  if (mode === '2x2') return 'grid-cols-2'
  if (mode === '3x3') return 'grid-cols-3'
  return 'grid-cols-4'
})

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
    drawPreview(img)
  }
  img.src = imageSrc.value
}

const drawPreview = (img: HTMLImageElement) => {
  const canvas = previewCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const { cols, rows } = getGridSize()

  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)

  // 绘制网格线
  const cellW = canvas.width / cols
  const cellH = canvas.height / rows

  ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)'
  ctx.lineWidth = 2

  // 竖线
  for (let c = 1; c < cols; c++) {
    const x = c * cellW
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  // 横线
  for (let r = 1; r < rows; r++) {
    const y = r * cellH
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
}

const getGridSize = () => {
  if (gridMode.value === '2x2') return { cols: 2, rows: 2 }
  if (gridMode.value === '3x3') return { cols: 3, rows: 3 }
  return { cols: 4, rows: 4 }
}

const onModeChange = () => {
  splits.value = []
  selectedSplit.value = -1
  if (originalImage.value) drawPreview(originalImage.value)
}

const splitImage = async () => {
  if (!originalImage.value) return
  const img = originalImage.value
  const { cols, rows } = getGridSize()
  const cellW = Math.floor(img.naturalWidth / cols)
  const cellH = Math.floor(img.naturalHeight / rows)

  const pieces: SplitPiece[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const canvas = document.createElement('canvas')
      canvas.width = cellW
      canvas.height = cellH
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, c * cellW, r * cellH, cellW, cellH, 0, 0, cellW, cellH)

      const dataUrl = canvas.toDataURL('image/png')
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(b => resolve(b!), 'image/png')
      })

      pieces.push({ dataUrl, blob, row: r, col: c, width: cellW, height: cellH })
    }
  }

  splits.value = pieces
  selectedSplit.value = -1

  await nextTick()
  drawGridPreview(img, cols, rows)
}

const drawGridPreview = (img: HTMLImageElement, cols: number, rows: number) => {
  const canvas = gridCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const padding = 4
  const gap = 2
  const cellW = Math.floor(img.naturalWidth / cols)
  const cellH = Math.floor(img.naturalHeight / rows)
  const thumbScale = Math.min(1, 400 / (cellW * cols + gap * (cols - 1) + padding * 2))
  const tw = Math.floor(cellW * thumbScale)
  const th = Math.floor(cellH * thumbScale)

  canvas.width = tw * cols + gap * (cols - 1) + padding * 2
  canvas.height = th * rows + gap * (rows - 1) + padding * 2

  ctx.fillStyle = '#374151'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padding + c * (tw + gap)
      const y = padding + r * (th + gap)
      ctx.drawImage(img, c * cellW, r * cellH, cellW, cellH, x, y, tw, th)
      // 编号标签
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(x, y + th - 16, tw, 16)
      ctx.fillStyle = '#fff'
      ctx.font = `${Math.max(10, Math.floor(th / 6))}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(`${r + 1}-${c + 1}`, x + tw / 2, y + th - 3)
    }
  }
}

const previewSingle = (index: number) => {
  previewDataUrl.value = splits.value[index].dataUrl
  previewVisible.value = true
}

const downloadSingle = (index: number) => {
  const piece = splits.value[index]
  const a = document.createElement('a')
  a.href = piece.dataUrl
  a.download = `grid_${piece.row + 1}-${piece.col + 1}.png`
  a.click()
}

const downloadAll = async () => {
  if (splits.value.length === 0) return
  downloading.value = true
  try {
    const zip = new JSZip()
    for (const piece of splits.value) {
      zip.file(`grid_${piece.row + 1}-${piece.col + 1}.png`, piece.blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `grid_split_${gridMode.value}_${Date.now()}.zip`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    downloading.value = false
  }
}

const resetImage = () => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
  imageSrc.value = ''
  originalImage.value = null
  splits.value = []
  selectedSplit.value = -1
}

// 清理 Object URL 防止内存泄漏
onUnmounted(() => {
  if (imageSrc.value && typeof imageSrc.value === "string") URL.revokeObjectURL(imageSrc.value)
})
</script>
