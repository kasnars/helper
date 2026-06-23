<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Favicon 生成器</h2>

    <!-- 上传区域 -->
    <div
      class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6"
      :class="isDragging
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="fileInput?.click()"
    >
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
      <div v-if="!originalSrc" class="text-gray-500">
        <p class="text-lg mb-1">🖼️ 点击或拖拽上传图片</p>
        <p class="text-sm">支持 PNG / JPG / SVG / WebP</p>
      </div>
      <div v-else class="flex flex-col items-center gap-3">
        <img :src="originalSrc" class="w-20 h-20 object-contain rounded-lg border" />
        <span class="text-sm text-gray-500">点击重新选择</span>
      </div>
    </div>

    <!-- 尺寸选择 -->
    <div v-if="originalSrc" class="mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输出尺寸</h3>
      <div class="flex flex-wrap gap-2">
        <el-checkbox
          v-for="size in allSizes"
          :key="size"
          v-model="selectedSizes"
          :label="size"
        >
          {{ size }}×{{ size }}
        </el-checkbox>
      </div>
    </div>

    <!-- 预览 & 下载 -->
    <div v-if="originalSrc" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
        v-for="item in previews"
        :key="item.size"
        class="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
      >
        <div
          class="flex items-center justify-center bg-white dark:bg-gray-800 rounded border"
          :style="{ width: Math.min(item.size, 80) + 'px', height: Math.min(item.size, 80) + 'px' }"
        >
          <canvas :ref="el => setCanvasRef(el, item.size)" />
        </div>
        <span class="text-xs font-mono text-gray-500">{{ item.size }}×{{ item.size }}</span>
        <el-button size="small" text type="primary" @click="downloadSingle(item.size)">
          下载
        </el-button>
      </div>
    </div>

    <!-- 批量下载 -->
    <div v-if="originalSrc" class="mt-4 flex justify-center">
      <el-button type="primary" @click="downloadAll">
        打包下载全部
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const originalSrc = ref('')
const imgEl = ref<HTMLImageElement | null>(null)
const canvasRefs = new Map<number, HTMLCanvasElement>()

const allSizes = [16, 32, 48, 180, 192, 512]
const selectedSizes = ref([16, 32, 48, 180, 192, 512])

const previews = ref<{ size: number }[]>([])

const setCanvasRef = (el: any, size: number) => {
  if (el) canvasRefs.set(size, el)
}

const handleFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadImage(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) loadImage(file)
}

const loadImage = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    originalSrc.value = e.target?.result as string
    const img = new Image()
    img.onload = () => {
      imgEl.value = img
      nextTick(() => renderAll())
    }
    img.src = originalSrc.value
  }
  reader.readAsDataURL(file)
}

const renderAll = () => {
  if (!imgEl.value) return
  previews.value = selectedSizes.value.map((s) => ({ size: s }))
  nextTick(() => {
    for (const size of selectedSizes.value) {
      const canvas = canvasRefs.get(size)
      if (canvas) {
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, size, size)
        ctx.drawImage(imgEl.value!, 0, 0, size, size)
      }
    }
  })
}

watch(selectedSizes, () => {
  if (imgEl.value) renderAll()
})

const getBlob = (size: number): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const canvas = canvasRefs.get(size)
    if (!canvas) return resolve(null)
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

const downloadSingle = async (size: number) => {
  const blob = await getBlob(size)
  if (!blob) return
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `favicon-${size}x${size}.png`
  a.click()
  URL.revokeObjectURL(a.href)
}

const downloadAll = async () => {
  for (const size of selectedSizes.value) {
    await downloadSingle(size)
    await new Promise((r) => setTimeout(r, 100))
  }
  ElMessage.success('已下载全部尺寸')
}
</script>
