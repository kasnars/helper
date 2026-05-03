<template>
  <div class="space-y-6">
    <!-- Mode Switch -->
    <div class="flex gap-4 justify-center">
      <el-radio-group v-model="mode">
        <el-radio-button label="preview">PDF 预览</el-radio-button>
        <el-radio-button label="merge">合并 PDF</el-radio-button>
        <el-radio-button label="split">拆分 PDF</el-radio-button>
        <el-radio-button label="image2pdf">图片转 PDF</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <el-upload
          drag
          accept=".pdf"
          :auto-upload="false"
          :on-change="handlePdfUpload"
          class="w-full"
        >
          <el-icon :size="48" class="text-gray-400"><Upload /></el-icon>
          <div class="el-upload__text">拖拽 PDF 到此处或 <em>点击上传</em></div>
        </el-upload>

        <div v-if="pdfDoc" class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ pdfFileName }}</h3>
              <p class="text-sm text-gray-500">{{ pdfNumPages }} 页</p>
            </div>
            <div class="flex items-center gap-4">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="1"
                :total="pdfNumPages"
                layout="prev, pager, next"
              />
            </div>
          </div>

          <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100">
            <canvas ref="pdfCanvas" class="w-full" />
          </div>
        </div>
      </div>
    </template>

    <!-- Merge Mode -->
    <template v-if="mode === 'merge'">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <el-upload
          drag
          accept=".pdf"
          :auto-upload="false"
          :on-change="handleMergeUpload"
          multiple
          class="w-full"
        >
          <el-icon :size="48" class="text-gray-400"><Upload /></el-icon>
          <div class="el-upload__text">拖拽多个 PDF 到此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">按上传顺序合并，可拖拽调整顺序</div>
          </template>
        </el-upload>

        <div v-if="mergeFiles.length > 0" class="mt-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
            待合并文件 ({{ mergeFiles.length }} 个)
          </h3>
          <div class="space-y-2">
            <div
              v-for="(file, index) in mergeFiles"
              :key="file.uid"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-sm font-medium">
                  {{ index + 1 }}
                </span>
                <span class="text-gray-900 dark:text-white">{{ file.name }}</span>
              </div>
              <el-button type="danger" link @click="removeMergeFile(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <el-button
            type="primary"
            class="w-full mt-6"
            :loading="merging"
            :disabled="mergeFiles.length < 2"
            @click="mergePdfs"
          >
            <el-icon><Connection /></el-icon>
            合并 PDF
          </el-button>
        </div>
      </div>
    </template>

    <!-- Image to PDF Mode -->
    <template v-if="mode === 'image2pdf'">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <el-upload
          drag
          accept="image/*"
          :auto-upload="false"
          :on-change="handleImageUpload"
          multiple
          class="w-full"
        >
          <el-icon :size="48" class="text-gray-400"><Upload /></el-icon>
          <div class="el-upload__text">拖拽图片到此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 JPG、PNG、WebP 等格式，可批量上传</div>
          </template>
        </el-upload>

        <div v-if="images.length > 0" class="mt-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              已选择 {{ images.length }} 张图片
            </h3>
            <div class="flex gap-2">
              <el-select v-model="pdfPageSize" size="small" class="w-32">
                <el-option label="A4" value="a4" />
                <el-option label="A3" value="a3" />
                <el-option label="原始大小" value="original" />
              </el-select>
              <el-select v-model="pdfOrientation" size="small" class="w-28">
                <el-option label="纵向" value="portrait" />
                <el-option label="横向" value="landscape" />
              </el-select>
            </div>
          </div>

          <!-- Image Preview Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="(image, index) in images"
              :key="index"
              class="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group"
            >
              <img :src="image.url" class="w-full h-full object-cover" alt="preview" />
              <button
                @click="removeImage(index)"
                class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <el-icon :size="12"><Close /></el-icon>
              </button>
              <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                {{ index + 1 }}
              </div>
            </div>
          </div>

          <el-button
            type="primary"
            class="w-full"
            :loading="converting"
            :disabled="images.length === 0"
            @click="convertImagesToPdf"
          >
            <el-icon><Document /></el-icon>
            生成 PDF
          </el-button>
        </div>
      </div>
    </template>

    <!-- Split Mode -->
    <template v-if="mode === 'split'">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <el-upload
          drag
          accept=".pdf"
          :auto-upload="false"
          :on-change="handleSplitUpload"
          class="w-full"
        >
          <el-icon :size="48" class="text-gray-400"><Upload /></el-icon>
          <div class="el-upload__text">拖拽 PDF 到此处或 <em>点击上传</em></div>
        </el-upload>

        <div v-if="splitPdf" class="mt-6 space-y-6">
          <div class="flex items-center gap-4">
            <span class="text-gray-700 dark:text-gray-300">{{ splitPdf.name }}</span>
            <el-tag>{{ splitNumPages }} 页</el-tag>
          </div>

          <el-form label-position="top">
            <el-form-item label="拆分方式">
              <el-radio-group v-model="splitMode">
                <el-radio-button label="range">按页码范围</el-radio-button>
                <el-radio-button label="every">每 N 页拆分</el-radio-button>
                <el-radio-button label="single">每页单独拆分</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="splitMode === 'range'" label="页码范围">
              <el-input
                v-model="splitRange"
                placeholder="例如: 1-5, 8, 10-12"
              />
              <p class="text-xs text-gray-500 mt-1">使用逗号分隔，用-表示范围</p>
            </el-form-item>

            <el-form-item v-if="splitMode === 'every'" label="每 N 页">
              <el-input-number v-model="splitEvery" :min="1" :max="splitNumPages" />
            </el-form-item>
          </el-form>

          <el-button
            type="primary"
            class="w-full"
            :loading="splitting"
            @click="splitPdfFile"
          >
            <el-icon><Scissor /></el-icon>
            拆分 PDF
          </el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Upload, Delete, Connection, Scissor, Close, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import * as pdfjs from 'pdfjs-dist'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

