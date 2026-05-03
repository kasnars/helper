<template>
  <div class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Encode -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">URL 编码</h3>
        
        <el-input
          v-model="encodeInput"
          type="textarea"
          :rows="4"
          placeholder="输入需要编码的内容..."
        />

        <el-button type="primary" class="w-full mt-4" @click="handleEncode">
          编码
        </el-button>

        <div v-if="encodeResult" class="mt-4">
          <el-input
            v-model="encodeResult"
            type="textarea"
            :rows="4"
            readonly
            class="w-full"
          />
          <div class="flex gap-2 mt-2">
            <el-button size="small" @click="copyText(encodeResult)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </div>
      </div>

      <!-- Decode -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">URL 解码</h3>
        
        <el-input
          v-model="decodeInput"
          type="textarea"
          :rows="4"
          placeholder="输入需要解码的内容..."
        />

        <el-button type="primary" class="w-full mt-4" @click="handleDecode">
          解码
        </el-button>

        <div v-if="decodeResult" class="mt-4">
          <el-input
            v-model="decodeResult"
            type="textarea"
            :rows="4"
            readonly
            class="w-full"
          />
          <div class="flex gap-2 mt-2">
            <el-button size="small" @click="copyText(decodeResult)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- URL Parser -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">URL 解析</h3>
      
      <el-input
        v-model="urlInput"
        placeholder="输入完整的 URL..."
        @input="parseURL"
      />

      <div v-if="parsedURL" class="mt-4 space-y-3">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="协议">{{ parsedURL.protocol }}</el-descriptions-item>
          <el-descriptions-item label="主机名">{{ parsedURL.hostname }}</el-descriptions-item>
          <el-descriptions-item label="端口">{{ parsedURL.port || '默认' }}</el-descriptions-item>
          <el-descriptions-item label="路径">{{ parsedURL.pathname }}</el-descriptions-item>
          <el-descriptions-item label="查询参数">
            <div v-if="parsedURL.params.length > 0" class="space-y-2">
              <div v-for="param in parsedURL.params" :key="param.key" class="flex items-center gap-2">
                <el-tag size="small">{{ param.key }}</el-tag>
                <span class="text-gray-600 dark:text-gray-400">{{ param.value }}</span>
              </div>
            </div>
            <span v-else class="text-gray-400">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="锚点">{{ parsedURL.hash || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- Quick Examples -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速示例</h3>
      <div class="flex flex-wrap gap-3">
        <el-button @click="applyExample('chinese')">中文编码</el-button>
        <el-button @click="applyExample('special')">特殊字符</el-button>
        <el-button @click="applyExample('json')">JSON 数据</el-button>
        <el-button @click="applyExample('url')">完整 URL</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const encodeInput = ref('')
const encodeResult = ref('')
const decodeInput = ref('')
const decodeResult = ref('')
const urlInput = ref('')
const parsedURL = ref<{
  protocol: string
  hostname: string
  port: string
  pathname: string
  params: Array<{ key: string; value: string }>
  hash: string
} | null>(null)

const handleEncode = () => {
  if (!encodeInput.value) return
  try {
    encodeResult.value = encodeURIComponent(encodeInput.value)
    ElMessage.success('编码成功')
  } catch {
    ElMessage.error('编码失败')
  }
}

const handleDecode = () => {
  if (!decodeInput.value) return
  try {
    decodeResult.value = decodeURIComponent(decodeInput.value)
    ElMessage.success('解码成功')
  } catch {
    ElMessage.error('解码失败，输入内容格式不正确')
  }
}

const parseURL = () => {
  if (!urlInput.value) {
    parsedURL.value = null
    return
  }

  try {
    const url = new URL(urlInput.value)
    const params: Array<{ key: string; value: string }> = []
    
    url.searchParams.forEach((value, key) => {
      params.push({ key, value })
    })

    parsedURL.value = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      params,
      hash: url.hash,
    }
  } catch {
    parsedURL.value = null
  }
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const applyExample = (type: string) => {
  const examples: Record<string, string> = {
    chinese: '你好世界！这是一个测试。',
    special: 'Hello World! @#$%^&*()',
    json: '{"name":"张三","age":25,"city":"北京"}',
    url: 'https://www.example.com/search?q=Vue.js&page=1&limit=10#results',
  }

  if (type === 'url') {
    urlInput.value = examples[type]
    parseURL()
  } else {
    encodeInput.value = examples[type]
    handleEncode()
  }
}
</script>
