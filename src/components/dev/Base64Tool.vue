<template>
  <div class="space-y-6">
    <!-- Mode Switch -->
    <div class="flex gap-4 justify-center">
      <el-radio-group v-model="mode">
        <el-radio-button label="encode">编码</el-radio-button>
        <el-radio-button label="decode">解码</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Input/Output Area -->
    <div class="grid md:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ mode === 'encode' ? '输入文本' : '输入 Base64' }}
          </h3>
          <div class="flex gap-2">
            <el-button size="small" @click="clearInput">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>
        <el-input
          v-model="input"
          type="textarea"
          :rows="10"
          :placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'"
          class="font-mono"
        />
      </div>

      <!-- Output -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ mode === 'encode' ? 'Base64 结果' : '解码结果' }}
          </h3>
          <el-button size="small" :disabled="!output" @click="copyOutput">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
        <el-input
          v-model="output"
          type="textarea"
          :rows="10"
          readonly
          class="font-mono"
          :class="{ 'border-red-500': error }"
        />
        <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 justify-center">
      <el-button type="primary" size="large" @click="process" :disabled="!input">
        {{ mode === 'encode' ? '编码' : '解码' }}
      </el-button>
    </div>

    <!-- File to Base64 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">文件转 Base64</h3>
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
      </el-upload>
      <div v-if="fileBase64" class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">文件名: {{ fileName }}</span>
          <el-button size="small" @click="copyFileBase64">
            <el-icon><CopyDocument /></el-icon>
            复制 Base64
          </el-button>
        </div>
        <el-input
          v-model="fileBase64"
          type="textarea"
          :rows="4"
          readonly
          class="font-mono"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Delete, CopyDocument, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')
const output = ref('')
const error = ref('')
const fileBase64 = ref('')
const fileName = ref('')

const process = () => {
  error.value = ''
  try {
    if (mode.value === 'encode') {
      output.value = btoa(unescape(encodeURIComponent(input.value)))
    } else {
      output.value = decodeURIComponent(escape(atob(input.value)))
    }
  } catch (e) {
    error.value = mode.value === 'encode' ? '编码失败' : '解码失败：无效的 Base64 字符串'
    output.value = ''
  }
}

const clearInput = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}

const copyOutput = () => {
  navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
}

const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = () => {
    fileBase64.value = reader.result as string
    fileName.value = file.name
  }
  reader.readAsDataURL(file.raw)
}

const copyFileBase64 = () => {
  navigator.clipboard.writeText(fileBase64.value)
  ElMessage.success('文件 Base64 已复制')
}

// Auto process when mode changes
watch([mode, input], () => {
  if (input.value) {
    process()
  }
})
</script>
