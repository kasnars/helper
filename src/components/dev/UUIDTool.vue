<template>
  <div class="space-y-6">
    <!-- UUID Generator -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">UUID 生成器</h3>
        <div class="flex gap-2">
          <el-select v-model="uuidVersion" class="w-32">
            <el-option label="Version 4" :value="4" />
            <el-option label="Version 1" :value="1" />
          </el-select>
          <el-input-number v-model="count" :min="1" :max="100" class="w-32" />
        </div>
      </div>
      
      <div class="space-y-4">
        <el-button type="primary" size="large" @click="generateUUIDs" class="w-full">
          生成 UUID
        </el-button>
        
        <div v-if="uuids.length > 0" class="space-y-2">
          <div
            v-for="(uuid, index) in uuids"
            :key="index"
            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex items-center justify-between"
          >
            <span class="font-mono text-sm flex-1 break-all">{{ uuid }}</span>
            <el-button size="small" link @click="copyToClipboard(uuid)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
        
        <div v-if="uuids.length > 0" class="flex gap-2">
          <el-button @click="copyAll" class="flex-1">
            <el-icon><CopyDocument /></el-icon>
            复制全部
          </el-button>
          <el-button @click="downloadUUIDs" class="flex-1">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
          <el-button @click="clearUUIDs" class="flex-1">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>
    </div>

    <!-- UUID Validator -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">UUID 验证器</h3>
      <div class="space-y-4">
        <el-input
          v-model="uuidToValidate"
          placeholder="输入 UUID 进行验证..."
          @input="validateUUID"
        />
        
        <div v-if="validationResult" class="p-4 rounded-lg" :class="validationResult.valid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
          <div class="flex items-center gap-2">
            <el-icon :size="24" :color="validationResult.valid ? '#67C23A' : '#F56C6C'">
              <component :is="validationResult.valid ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
            </el-icon>
            <div>
              <p class="font-semibold" :class="validationResult.valid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                {{ validationResult.valid ? '有效的 UUID' : '无效的 UUID' }}
              </p>
              <p v-if="validationResult.version" class="text-sm mt-1 text-gray-600 dark:text-gray-400">
                版本: {{ validationResult.version }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- UUID Info -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">UUID 信息</h3>
      <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="font-semibold text-gray-900 dark:text-white mb-1">什么是 UUID?</p>
          <p>UUID (Universally Unique Identifier) 是通用唯一识别码,是一个 128 位的标识符,用于在分布式系统中唯一标识信息。</p>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="font-semibold text-gray-900 dark:text-white mb-1">UUID 格式</p>
          <p class="font-mono text-xs">xxxxxxxx-xxxx-Vxxx-yxxx-xxxxxxxxxxxx</p>
          <p class="mt-2">V 表示版本号 (1-5),y 表示变体 (8, 9, A, B)</p>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="font-semibold text-gray-900 dark:text-white mb-1">UUID 版本</p>
          <ul class="list-disc list-inside space-y-1 mt-2">
            <li><strong>Version 1:</strong> 基于时间和 MAC 地址</li>
            <li><strong>Version 4:</strong> 基于随机数 (最常用)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument, Download, Delete, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const uuidVersion = ref(4)
const count = ref(5)
const uuids = ref<string[]>([])
const uuidToValidate = ref('')
const validationResult = ref<any>(null)

const generateUUIDs = () => {
  uuids.value = []
  for (let i = 0; i < count.value; i++) {
    uuids.value.push(generateUUID(uuidVersion.value))
  }
  ElMessage.success(`已生成 ${count.value} 个 UUID`)
}

const generateUUID = (version: number): string => {
  if (version === 4) {
    return generateUUIDv4()
  } else {
    return generateUUIDv1()
  }
}

const generateUUIDv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const generateUUIDv1 = (): string => {
  const now = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
  return uuid
}

const validateUUID = () => {
  if (!uuidToValidate.value) {
    validationResult.value = null
    return
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const valid = uuidRegex.test(uuidToValidate.value)
  
  if (valid) {
    const version = uuidToValidate.value[14]
    validationResult.value = {
      valid: true,
      version: `Version ${version.toUpperCase()}`
    }
  } else {
    validationResult.value = {
      valid: false
    }
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

const copyAll = () => {
  const allUUIDs = uuids.value.join('\n')
  navigator.clipboard.writeText(allUUIDs)
  ElMessage.success(`已复制 ${uuids.value.length} 个 UUID`)
}

const downloadUUIDs = () => {
  const content = uuids.value.join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `uuids_${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已下载')
}

const clearUUIDs = () => {
  uuids.value = []
  ElMessage.success('已清空')
}
</script>
