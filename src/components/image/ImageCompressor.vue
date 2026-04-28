<template>
  <div class="space-y-6">
    <!-- Upload Area -->
    <div
      class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
      :class="{ 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20': isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
      <el-icon :size="48" class="text-gray-400 dark:text-gray-500 mb-4">
        <Upload />
      </el-icon>
      <p class="text-gray-600 dark:text-gray-400 mb-2">
        拖拽图片到此处，或点击上传
      </p>
      <p class="text-sm text-gray-400 dark:text-gray-500">
        支持 PNG、JPEG、WebP 格式压缩，最多 10 张
      </p>
    </div>

    <!-- Compression Settings -->
    <div v-if="images.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">压缩设置</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Quality -->
        <div>
          <div class="flex justify-between mb-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">压缩质量</label>
            <span class="text-sm text-blue-600 dark:text-blue-400">{{ quality }}%</span>
          </div>
          <el-slider v-model="quality" :min="1" :max="100" show-stops :marks="{20: '20%', 50: '50%', 80: '80%'}">
          </el-slider>
        </div>

        <!-- Max Width -->
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            最大宽度 (px)
            <span class="text-xs text-gray-400 ml-1">留空保持原尺寸</span>
          </label>
          <el-input v-model="maxWidth" type="number" placeholder="不限制" min="1">
            <template #append>px</template>
          </el-input>
        </div>

        <!-- Max Height -->
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            最大高度 (px)
            <span class="text-xs text-gray-400 ml-1">留空保持原尺寸</span>
          </label>
          <el-input v-model="maxHeight" type="number" placeholder="不限制" min="1">
            <template #append>px</template>
          </el-input>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-2">
        <el-checkbox v-model="maintainAspectRatio">
          <span class="text-sm text-gray-700 dark:text-gray-300">保持宽高比</span>
        </el-checkbox>
      </div>
    </div>

    <!-- Image List -->
    <div v-if="images.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          已选择 {{ images.length }} 张图片
        </h3>
        <el-button type="danger" link @click="clearAll">
          <el-icon><Delete /></el-icon>
          清空全部
        </el-button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
        >
          <div class="flex gap-4">
            <!-- Preview -->
            <div class="relative w-24 h-24 flex-shrink-0">
              <img
                :src="image.preview"
                class="w-full h-full object-cover rounded-lg"
                alt="preview"
              />
              <button
                @click="removeImage(index)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <el-icon :size="12"><Close /></el-icon>
              </button>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                {{ image.file.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {{ formatSize(image.file.size) }} · {{ image.width }}×{{ image.height }}
              </p>

              <!-- Compression Result -->
              <div v-if="image.result" class="flex items-center gap-3 mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <el-icon class="text-green-500 text-xl"><CircleCheckFilled /></el-icon>
                <div class="flex-1">
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    {{ formatSize(image.result.size) }} · {{ image.result.width }}×{{ image.result.height }}
                  </p>
                </div>
                <el-tag
                  :type="(image.compressionRatio ?? 0) > 0 ? 'success' : 'danger'"
                  size="small"
                  class="font-mono"
                >
                  {{ (image.compressionRatio ?? 0) > 0 ? '↓' : '↑' }}{{ Math.abs(image.compressionRatio ?? 0).toFixed(1) }}%
                </el-tag>
                <el-button type="primary" link size="small" @click="downloadImage(image)">
                  <el-icon><Download /></el-icon>
                </el-button>
              </div>

              <div v-else class="mt-2">
                <el-button
                  type="primary"
                  size="small"
                  :loading="image.processing"
                  @click="compressImage(index)"
                >
                  压缩
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Batch Operations -->
      <div class="flex justify-center gap-4 pt-4">
        <el-button type="primary" size="large" :loading="isProcessingAll" @click="compressAll">
          <el-icon><Refresh /></el-icon>
          批量压缩全部
        </el-button>
        <el-button
          v-if="hasResults"
          type="success"
          size="large"
          @click="downloadAll"
        >
          <el-icon><Download /></el-icon>
          下载全部
        </el-button>
      </div>

      <!-- Total Stats -->
      <div v-if="hasResults" class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mt-4">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">原始总大小</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatSize(totalOriginalSize) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">压缩后总大小</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatSize(totalCompressedSize) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">节省空间</p>
            <p class="text-lg font-semibold" :class="totalSavedRatio > 0 ? 'text-green-600' : 'text-red-600'">
              {{ totalSavedRatio > 0 ? '-' : '+' }}{{ Math.abs(totalSavedRatio).toFixed(1) }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Delete, Close, CircleCheckFilled, Download, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface CompressedResult {
  blob: Blob
  url: string
  size: number
  width: number
  height: number
}

interface ImageItem {
  id: string
  file: File
  preview: string
  width: number
  height: number
  processing: boolean
  result?: CompressedResult
  compressionRatio?: number
}

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const images = ref<ImageItem[]>([])
const isProcessingAll = ref(false)

// Compression settings
const quality = ref(80)
const maxWidth = ref<string>('')
const maxHeight = ref<string>('')
const maintainAspectRatio = ref(true)

const hasResults = computed(() => images.value.some(img => img.result))

const totalOriginalSize = computed(() =>
  images.value.reduce((sum, img) => sum + img.file.size, 0)
)

const totalCompressedSize = computed(() =>
  images.value.filter(img => img.result).reduce((sum, img) => sum + (img.result?.size || 0), 0)
)

const totalSavedRatio = computed(() => {
  const compressed = images.value.filter(img => img.result)
  if (compressed.length === 0) return 0
  const originalSize = compressed.reduce((sum, img) => sum + img.file.size, 0)
  const newSize = compressed.reduce((sum, img) => sum + (img.result?.size || 0), 0)
  return ((originalSize - newSize) / originalSize) * 100
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    addFiles(Array.from(files))
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    addFiles(Array.from(files).filter(f => f.type.startsWith('image/')))
  }
}

const addFiles = async (files: File[]) => {
  if (images.value.length + files.length > 10) {
    ElMessage.warning('最多支持 10 张图片')
    return
  }

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue

    try {
      const img = await loadImage(file)
      const id = Math.random().toString(36).substr(2, 9)

      images.value.push({
        id,
        file,
        preview: URL.createObjectURL(file),
        width: img.width,
        height: img.height,
        processing: false,
      })
    } catch (error) {
      ElMessage.error(`加载图片失败: ${file.name}`)
    }
  }
}

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const calculateDimensions = (origWidth: number, origHeight: number) => {
  let newWidth = origWidth
  let newHeight = origHeight

  const maxW = parseInt(maxWidth.value) || Infinity
  const maxH = parseInt(maxHeight.value) || Infinity

  if (origWidth > maxW || origHeight > maxH) {
    const ratioW = maxW / origWidth
    const ratioH = maxH / origHeight
    const ratio = maintainAspectRatio.value ? Math.min(ratioW, ratioH) : Math.max(ratioW, ratioH)

    newWidth = Math.floor(origWidth * ratio)
    newHeight = Math.floor(origHeight * ratio)
  }

  return { width: newWidth, height: newHeight }
}

const compressImage = async (index: number) => {
  const image = images.value[index]
  if (!image || image.processing) return

  image.processing = true

  try {
    const result = await compressImageFile(image.file, image.width, image.height)
    const originalSize = image.file.size
    const newSize = result.size

    image.result = result
    image.compressionRatio = ((originalSize - newSize) / originalSize) * 100

    ElMessage.success('压缩完成')
  } catch (error) {
    ElMessage.error('压缩失败')
    console.error(error)
  } finally {
    image.processing = false
  }
}

const compressImageFile = async (
  file: File,
  origWidth: number,
  origHeight: number
): Promise<CompressedResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = calculateDimensions(origWidth, origHeight)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Fill white background for JPEG
      if (file.type === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
      }

      ctx.drawImage(img, 0, 0, width, height)

      const mimeType = file.type === 'image/png' && quality.value < 100
        ? 'image/jpeg'
        : file.type

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              blob,
              url: URL.createObjectURL(blob),
              size: blob.size,
              width,
              height,
            })
          } else {
            reject(new Error('Compression failed'))
          }
        },
        mimeType,
        quality.value / 100
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const compressAll = async () => {
  isProcessingAll.value = true
  for (let i = 0; i < images.value.length; i++) {
    if (!images.value[i].result) {
      await compressImage(i)
    }
  }
  isProcessingAll.value = false
  ElMessage.success('批量压缩完成')
}

const removeImage = (index: number) => {
  const image = images.value[index]
  if (image.result?.url) {
    URL.revokeObjectURL(image.result.url)
  }
  URL.revokeObjectURL(image.preview)
  images.value.splice(index, 1)
}

const clearAll = () => {
  images.value.forEach(img => {
    if (img.result?.url) {
      URL.revokeObjectURL(img.result.url)
    }
    URL.revokeObjectURL(img.preview)
  })
  images.value = []
}

const downloadImage = (image: ImageItem) => {
  if (!image.result) return

  const link = document.createElement('a')
  link.href = image.result.url
  const ext = image.file.name.split('.').pop() || 'jpg'
  const baseName = image.file.name.replace(/\.[^/.]+$/, '')
  link.download = `${baseName}_compressed.${ext}`
  link.click()
}

const downloadAll = () => {
  const processed = images.value.filter(img => img.result)
  if (processed.length === 0) return

  processed.forEach((image, index) => {
    setTimeout(() => {
      downloadImage(image)
    }, index * 500)
  })

  ElMessage.success('开始批量下载')
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
