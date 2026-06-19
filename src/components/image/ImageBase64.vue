<template>
  <div class="space-y-6">
    <!-- 模式切换 -->
    <div class="flex gap-2">
      <el-button :type="mode === 'toBase64' ? 'primary' : ''" @click="mode = 'toBase64'">图片 → Base64</el-button>
      <el-button :type="mode === 'toImage' ? 'primary' : ''" @click="mode = 'toImage'">Base64 → 图片</el-button>
    </div>

    <!-- 图片转 Base64 -->
    <div v-if="mode === 'toBase64'" class="space-y-4">
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
        <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽图片到此处，或点击上传</p>
        <p class="text-sm text-gray-400 dark:text-gray-500">支持 PNG、JPEG、WebP、GIF、BMP 等格式</p>
      </div>

      <!-- 预览 & 结果 -->
      <div v-if="imagePreview" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div class="flex items-start gap-4">
          <img :src="imagePreview" class="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ fileName }}</p>
            <p class="text-xs text-gray-500">{{ fileSize }} · {{ imageWidth }}×{{ imageHeight }}</p>
            <p class="text-xs text-gray-500 mt-1">类型: {{ mimeType }}</p>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm text-gray-600 dark:text-gray-400">输出格式</label>
            <el-radio-group v-model="outputFormat" size="small">
              <el-radio-button label="full">完整 Data URL</el-radio-button>
              <el-radio-button label="pure">纯 Base64</el-radio-button>
            </el-radio-group>
          </div>

          <div class="relative">
            <el-input
              v-model="base64Output"
              type="textarea"
              :rows="6"
              readonly
              class="font-mono text-xs"
            />
            <el-button
              size="small"
              class="absolute top-2 right-2"
              @click="copyBase64"
            >
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>

          <p class="text-xs text-gray-500 mt-1">Base64 长度: {{ base64Output.length.toLocaleString() }} 字符</p>
        </div>
      </div>
    </div>

    <!-- Base64 转图片 -->
    <div v-if="mode === 'toImage'" class="space-y-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">粘贴 Base64 数据</h3>
        <el-input
          v-model="base64Input"
          type="textarea"
          :rows="8"
          placeholder="粘贴 Base64 字符串或完整的 Data URL（data:image/png;base64,...）"
          class="font-mono text-xs"
        />
        <div class="flex gap-2">
          <el-button type="primary" @click="decodeBase64" :disabled="!base64Input.trim()">解码图片</el-button>
          <el-button @click="base64Input = ''; decodedImage = ''">清空</el-button>
          <el-button @click="pasteFromClipboard">从剪贴板粘贴</el-button>
        </div>
      </div>

      <!-- 解码结果 -->
      <div v-if="decodedImage" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">解码结果</h3>
          <el-button type="primary" @click="downloadDecoded">
            <el-icon><Download /></el-icon>
            下载图片
          </el-button>
        </div>
        <div class="flex justify-center overflow-auto">
          <img :src="decodedImage" class="max-w-full max-h-[400px] object-contain rounded-lg border border-gray-200 dark:border-gray-700" />
        </div>
      </div>

      <!-- 错误提示 -->
      <el-alert v-if="decodeError" :title="decodeError" type="error" show-icon @close="decodeError = ''" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, CopyDocument, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const mode = ref<'toBase64' | 'toImage'>('toBase64')
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

// 图片转 Base64
const imagePreview = ref('')
const fileName = ref('')
const fileSize = ref('')
const imageWidth = ref(0)
const imageHeight = ref(0)
const mimeType = ref('')
const rawBase64 = ref('')
const outputFormat = ref<'full' | 'pure'>('full')

const base64Output = computed(() => {
  if (!rawBase64.value) return ''
  return outputFormat.value === 'full' ? rawBase64.value : rawBase64.value.split(',')[1] || ''
})

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file?.type.startsWith('image/')) processFile(file)
}

const processFile = (file: File) => {
  fileName.value = file.name
  fileSize.value = formatSize(file.size)
  mimeType.value = file.type

  const reader = new FileReader()
  reader.onload = (e) => {
    rawBase64.value = e.target?.result as string
    imagePreview.value = rawBase64.value

    const img = new Image()
    img.onload = () => {
      imageWidth.value = img.naturalWidth
      imageHeight.value = img.naturalHeight
    }
    img.src = rawBase64.value
  }
  reader.readAsDataURL(file)
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const copyBase64 = () => {
  navigator.clipboard.writeText(base64Output.value)
  ElMessage.success('已复制到剪贴板')
}

// Base64 转图片
const base64Input = ref('')
const decodedImage = ref('')
const decodeError = ref('')

const decodeBase64 = () => {
  decodeError.value = ''
  decodedImage.value = ''

  let data = base64Input.value.trim()

  // 自动补全 Data URL 前缀
  if (!data.startsWith('data:')) {
    // 尝试检测格式
    const header = data.substring(0, 20)
    let mime = 'image/png'
    if (header.startsWith('/9j/')) mime = 'image/jpeg'
    else if (header.startsWith('iVBOR')) mime = 'image/png'
    else if (header.startsWith('R0lGOD')) mime = 'image/gif'
    else if (header.startsWith('UklGR')) mime = 'image/webp'
    else if (header.startsWith('Qk')) mime = 'image/bmp'
    data = `data:${mime};base64,${data}`
  }

  // 验证
  const img = new Image()
  img.onload = () => {
    decodedImage.value = data
  }
  img.onerror = () => {
    decodeError.value = '无法解码该 Base64 数据，请检查格式是否正确'
  }
  img.src = data
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    base64Input.value = text
    ElMessage.success('已粘贴')
  } catch {
    ElMessage.warning('无法访问剪贴板，请手动粘贴')
  }
}

const downloadDecoded = () => {
  if (!decodedImage.value) return
  const a = document.createElement('a')
  a.href = decodedImage.value
  // 从 data URL 推断扩展名
  const ext = decodedImage.value.match(/data:image\/(\w+)/)?.[1] || 'png'
  a.download = `decoded_${Date.now()}.${ext === 'jpeg' ? 'jpg' : ext}`
  a.click()
}
</script>