const mode = ref<'preview' | 'merge' | 'split' | 'image2pdf'>('preview')

// Preview
const pdfDoc = ref<pdfjs.PDFDocumentProxy | null>(null)
const pdfFileName = ref('')
const pdfNumPages = ref(0)
const currentPage = ref(1)
const pdfCanvas = ref<HTMLCanvasElement | null>(null)

// Merge
const mergeFiles = ref<UploadFile[]>([])
const merging = ref(false)

// Split
const splitPdf = ref<UploadFile | null>(null)
const splitNumPages = ref(0)
const splitMode = ref<'range' | 'every' | 'single'>('range')
const splitRange = ref('')
const splitEvery = ref(1)
const splitting = ref(false)

// Image to PDF
const images = ref<Array<{ file: File; url: string }>>([])
const pdfPageSize = ref<'a4' | 'a3' | 'original'>('a4')
const pdfOrientation = ref<'portrait' | 'landscape'>('portrait')
const converting = ref(false)

interface PdfImageData {
  bytes: Uint8Array
  width: number
  height: number
}

// Watch page change for preview
watch(currentPage, async (page) => {
  if (pdfDoc.value && pdfCanvas.value) {
    await renderPage(page)
  }
})

const handlePdfUpload = async (file: UploadFile) => {
  if (!file.raw) return
  
  pdfFileName.value = file.name
  const arrayBuffer = await file.raw.arrayBuffer()
  
  try {
    pdfDoc.value = await pdfjs.getDocument({ data: arrayBuffer }).promise
    pdfNumPages.value = pdfDoc.value.numPages
    currentPage.value = 1
    
    await nextTick()
    await renderPage(1)
  } catch (error) {
    ElMessage.error('无法加载 PDF')
  }
}

const renderPage = async (pageNum: number) => {
  if (!pdfDoc.value || !pdfCanvas.value) return
  
  const page = await pdfDoc.value.getPage(pageNum)
  const canvas = pdfCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const scale = 1.5
  const viewport = page.getViewport({ scale })
  
  canvas.width = viewport.width
  canvas.height = viewport.height
  
  await page.render({
    canvasContext: ctx,
    viewport,
    canvas: canvas,
  } as any).promise
}

// Merge
const handleMergeUpload = (file: UploadFile) => {
  mergeFiles.value.push(file)
}

const removeMergeFile = (index: number) => {
  mergeFiles.value.splice(index, 1)
}

const mergePdfs = async () => {
  if (mergeFiles.value.length < 2) return
  
  merging.value = true
  
  try {
    const mergedPdf = await PDFDocument.create()
    
    for (const file of mergeFiles.value) {
      if (!file.raw) continue
      const arrayBuffer = await file.raw.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }
    
    const pdfBytes = await mergedPdf.save()
    downloadPdf(pdfBytes, `merged_${Date.now()}.pdf`)
    ElMessage.success('合并成功')
  } catch (error) {
    ElMessage.error('合并失败')
  } finally {
    merging.value = false
  }
}

