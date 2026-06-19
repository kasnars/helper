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
      <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽证件照到此处，或点击上传</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">建议上传背景色较纯的证件照</p>
    </div>

    <!-- 编辑区域 -->
    <div v-if="imageSrc" class="space-y-4">
      <!-- 对比预览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-center">
          <p class="text-sm text-gray-500 mb-2">原图</p>
          <div class="flex justify-center">
            <img :src="imageSrc" class="max-w-full max-h-[300px] object-contain rounded" />
          </div>
        </div>
        <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-center">
          <p class="text-sm text-gray-500 mb-2">效果预览</p>
          <div class="flex justify-center">
            <canvas ref="previewCanvas" class="max-w-full max-h-[300px] object-contain rounded" />
          </div>
        </div>
      </div>

      <!-- 背景色选择 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">选择背景颜色</h3>

        <div class="flex flex-wrap gap-3">
          <button
            v-for="color in presetColors"
            :key="color.value"
            @click="selectBgColor(color.value)"
            class="w-16 h-16 rounded-xl border-2 transition-all flex items-center justify-center"
            :class="targetBgColor === color.value ? 'border-blue-500 scale-110' : 'border-gray-200 dark:border-gray-700'"
            :style="{ backgroundColor: color.value }"
          >
            <span class="text-xs font-medium" :class="color.textColor">{{ color.label }}</span>
          </button>
          <div class="flex items-center gap-2">
            <el-color-picker v-model="customColor" @change="targetBgColor = customColor" />
            <span class="text-sm text-gray-500">自定义</span>
          </div>
        </div>

        <!-- 容差设置 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
            背景识别容差: <span class="font-semibold text-blue-600">{{ tolerance }}</span>
            <span class="text-xs text-gray-400 ml-2">值越大，识别范围越广</span>
          </label>
          <el-slider v-model="tolerance" :min="10" :max="120" :step="1" />
        </div>

        <!-- 边缘平滑 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
            边缘平滑: <span class="font-semibold text-blue-600">{{ edgeSmooth }}</span>
            <span class="text-xs text-gray-400 ml-2">减少边缘锯齿</span>
          </label>
          <el-slider v-model="edgeSmooth" :min="0" :max="5" :step="1" />
        </div>

        <el-button type="primary" @click="applyBgChange" :loading="processing">
          <el-icon><Brush /></el-icon>
          更换背景
        </el-button>
      </div>

      <!-- 下载 -->
      <div v-if="resultUrl" class="flex justify-center gap-3">
        <el-button type="primary" size="large" @click="download('png')">
          <el-icon><Download /></el-icon>
          下载 PNG（透明）
        </el-button>
        <el-button size="large" @click="download('jpg')">
          <el-icon><Download /></el-icon>
          下载 JPEG
        </el-button>
      </div>
    </div>

    <!-- 说明 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">使用说明</h3>
      <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <li>• 建议上传背景色较为纯正的证件照（如蓝底、白底、红底）</li>
        <li>• 调整「背景识别容差」可控制颜色匹配范围</li>
        <li>• 调整「边缘平滑」可减少人物边缘的锯齿感</li>
        <li>• 纯前端处理，图片不会上传到任何服务器</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Brush, Download } from '@element-plus/icons-vue'

const fileInput = ref<HTMLInputElement>()
const previewCanvas = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const processing = ref(false)
const imageSrc = ref('')
const originalImage = ref<HTMLImageElement | null>(null)
const targetBgColor = ref('#ffffff')
const customColor = ref('#438edb')
const tolerance = ref(40)
const edgeSmooth = ref(2)
const resultUrl = ref('')

const presetColors = [
  { value: '#ffffff', label: '白底', textColor: 'text-gray-600' },
  { value: '#438edb', label: '蓝底', textColor: 'text-white' },
  { value: '#d93532', label: '红底', textColor: 'text-white' },
  { value: '#a0d468', label: '绿底', textColor: 'text-white' },
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
    // 先绘制原图到 canvas
    const canvas = previewCanvas.value!
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
  }
  img.src = imageSrc.value
}

const selectBgColor = (color: string) => {
  targetBgColor.value = color
}

// 解析颜色为 RGB
const parseColor = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

// 计算颜色距离
const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

const applyBgChange = () => {
  if (!originalImage.value || !previewCanvas.value) return
  processing.value = true

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  // 绘制原图
  ctx.drawImage(originalImage.value, 0, 0)
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  // 采样边缘颜色作为背景色参考
  const bgSamples: [number, number, number][] = []
  const sampleSize = 5
  // 上边
  for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 20))) {
    for (let y = 0; y < sampleSize; y++) {
      const i = (y * w + x) * 4
      bgSamples.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  // 下边
  for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 20))) {
    for (let y = h - sampleSize; y < h; y++) {
      const i = (y * w + x) * 4
      bgSamples.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  // 左边
  for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 20))) {
    for (let x = 0; x < sampleSize; x++) {
      const i = (y * w + x) * 4
      bgSamples.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  // 右边
  for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 20))) {
    for (let x = w - sampleSize; x < w; x++) {
      const i = (y * w + x) * 4
      bgSamples.push([data[i], data[i + 1], data[i + 2]])
    }
  }

  // 计算平均背景色
  const avgR = bgSamples.reduce((s, c) => s + c[0], 0) / bgSamples.length
  const avgG = bgSamples.reduce((s, c) => s + c[1], 0) / bgSamples.length
  const avgB = bgSamples.reduce((s, c) => s + c[2], 0) / bgSamples.length

  const [tR, tG, tB] = parseColor(targetBgColor.value)
  const tol = tolerance.value

  // 创建 mask
  const mask = new Float32Array(w * h) // 0=背景, 1=前景
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const dist = colorDistance(data[i], data[i + 1], data[i + 2], avgR, avgG, avgB)
      if (dist < tol) {
        mask[y * w + x] = 0
      } else if (dist < tol * 1.5) {
        mask[y * w + x] = (dist - tol) / (tol * 0.5) // 过渡区
      } else {
        mask[y * w + x] = 1
      }
    }
  }

  // 边缘平滑（简单盒式模糊）
  if (edgeSmooth.value > 0) {
    const smoothMask = new Float32Array(w * h)
    const radius = edgeSmooth.value
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0, count = 0
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx, ny = y + dy
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              sum += mask[ny * w + nx]
              count++
            }
          }
        }
        smoothMask[y * w + x] = sum / count
      }
    }
    for (let i = 0; i < mask.length; i++) mask[i] = smoothMask[i]
  }

  // 应用新背景
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const m = mask[y * w + x]
      data[i] = Math.round(tR * (1 - m) + data[i] * m)
      data[i + 1] = Math.round(tG * (1 - m) + data[i + 1] * m)
      data[i + 2] = Math.round(tB * (1 - m) + data[i + 2] * m)
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
  resultUrl.value = canvas.toDataURL('image/png')
  processing.value = false
}

const download = (format: 'png' | 'jpg') => {
  if (!previewCanvas.value) return
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
  const url = previewCanvas.value.toDataURL(mimeType, 0.95)
  const a = document.createElement('a')
  a.href = url
  a.download = `id_photo_${targetBgColor.value.replace('#', '')}_${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`
  a.click()
}
</script>
