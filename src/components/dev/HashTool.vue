<template>
  <div class="space-y-6">
    <!-- Hash Generator -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">哈希生成器</h3>
      <div class="space-y-4">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="4"
          placeholder="输入要计算哈希的文本..."
          @input="generateHashes"
        />
        
        <div v-if="hashes" class="space-y-3">
          <div
            v-for="(hash, algorithm) in hashes"
            :key="algorithm"
            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-sm text-gray-700 dark:text-gray-300">{{ algorithm }}</span>
              <el-button size="small" @click="copyToClipboard(hash)">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
            <p class="font-mono text-xs break-all text-gray-900 dark:text-white">{{ hash }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- File Hash -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">文件哈希计算</h3>
      <div class="space-y-4">
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
        
        <div v-if="fileHashes" class="space-y-3">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            文件: {{ fileName }} ({{ formatFileSize(fileSize) }})
          </div>
          <div
            v-for="(hash, algorithm) in fileHashes"
            :key="algorithm"
            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-sm text-gray-700 dark:text-gray-300">{{ algorithm }}</span>
              <el-button size="small" @click="copyToClipboard(hash)">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
            <p class="font-mono text-xs break-all text-gray-900 dark:text-white">{{ hash }}</p>
          </div>
        </div>
        
        <div v-if="calculating" class="text-center py-4">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">正在计算哈希...</p>
        </div>
      </div>
    </div>

    <!-- Hash Compare -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">哈希值对比</h3>
      <div class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">哈希值 1</label>
            <el-input v-model="hash1" placeholder="输入第一个哈希值" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">哈希值 2</label>
            <el-input v-model="hash2" placeholder="输入第二个哈希值" />
          </div>
        </div>
        
        <div v-if="hash1 && hash2" class="p-4 rounded-lg" :class="hashMatch ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
          <div class="flex items-center gap-2">
            <el-icon :size="24" :color="hashMatch ? '#67C23A' : '#F56C6C'">
              <component :is="hashMatch ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
            </el-icon>
            <span class="font-semibold" :class="hashMatch ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
              {{ hashMatch ? '哈希值匹配' : '哈希值不匹配' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument, UploadFilled, Loading, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const hashes = ref<any>(null)

const fileName = ref('')
const fileSize = ref(0)
const fileHashes = ref<any>(null)
const calculating = ref(false)

const hash1 = ref('')
const hash2 = ref('')

const hashMatch = ref(false)

const generateHashes = async () => {
  if (!inputText.value) {
    hashes.value = null
    return
  }
  
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(inputText.value)
    
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
    const sha384Buffer = await crypto.subtle.digest('SHA-384', data)
    const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
    
    hashes.value = {
      'SHA-1': arrayBufferToHex(sha1Buffer),
      'SHA-256': arrayBufferToHex(sha256Buffer),
      'SHA-384': arrayBufferToHex(sha384Buffer),
      'SHA-512': arrayBufferToHex(sha512Buffer),
    }
  } catch (e) {
    ElMessage.error('哈希计算失败')
  }
}

const handleFileChange = async (file: any) => {
  fileName.value = file.name
  fileSize.value = file.size
  calculating.value = true
  fileHashes.value = null
  
  try {
    const buffer = await file.raw.arrayBuffer()
    
    const sha1Buffer = await crypto.subtle.digest('SHA-1', buffer)
    const sha256Buffer = await crypto.subtle.digest('SHA-256', buffer)
    const sha384Buffer = await crypto.subtle.digest('SHA-384', buffer)
    const sha512Buffer = await crypto.subtle.digest('SHA-512', buffer)
    
    fileHashes.value = {
      'SHA-1': arrayBufferToHex(sha1Buffer),
      'SHA-256': arrayBufferToHex(sha256Buffer),
      'SHA-384': arrayBufferToHex(sha384Buffer),
      'SHA-512': arrayBufferToHex(sha512Buffer),
    }
  } catch (e) {
    ElMessage.error('文件哈希计算失败')
  } finally {
    calculating.value = false
  }
}

const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

// Watch for hash comparison
import { watch } from 'vue'
watch([hash1, hash2], () => {
  if (hash1.value && hash2.value) {
    hashMatch.value = hash1.value.trim().toLowerCase() === hash2.value.trim().toLowerCase()
  }
})
</script>