// Split
const handleSplitUpload = async (file: UploadFile) => {
  if (!file.raw) return
  
  splitPdf.value = file
  const arrayBuffer = await file.raw.arrayBuffer()
  
  try {
    const pdf = await PDFDocument.load(arrayBuffer)
    splitNumPages.value = pdf.getPageCount()
  } catch {
    ElMessage.error('无法读取 PDF')
  }
}

const splitPdfFile = async () => {
  if (!splitPdf.value?.raw) return
  
  splitting.value = true
  
  try {
    const arrayBuffer = await splitPdf.value.raw.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const totalPages = pdf.getPageCount()
    
    let ranges: Array<[number, number]> = []
    
    if (splitMode.value === 'single') {
      ranges = Array.from({ length: totalPages }, (_, i) => [i, i + 1])
    } else if (splitMode.value === 'every') {
      for (let i = 0; i < totalPages; i += splitEvery.value) {
        ranges.push([i, Math.min(i + splitEvery.value, totalPages)])
      }
    } else {
      // Parse range string
      const parts = splitRange.value.split(',').map(p => p.trim())
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim()) - 1)
          ranges.push([Math.max(0, start), Math.min(end + 1, totalPages)])
        } else {
          const page = parseInt(part) - 1
          if (!isNaN(page) && page >= 0 && page < totalPages) {
            ranges.push([page, page + 1])
          }
        }
      }
    }
    
    // Create split PDFs
    for (let i = 0; i < ranges.length; i++) {
      const [start, end] = ranges[i]
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(pdf, Array.from({ length: end - start }, (_, j) => start + j))
      pages.forEach(page => newPdf.addPage(page))
      
      const pdfBytes = await newPdf.save()
      downloadPdf(pdfBytes, `split_${start + 1}-${end}_${Date.now()}.pdf`)
    }
    
    ElMessage.success(`已拆分为 ${ranges.length} 个文件`)
  } catch (error) {
    ElMessage.error('拆分失败')
  } finally {
    splitting.value = false
  }
}

const downloadPdf = (bytes: Uint8Array, filename: string) => {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Image to PDF handlers
const handleImageUpload = (file: UploadFile) => {
  if (!file.raw) return
  
  const url = URL.createObjectURL(file.raw)
  images.value.push({
    file: file.raw,
    url,
  })
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(images.value[index].url)
  images.value.splice(index, 1)
}

const loadImageData = (file: File): Promise<PdfImageData> => {
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
      ctx.drawImage(img, 0, 0)
      
      // Get image bytes
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to get image data'))
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            bytes: new Uint8Array(reader.result as ArrayBuffer),
            width: img.width,
            height: img.height,
          })
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
      }, 'image/png')
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const convertImagesToPdf = async () => {
  if (images.value.length === 0) return
  
  converting.value = true
  
  try {
    const pdfDoc = await PDFDocument.create()
    
    for (const image of images.value) {
      const imageData = await loadImageData(image.file)
      
      // Determine page size
      let pageWidth: number
      let pageHeight: number
      
      if (pdfPageSize.value === 'original') {
        pageWidth = imageData.width
        pageHeight = imageData.height
      } else if (pdfPageSize.value === 'a4') {
        pageWidth = pdfOrientation.value === 'landscape' ? 842 : 595
        pageHeight = pdfOrientation.value === 'landscape' ? 595 : 842
      } else { // a3
        pageWidth = pdfOrientation.value === 'landscape' ? 1191 : 842
        pageHeight = pdfOrientation.value === 'landscape' ? 842 : 1191
      }
      
      const page = pdfDoc.addPage([pageWidth, pageHeight])
      
      // Embed PNG image
      const pngImage = await pdfDoc.embedPng(imageData.bytes)
      
      // Calculate scaling to fit page
      const scale = Math.min(
        pageWidth / imageData.width,
        pageHeight / imageData.height
      )
      
      const scaledWidth = imageData.width * scale
      const scaledHeight = imageData.height * scale
      
      // Center the image
      const x = (pageWidth - scaledWidth) / 2
      const y = (pageHeight - scaledHeight) / 2
      
      page.drawImage(pngImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      })
    }
    
    const pdfBytes = await pdfDoc.save()
    downloadPdf(pdfBytes, `images_${Date.now()}.pdf`)
    ElMessage.success('PDF 生成成功')
  } catch (error) {
    ElMessage.error('生成失败')
    console.error(error)
  } finally {
    converting.value = false
  }
}
</script>
