<template>
  <div class="space-y-6">
    <!-- 上传区域 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">图片裁剪</h3>
      <div v-if="!imageSrc" class="space-y-4">
        <el-upload
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept="image/*"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽图片到此处或 <em>点击上传</em>
          </div>
        </el-upload>
      </div>

      <!-- 裁剪区域 -->
      <div v-else class="space-y-4">
        <!-- 比例选择 -->
        <div class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">裁剪比例:</label>
          <el-radio-group v-model="aspectRatio" @change="updateCropBox">
            <el-radio-button value="free">自由</el-radio-button>
            <el-radio-button value="1:1">1:1</el-radio-button>
            <el-radio-button value="4:3">4:3</el-radio-button>
            <el-radio-button value="16:9">16:9</el-radio-button>
            <el-radio-button value="3:4">3:4</el-radio-button>
            <el-radio-button value="9:16">9:16</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 裁剪画布 -->
        <div class="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" style="max-height: 500px;">
          <canvas
            ref="canvasRef"
            class="block max-w-full"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
          />
        </div>

        <!-- 裁剪信息 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <span class="text-gray-500 dark:text-gray-400">X:</span>
            <span class="ml-2 font-mono text-gray-900 dark:text-white">{{ cropBox.x }}px</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <span class="text-gray-500 dark:text-gray-400">Y:</span>
            <span class="ml-2 font-mono text-gray-900 dark:text-white">{{ cropBox.y }}px</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <span class="text-gray-500 dark:text-gray-400">宽度:</span>
            <span class="ml-2 font-mono text-gray-900 dark:text-white">{{ cropBox.width }}px</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <span class="text-gray-500 dark:text-gray-400">高度:</span>
            <span class="ml-2 font-mono text-gray-900 dark:text-white">{{ cropBox.height }}px</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-4">
          <el-button type="primary" @click="cropImage">
            <el-icon><Check /></el-icon>
            裁剪图片
          </el-button>
          <el-button @click="resetImage">
            <el-icon><RefreshLeft /></el-icon>
            重新选择
          </el-button>
        </div>
      </div>
    </div>

    <!-- 裁剪结果 -->
    <div v-if="croppedImageUrl" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">裁剪结果</h3>
        <div class="flex gap-2">
          <el-button size="small" @click="downloadCropped">
            <el-icon><Download /></el-icon>
            下载图片
          </el-button>
          <el-button size="small" @click="copyCropped">
            <el-icon><CopyDocument /></el-icon>
            复制图片
          </el-button>
        </div>
      </div>
      <div class="flex justify-center">
        <img :src="croppedImageUrl" class="max-w-full max-h-96 rounded-lg border border-gray-200 dark:border-gray-700" />
      </div>
      <div class="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        {{ croppedSize.width }} × {{ croppedSize.height }} 像素
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { UploadFilled, Check, RefreshLeft, Download, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageSrc = ref('')
const aspectRatio = ref('free')
const croppedImageUrl = ref('')
const croppedSize = ref({ width: 0, height: 0 })

let image: HTMLImageElement | null = null
let scale = 1

interface CropBox {
  x: number
  y: number
  width: number
  height: number
}

const cropBox = ref<CropBox>({ x: 0, y: 0, width: 200, height: 200 })

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragType: 'move' | 'resize' = 'move'

const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target?.result as string
    nextTick(() => loadImage())
  }
  reader.readAsDataURL(file.raw)
}

const loadImage = () => {
  image = new Image()
  image.onload = () => {
    const canvas = canvasRef.value
    if (!canvas || !image) return

    // 计算缩放比例
    const maxWidth = canvas.parentElement?.clientWidth || 800
    scale = Math.min(1, maxWidth / image.width, 500 / image.height)

    canvas.width = image.width * scale
    canvas.height = image.height * scale

    // 初始化裁剪框
    const defaultSize = Math.min(canvas.width, canvas.height) * 0.6
    cropBox.value = {
      x: (canvas.width - defaultSize) / 2,
      y: (canvas.height - defaultSize) / 2,
      width: defaultSize,
      height: defaultSize,
    }

    drawCanvas()
  }
  image.src = imageSrc.value
}

const drawCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas || !image) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制图片
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  // 绘制遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 清除裁剪区域
  const { x, y, width, height } = cropBox.value
  ctx.clearRect(x, y, width, height)
  ctx.drawImage(image, x / scale, y / scale, width / scale, height / scale, x, y, width, height)

  // 绘制裁剪框边框
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, width, height)

  // 绘制四角手柄
  const handleSize = 8
  ctx.fillStyle = '#3b82f6'
  // 左上
  ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize)
  // 右上
  ctx.fillRect(x + width - handleSize / 2, y - handleSize / 2, handleSize, handleSize)
  // 左下
  ctx.fillRect(x - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize)
  // 右下
  ctx.fillRect(x + width - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize)
}

const startDrag = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const { x, y, width, height } = cropBox.value

  // 检查是否在手柄上
  const handleSize = 12
  if (Math.abs(mouseX - (x + width)) < handleSize && Math.abs(mouseY - (y + height)) < handleSize) {
    dragType = 'resize'
  } else if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
    dragType = 'move'
  } else {
    return
  }

  isDragging = true
  dragStartX = mouseX - x
  dragStartY = mouseY - y
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging) return

  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  if (dragType === 'move') {
    let newX = mouseX - dragStartX
    let newY = mouseY - dragStartY

    // 边界检查
    newX = Math.max(0, Math.min(newX, canvas.width - cropBox.value.width))
    newY = Math.max(0, Math.min(newY, canvas.height - cropBox.value.height))

    cropBox.value.x = newX
    cropBox.value.y = newY
  } else if (dragType === 'resize') {
    let newWidth = mouseX - cropBox.value.x
    let newHeight = mouseY - cropBox.value.y

    // 最小尺寸
    newWidth = Math.max(50, newWidth)
    newHeight = Math.max(50, newHeight)

    // 边界检查
    newWidth = Math.min(newWidth, canvas.width - cropBox.value.x)
    newHeight = Math.min(newHeight, canvas.height - cropBox.value.y)

    // 比例锁定
    if (aspectRatio.value !== 'free') {
      const [w, h] = aspectRatio.value.split(':').map(Number)
      const ratio = w / h
      if (newWidth / newHeight > ratio) {
        newWidth = newHeight * ratio
      } else {
        newHeight = newWidth / ratio
      }
    }

    cropBox.value.width = newWidth
    cropBox.value.height = newHeight
  }

  drawCanvas()
}

const endDrag = () => {
  isDragging = false
}

const updateCropBox = () => {
  if (aspectRatio.value === 'free') return

  const [w, h] = aspectRatio.value.split(':').map(Number)
  const ratio = w / h
  const { width, height } = cropBox.value

  if (width / height > ratio) {
    cropBox.value.width = height * ratio
  } else {
    cropBox.value.height = width / ratio
  }

  drawCanvas()
}

const cropImage = () => {
  if (!image) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { x, y, width, height } = cropBox.value
  canvas.width = width / scale
  canvas.height = height / scale

  ctx.drawImage(
    image,
    x / scale, y / scale, width / scale, height / scale,
    0, 0, canvas.width, canvas.height
  )

  croppedImageUrl.value = canvas.toDataURL('image/png')
  croppedSize.value = { width: Math.round(canvas.width), height: Math.round(canvas.height) }
  ElMessage.success('裁剪完成')
}

const downloadCropped = () => {
  const link = document.createElement('a')
  link.download = 'cropped-image.png'
  link.href = croppedImageUrl.value
  link.click()
}

const copyCropped = async () => {
  try {
    const response = await fetch(croppedImageUrl.value)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const resetImage = () => {
  imageSrc.value = ''
  croppedImageUrl.value = ''
  image = null
}

watch(aspectRatio, updateCropBox)
</script>
