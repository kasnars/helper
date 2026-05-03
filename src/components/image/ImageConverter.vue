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
        支持 PNG、JPEG、WebP、GIF、BMP、SVG、AVIF、ICO 格式，最多 10 张
      </p>
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <!-- Info & Controls -->
            <div class="flex-1 space-y-3">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ image.file.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatSize(image.file.size) }} · {{ image.width }}×{{ image.height }}
                </p>
              </div>

              <!-- Format Selection -->
              <div class="flex gap-2">
                <el-select v-model="image.targetFormat" size="small" class="w-32">
                  <el-option label="PNG" value="image/png" />
                  <el-option label="JPEG" value="image/jpeg" />
                  <el-option label="WebP" value="image/webp" />
                  <el-option label="BMP" value="image/bmp" />
                  <el-option label="GIF" value="image/gif" />
                  <el-option label="SVG" value="image/svg+xml" />
                  <el-option label="AVIF" value="image/avif" />
                  <el-option label="ICO" value="image/x-icon" />
                </el-select>

                <el-button
                  type="primary"
                  size="small"
                  :loading="image.processing"
                  @click="processImage(index)"
                >
                  处理
                </el-button>
              </div>
            </div>
          </div>

          <!-- Result -->
          <div v-if="image.result" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <el-icon class="text-green-500"><CircleCheckFilled /></el-icon>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatSize(image.result.size) }} · {{ image.targetFormat.split('/')[1].toUpperCase() }}
                </span>
                <el-tag
                  v-if="image.compressionRatio"
                  :type="image.compressionRatio < 0 ? 'danger' : 'success'"
                  size="small"
                >
                  {{ image.compressionRatio > 0 ? '-' : '+' }}{{ Math.abs(image.compressionRatio).toFixed(1) }}%
                </el-tag>
              </div>
              <el-button type="primary" link size="small" @click="downloadImage(image)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Batch Operations -->
      <div class="flex justify-center gap-4 pt-4">
        <el-button type="primary" size="large" :loading="isProcessingAll" @click="processAll">
          <el-icon><Refresh /></el-icon>
          批量处理全部
        </el-button>
        <el-button
          v-if="hasResults"
          type="success"
          size="large"
          @click="downloadAll"
        >
          <el-icon><Download /></el-icon>
          打包下载全部
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Delete, Close, CircleCheckFilled, Download, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface ImageItem {
  id: string
  file: File
  preview: string
  width: number
  height: number
  targetFormat: string
  processing: boolean
  result?: {
    blob: Blob
    url: string
    size: number
  }
  compressionRatio?: number
}

// ICO file format constants
interface ICOHeader {
  reserved: number
  imageType: number
  imageCount: number
}

interface ICOEntry {
  width: number
  height: number
  colorPalette: number
  reserved: number
  colorPlanes: number
  bitsPerPixel: number
  imageDataSize: number
  imageDataOffset: number
}

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const images = ref<ImageItem[]>([])
const isProcessingAll = ref(false)

const hasResults = computed(() => images.value.some(img => img.result))

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
        targetFormat: file.type === 'image/png' ? 'image/jpeg' : 'image/png',
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

const processImage = async (index: number) => {
  const image = images.value[index]
  if (!image || image.processing) return

  image.processing = true

  try {
    const result = await convertImageFormat(image.file, image.targetFormat)
    const originalSize = image.file.size
    const newSize = result.size

    image.result = {
      blob: result,
      url: URL.createObjectURL(result),
      size: result.size,
    }
    image.compressionRatio = ((originalSize - newSize) / originalSize) * 100

    ElMessage.success('处理完成')
  } catch (error) {
    ElMessage.error('处理失败')
  } finally {
    image.processing = false
  }
}

const convertImageFormat = (file: File, targetFormat: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Fill white background for JPEG
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)

      // Special handling for ICO format
      if (targetFormat === 'image/x-icon') {
        canvas.toBlob(
          (pngBlob) => {
            if (!pngBlob) {
              reject(new Error('Conversion failed'))
              return
            }
            // Convert PNG to ICO by creating a simple ICO file structure
            convertPngToIco(pngBlob, img.width, img.height).then(resolve).catch(reject)
          },
          'image/png',
          1
        )
        return
      }

      // Special handling for SVG format
      if (targetFormat === 'image/svg+xml') {
        const svgContent = generateSvgFromCanvas(img, canvas)
        const blob = new Blob([svgContent], { type: 'image/svg+xml' })
        resolve(blob)
        return
      }

      // Standard format conversion
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Conversion failed'))
          }
        },
        targetFormat,
        0.92
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Convert PNG blob to ICO format
const convertPngToIco = (pngBlob: Blob, width: number, height: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const pngData = new Uint8Array(reader.result as ArrayBuffer)
        const icoData = createIcoFile(pngData, Math.min(width, height))
        resolve(new Blob([icoData.buffer as ArrayBuffer], { type: 'image/x-icon' }))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(pngBlob)
  })
}

// Create ICO file structure
const createIcoFile = (pngData: Uint8Array, size: number): Uint8Array => {
  // ICO file structure: ICONDIR + ICONDIRENTRY + PNG data
  const iconDirSize = 6 // 3 fields of 2 bytes each
  const iconEntrySize = 16 // ICO directory entry size
  const totalSize = iconDirSize + iconEntrySize + pngData.length

  const buffer = new Uint8Array(totalSize)
  const view = new DataView(buffer.buffer)

  // ICONDIR header
  view.setUint16(0, 0, true) // Reserved, must be 0
  view.setUint16(2, 1, true) // Image type: 1 for ICO
  view.setUint16(4, 1, true) // Number of images

  // ICONDIRENTRY
  view.setUint8(6, size >= 256 ? 0 : size) // Width (0 = 256)
  view.setUint8(7, size >= 256 ? 0 : size) // Height (0 = 256)
  view.setUint8(8, 0) // Color palette (0 = no palette)
  view.setUint8(9, 0) // Reserved
  view.setUint16(10, 1, true) // Color planes
  view.setUint16(12, 32, true) // Bits per pixel
  view.setUint32(14, pngData.length, true) // Image data size
  view.setUint32(18, iconDirSize + iconEntrySize, true) // Image data offset

  // Copy PNG data
  buffer.set(pngData, iconDirSize + iconEntrySize)

  return buffer
}

// Generate SVG from canvas/image
const generateSvgFromCanvas = (img: HTMLImageElement, canvas: HTMLCanvasElement): string => {
  const dataUrl = canvas.toDataURL('image/png')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
  <image width="${img.width}" height="${img.height}" xlink:href="${dataUrl}"/>
</svg>`
}

const processAll = async () => {
  isProcessingAll.value = true
  for (let i = 0; i < images.value.length; i++) {
    if (!images.value[i].result) {
      await processImage(i)
    }
  }
  isProcessingAll.value = false
  ElMessage.success('批量处理完成')
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
  const ext = image.targetFormat.split('/')[1]
  const originalName = image.file.name.replace(/\.[^/.]+$/, '')
  link.download = `${originalName}_converted.${ext}`
  link.click()
}

const downloadAll = () => {
  const processed = images.value.filter(img => img.result)
  if (processed.length === 0) return

  if (processed.length === 1) {
    downloadImage(processed[0])
    return
  }

  // For multiple files, download sequentially with delay
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
