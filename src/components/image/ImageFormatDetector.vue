<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">图片格式检测</h2>

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
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        multiple
        @change="handleFiles"
      />
      <div class="text-gray-500">
        <p class="text-lg mb-1">🔍 点击或拖拽上传图片</p>
        <p class="text-sm">支持任意格式，通过文件头魔数检测真实类型</p>
      </div>
    </div>

    <!-- 检测结果 -->
    <div v-if="results.length" class="space-y-3">
      <div
        v-for="(r, i) in results"
        :key="i"
        class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium text-gray-900 dark:text-white truncate max-w-xs">
            {{ r.fileName }}
          </span>
          <el-tag
            :type="r.match ? 'success' : 'warning'"
            size="small"
          >
            {{ r.match ? '一致' : '不一致' }}
          </el-tag>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">扩展名:</span>
            <span class="ml-1 font-mono">{{ r.extension || '无' }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">真实格式:</span>
            <span class="ml-1 font-mono font-bold" :class="r.realFormat === '未知' ? 'text-red-500' : 'text-green-600 dark:text-green-400'">
              {{ r.realFormat }}
            </span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">MIME:</span>
            <span class="ml-1 font-mono">{{ r.mime }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">文件大小:</span>
            <span class="ml-1">{{ formatSize(r.fileSize) }}</span>
          </div>
        </div>
        <div class="mt-2 text-xs font-mono text-gray-400">
          文件头: {{ r.hexHeader }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

interface DetectResult {
  fileName: string
  extension: string
  realFormat: string
  mime: string
  fileSize: number
  hexHeader: string
  match: boolean
}

const results = ref<DetectResult[]>([])

const handleFiles = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    for (const file of Array.from(files)) detectFile(file)
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    for (const file of Array.from(files)) detectFile(file)
  }
}

const detectFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = () => {
    const buffer = new Uint8Array(reader.result as ArrayBuffer)
    const header = buffer.slice(0, 16)
    const hex = Array.from(header).map((b) => b.toString(16).padStart(2, '0')).join(' ').toUpperCase()

    const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : ''
    const detected = detectFormat(buffer)
    const extToFormat = extensionFormatMap[ext] || ''

    results.value.unshift({
      fileName: file.name,
      extension: ext,
      realFormat: detected.format,
      mime: detected.mime,
      fileSize: file.size,
      hexHeader: hex,
      match: !extToFormat || detected.format === extToFormat,
    })
  }
  reader.readAsArrayBuffer(file.slice(0, 16))
}

interface FormatInfo {
  format: string
  mime: string
  signatures: { bytes: number[]; offset?: number }[]
}

const formats: FormatInfo[] = [
  {
    format: 'PNG',
    mime: 'image/png',
    signatures: [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  },
  {
    format: 'JPEG',
    mime: 'image/jpeg',
    signatures: [{ bytes: [0xff, 0xd8, 0xff] }],
  },
  {
    format: 'GIF',
    mime: 'image/gif',
    signatures: [
      { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] },
      { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] },
    ],
  },
  {
    format: 'WebP',
    mime: 'image/webp',
    signatures: [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }],
  },
  {
    format: 'BMP',
    mime: 'image/bmp',
    signatures: [{ bytes: [0x42, 0x4d] }],
  },
  {
    format: 'ICO',
    mime: 'image/x-icon',
    signatures: [{ bytes: [0x00, 0x00, 0x01, 0x00] }],
  },
  {
    format: 'TIFF',
    mime: 'image/tiff',
    signatures: [
      { bytes: [0x49, 0x49, 0x2a, 0x00] },
      { bytes: [0x4d, 0x4d, 0x00, 0x2a] },
    ],
  },
  {
    format: 'SVG',
    mime: 'image/svg+xml',
    signatures: [],
  },
  {
    format: 'AVIF',
    mime: 'image/avif',
    signatures: [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }],
  },
  {
    format: 'HEIC',
    mime: 'image/heic',
    signatures: [{ bytes: [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63], offset: 4 }],
  },
]

const extensionFormatMap: Record<string, string> = {
  png: 'PNG',
  jpg: 'JPEG',
  jpeg: 'JPEG',
  gif: 'GIF',
  webp: 'WebP',
  bmp: 'BMP',
  ico: 'ICO',
  tiff: 'TIFF',
  tif: 'TIFF',
  svg: 'SVG',
  avif: 'AVIF',
  heic: 'HEIC',
  heif: 'HEIC',
}

const detectFormat = (buffer: Uint8Array): { format: string; mime: string } => {
  // Check SVG by content
  const text = new TextDecoder().decode(buffer.slice(0, 128))
  if (text.includes('<svg') || text.includes('<?xml')) {
    return { format: 'SVG', mime: 'image/svg+xml' }
  }

  for (const fmt of formats) {
    if (fmt.signatures.length === 0) continue
    const matched = fmt.signatures.every((sig) => {
      const offset = sig.offset || 0
      return sig.bytes.every((b, i) => buffer[offset + i] === b)
    })
    if (matched) return { format: fmt.format, mime: fmt.mime }
  }

  return { format: '未知', mime: 'application/octet-stream' }
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
