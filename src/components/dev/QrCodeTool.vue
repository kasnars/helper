<template>
  <div class="space-y-6">
    <!-- Mode Switch -->
    <div class="flex gap-4 justify-center">
      <el-radio-group v-model="mode">
        <el-radio-button label="generate">生成二维码</el-radio-button>
        <el-radio-button label="scan">识别二维码</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Generate Mode -->
    <template v-if="mode === 'generate'">
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Input -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">内容设置</h3>
          
          <el-form label-position="top">
            <el-form-item label="内容">
              <el-input
                v-model="qrContent"
                type="textarea"
                :rows="4"
                placeholder="输入要生成二维码的内容..."
              />
            </el-form-item>

            <el-form-item label="尺寸 (像素)">
              <el-slider v-model="qrSize" :min="100" :max="500" :step="50" show-stops />
            </el-form-item>

            <el-form-item label="前景色">
              <el-color-picker v-model="qrColor" />
            </el-form-item>

            <el-form-item label="背景色">
              <el-color-picker v-model="qrBgColor" />
            </el-form-item>

            <el-form-item label="纠错级别">
              <el-radio-group v-model="qrErrorLevel">
                <el-radio-button label="L">低 (7%)</el-radio-button>
                <el-radio-button label="M">中 (15%)</el-radio-button>
                <el-radio-button label="Q">高 (25%)</el-radio-button>
                <el-radio-button label="H">超高 (30%)</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <el-button
            type="primary"
            class="w-full mt-4"
            :disabled="!qrContent"
            @click="generateQR"
          >
            生成二维码
          </el-button>
        </div>

        <!-- Result -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">二维码预览</h3>
                  
          <div class="flex items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="二维码" class="max-w-full" />
            <p v-else class="text-gray-400">点击“生成二维码”按钮</p>
          </div>

          <div class="flex gap-3 mt-4">
            <el-button
              type="primary"
              class="flex-1"
              :disabled="!qrDataUrl"
              @click="downloadQR"
            >
              <el-icon><Download /></el-icon>
              下载 PNG
            </el-button>
            <el-button
              class="flex-1"
              :disabled="!qrDataUrl"
              @click="copyQR"
            >
              <el-icon><CopyDocument /></el-icon>
              复制图片
            </el-button>
          </div>
        </div>
      </div>

      <!-- Quick Templates -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速模板</h3>
        <div class="flex flex-wrap gap-3">
          <el-button @click="applyTemplate('wifi')">WiFi 连接</el-button>
          <el-button @click="applyTemplate('tel')">电话号码</el-button>
          <el-button @click="applyTemplate('email')">发送邮件</el-button>
          <el-button @click="applyTemplate('url')">网址链接</el-button>
        </div>
      </div>
    </template>

    <!-- Scan Mode -->
    <template v-if="mode === 'scan'">
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Upload -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">上传图片</h3>
          
          <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            @click="triggerFileInput"
            @drop.prevent="handleDrop"
            @dragover.prevent
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <el-icon :size="48" class="text-gray-400 mb-4">
              <Upload />
            </el-icon>
            <p class="text-gray-600 dark:text-gray-400">
              拖拽图片到此处，或点击上传
            </p>
          </div>

          <!-- Camera Scan -->
          <div class="mt-6">
            <el-button
              type="primary"
              class="w-full"
              @click="toggleCamera"
            >
              <el-icon><Camera /></el-icon>
              {{ isCameraActive ? '关闭相机' : '打开相机扫描' }}
            </el-button>
          </div>

          <!-- Camera Preview -->
          <div v-if="isCameraActive" class="mt-4 relative">
            <video
              ref="videoRef"
              class="w-full rounded-lg"
              autoplay
              playsinline
            />
            <canvas ref="scanCanvas" class="hidden" />
          </div>
        </div>

        <!-- Result -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">识别结果</h3>
          
          <div v-if="scanResult" class="space-y-4">
            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p class="text-sm text-green-800 dark:text-green-200 font-medium mb-2">识别成功!</p>
              <p class="text-gray-900 dark:text-white break-all font-mono">{{ scanResult }}</p>
            </div>
            
            <div class="flex gap-3">
              <el-button type="primary" class="flex-1" @click="copyScanResult">
                <el-icon><CopyDocument /></el-icon>
                复制内容
              </el-button>
              <el-button class="flex-1" @click="openScanResult" v-if="isUrl(scanResult)">
                <el-icon><Link /></el-icon>
                打开链接
              </el-button>
            </div>
          </div>
          
          <div v-else-if="scanError" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p class="text-red-800 dark:text-red-200">{{ scanError }}</p>
          </div>
          
          <div v-else class="text-center py-12 text-gray-400">
            <el-icon :size="48" class="mb-4">
              <Search />
            </el-icon>
            <p>上传图片或打开相机进行识别</p>
          </div>

          <!-- Preview Image -->
          <div v-if="previewImage" class="mt-4">
            <p class="text-sm text-gray-500 mb-2">图片预览:</p>
            <img :src="previewImage" class="max-w-full rounded-lg border" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Download, CopyDocument, Camera, Link, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import QRCode from 'qrcode'
