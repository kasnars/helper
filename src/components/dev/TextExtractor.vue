<template>
  <div class="space-y-6">
    <!-- Mode Switch -->
    <div class="flex gap-4 justify-center">
      <el-radio-group v-model="mode">
        <el-radio-button label="pdf">PDF 文字提取</el-radio-button>
        <el-radio-button label="image">图片文字识别 (OCR)</el-radio-button>
      </el-radio-group>
    </div>

    <!-- PDF Text Extraction Mode -->
    <template v-if="mode === 'pdf'">
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

        <div v-if="extractPdf" class="mt-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ extractPdf.name }}</h3>
              <p class="text-sm text-gray-500">{{ extractNumPages }} 页</p>
            </div>
            <div class="flex gap-2">
              <el-select v-model="extractPage" size="small" class="w-32">
                <el-option label="全部页面" :value="0" />
                <el-option
                  v-for="page in extractNumPages"
                  :key="page"
                  :label="`第 ${page} 页`"
                  :value="page"
                />
              </el-select>
              <el-button
                type="primary"
                :loading="extracting"
                @click="extractPdfText"
              >
                提取文字
              </el-button>
            </div>
          </div>

          <div v-if="extractedText" class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-700 dark:text-gray-300">提取结果</h4>
              <el-button type="primary" link size="small" @click="copyExtractedText">
                <el-icon><CopyDocument /></el-icon>
                复制文字
              </el-button>
            </div>
            <el-input
              v-model="extractedText"
              type="textarea"
              :rows="12"
              readonly
              class="w-full"
            />
            <p class="text-xs text-gray-500 mt-2">
              共 {{ extractedText.length }} 个字符
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Image OCR Mode -->
    <template v-if="mode === 'image'">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <!-- Language Selection -->
        <div class="mb-4">
          <span class="text-sm text-gray-600 dark:text-gray-400 mr-2">识别语言:</span>
          <el-select v-model="ocrLang" size="small" class="w-32">
            <el-option label="简体中文" value="chi_sim" />
            <el-option label="繁体中文" value="chi_tra" />
            <el-option label="英文" value="eng" />
            <el-option label="中日韩混合" value="chi_sim+chi_tra+jpn+kor" />
          </el-select>
        </div>

        <el-upload
          drag
          accept="image/*"
          :auto-upload="false"
          :on-change="handleImageUpload"
          class="w-full"
        >
          <el-icon :size="48" class="text-gray-400"><Upload /></el-icon>
          <div class="el-upload__text">拖拽图片到此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 JPG、PNG、BMP 等格式，首次识别需要下载语言包</div>
          </template>
        </el-upload>

        <div v-if="ocrImage" class="mt-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ ocrImage.name }}</h3>
              <p class="text-sm text-gray-500">{{ formatSize(ocrImage.size) }}</p>
            </div>
            <el-button
              type="primary"
              :loading="recognizing"
              :disabled="!ocrImage"
              @click="recognizeText"
            >
              开始识别
            </el-button>
          </div>

          <!-- Image Preview -->
          <div v-if="imagePreview" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <img :src="imagePreview" class="w-full max-h-96 object-contain" alt="preview" />
          </div>

          <!-- Recognition Result -->
          <div v-if="recognizedText" class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-700 dark:text-gray-300">识别结果</h4>
              <div class="flex gap-2">
                <el-tag v-if="confidence" size="small" type="success">
                  可信度: {{ confidence }}%
                </el-tag>
                <el-button type="primary" link size="small" @click="copyRecognizedText">
                  <el-icon><CopyDocument /></el-icon>
                  复制文字
                </el-button>
              </div>
            </div>
            <el-input
              v-model="recognizedText"
              type="textarea"
              :rows="10"
              readonly
              class="w-full"
            />
            <p class="text-xs text-gray-500 mt-2">
              共 {{ recognizedText.length }} 个字符
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import * as pdfjs from 'pdfjs-dist'
import Tesseract from 'tesseract.js'
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

const mode = ref<'pdf' | 'image'>('pdf')

// PDF Extraction
const extractPdf = ref<UploadFile | null>(null)
const extractNumPages = ref(0)
const extractPage = ref(0)
const extractedText = ref('')
const extracting = ref(false)

// Image OCR
const ocrImage = ref<File | null>(null)
const imagePreview = ref('')
const recognizedText = ref('')
const confidence = ref(0)
const recognizing = ref(false)
const ocrLang = ref('chi_sim')

// PDF handlers
const handlePdfUpload = async (file: UploadFile) => {
  if (!file.raw) return
  
  extractPdf.value = file
  const arrayBuffer = await file.raw.arrayBuffer()
  
  try {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    extractNumPages.value = pdf.numPages
    extractedText.value = ''
  } catch {
    ElMessage.error('无法读取 PDF')
  }
}

const extractPdfText = async () => {
  if (!extractPdf.value?.raw) return
  
  extracting.value = true
  
  try {
    const arrayBuffer = await extractPdf.value.raw.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    
    let text = ''
    const startPage = extractPage.value === 0 ? 1 : extractPage.value
    const endPage = extractPage.value === 0 ? pdf.numPages : extractPage.value
    
    for (let i = startPage; i <= endPage; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ')
      text += `--- 第 ${i} 页 ---\n${pageText}\n\n`
    }
    
    extractedText.value = text.trim()
    ElMessage.success('文字提取成功')
  } catch (error) {
    ElMessage.error('提取失败')
  } finally {
    extracting.value = false
  }
}

const copyExtractedText = async () => {
  try {
    await navigator.clipboard.writeText(extractedText.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// Image OCR handlers
const handleImageUpload = (file: UploadFile) => {
  if (!file.raw) return
  
  ocrImage.value = file.raw
  imagePreview.value = URL.createObjectURL(file.raw)
  recognizedText.value = ''
  confidence.value = 0
}

const recognizeText = async () => {
  if (!ocrImage.value) return
  
  recognizing.value = true
  
  try {
    const result = await Tesseract.recognize(
      imagePreview.value,
      ocrLang.value,
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`进度: ${(m.progress * 100).toFixed(0)}%`)
          }
        },
      }
    )
    
    recognizedText.value = result.data.text
    confidence.value = Math.round(result.data.confidence)
    ElMessage.success('文字识别成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('识别失败')
  } finally {
    recognizing.value = false
  }
}

const copyRecognizedText = async () => {
  try {
    await navigator.clipboard.writeText(recognizedText.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
