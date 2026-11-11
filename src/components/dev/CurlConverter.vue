<template>
  <div class="space-y-4" data-testid="curl-tool">
    <el-input v-model="command" type="textarea" :rows="6" placeholder="粘贴 curl 命令，支持换行反斜杠" data-testid="curl-input" />
    <div class="flex flex-wrap gap-2">
      <el-button type="primary" data-testid="curl-convert" @click="convert">转换</el-button>
      <el-button @click="loadSample">示例</el-button>
    </div>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <div v-for="item in outputs" :key="item.label" class="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.label }}</h3>
        <el-button size="small" @click="copy(item.code)">复制</el-button>
      </div>
      <pre class="overflow-auto rounded-lg bg-gray-950 p-3 text-sm text-green-300">{{ item.code }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { parseCurl, toAxios, toFetch, toNode } from '@/lib/curl'
import { copyToClipboard } from '@/utils/clipboard'

const command = ref('')
const error = ref('')
const outputs = ref<{ label: string; code: string }[]>([])

const convert = () => {
  try {
    const request = parseCurl(command.value)
    outputs.value = [
      { label: 'fetch', code: toFetch(request) },
      { label: 'axios', code: toAxios(request) },
      { label: 'Node.js', code: toNode(request) },
    ]
    error.value = ''
  } catch (reason) {
    outputs.value = []
    error.value = reason instanceof Error ? reason.message : '转换失败'
  }
}

const loadSample = () => {
  command.value = "curl 'https://api.example.com/users' \\\n  -X POST \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\":\"小林\"}'"
  convert()
}

const copy = async (text: string) => {
  await copyToClipboard(text)
  ElMessage.success('已复制')
}
</script>