import jsQR from 'jsqr'

const mode = ref<'generate' | 'scan'>('generate')

// Generate
const qrContent = ref('')
const qrSize = ref(300)
const qrColor = ref('#000000')
const qrBgColor = ref('#FFFFFF')
const qrErrorLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const qrDataUrl = ref('')

// Scan
const fileInput = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const scanCanvas = ref<HTMLCanvasElement | null>(null)
const isCameraActive = ref(false)
const scanResult = ref('')
const scanError = ref('')
const previewImage = ref('')
let scanInterval: number | null = null

const generateQR = async () => {
  if (!qrContent.value) return
  
  const canvas = document.createElement('canvas')
  
  try {
    await QRCode.toCanvas(canvas, qrContent.value, {
      width: qrSize.value,
      margin: 2,
      color: {
        dark: qrColor.value,
        light: qrBgColor.value,
      },
      errorCorrectionLevel: qrErrorLevel.value,
    })
    
    qrDataUrl.value = canvas.toDataURL('image/png')
  } catch (error) {
    ElMessage.error('生成失败')
  }
}

const downloadQR = () => {
  if (!qrDataUrl.value) return
  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `qrcode_${Date.now()}.png`
  link.click()
}

const copyQR = async () => {
  if (!qrDataUrl.value) return
  try {
    const response = await fetch(qrDataUrl.value)
    const blob = await response.blob()
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const applyTemplate = (type: string) => {
  const templates: Record<string, string> = {
    wifi: 'WIFI:T:WPA;S:网络名称;P:密码;;',
    tel: 'tel:+86138xxxxxxxx',
    email: 'mailto:example@email.com?subject=主题&body=内容',
    url: 'https://www.example.com',
  }
  qrContent.value = templates[type]
}

// Scan functions
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processImage(file)
}

const handleDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files[0]
  if (file) processImage(file)
}

const processImage = (file: File) => {
  scanResult.value = ''
  scanError.value = ''
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      previewImage.value = e.target?.result as string
      scanImage(img)
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const scanImage = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height)
  
  if (code) {
    scanResult.value = code.data
  } else {
    scanError.value = '未能识别二维码，请尝试其他图片'
  }
}

const toggleCamera = async () => {
  if (isCameraActive.value) {
    stopCamera()
  } else {
    await startCamera()
  }
}

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      isCameraActive.value = true
      scanResult.value = ''
      scanError.value = ''
      
      // Start scanning loop
      scanInterval = window.setInterval(() => {
        scanFromVideo()
      }, 500)
    }
  } catch {
    ElMessage.error('无法访问相机')
  }
}

const stopCamera = () => {
  if (videoRef.value?.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.value.srcObject = null
  }
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
  isCameraActive.value = false
}

const scanFromVideo = () => {
  if (!videoRef.value || !scanCanvas.value) return
  
  const video = videoRef.value
  const canvas = scanCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return
  
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height)
  
  if (code) {
    scanResult.value = code.data
    stopCamera()
  }
}

const copyScanResult = () => {
  navigator.clipboard.writeText(scanResult.value)
  ElMessage.success('已复制')
}

const isUrl = (text: string) => {
  return /^https?:\/\//.test(text)
}

const openScanResult = () => {
  if (isUrl(scanResult.value)) {
    window.open(scanResult.value, '_blank')
  }
}
</script>
