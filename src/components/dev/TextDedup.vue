<template>
  <div class="space-y-6">
    <!-- Text Input -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">文本去重</h3>
        <div class="flex gap-2">
          <el-button size="small" @click="clearText">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
          <el-button size="small" @click="pasteText">
            <el-icon><DocumentCopy /></el-icon>
            粘贴
          </el-button>
        </div>
      </div>
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="8"
        placeholder="输入文本，每行一条，将自动去除重复行..."
      />
    </div>

    <!-- Options -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-wrap items-center gap-4 mb-4">
        <el-checkbox v-model="options.trimSpaces">去除首尾空格</el-checkbox>
        <el-checkbox v-model="options.ignoreCase">忽略大小写</el-checkbox>
        <el-checkbox v-model="options.removeEmpty">删除空行</el-checkbox>
        <el-checkbox v-model="options.sortOutput">按字母排序</el-checkbox>
      </div>
      <div class="flex gap-2">
        <el-button type="primary" @click="deduplicate">
          <el-icon><Operation /></el-icon>
          去重
        </el-button>
        <el-button @click="copyResult">
          <el-icon><DocumentCopy /></el-icon>
          复制结果
        </el-button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result !== null" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">去重结果</h3>
        <div class="flex gap-4 text-sm text-gray-500">
          <span>原始行数: <strong class="text-gray-900 dark:text-white">{{ stats.total }}</strong></span>
          <span>去重后: <strong class="text-blue-600">{{ stats.unique }}</strong></span>
          <span>去除: <strong class="text-red-500">{{ stats.duplicates }}</strong></span>
        </div>
      </div>
      <el-input
        v-model="result"
        type="textarea"
        :rows="8"
        readonly
      />
    </div>

    <!-- Preview -->
    <div v-if="result !== null" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">逐行对比</h3>
      <div class="space-y-1 max-h-64 overflow-y-auto">
        <div
          v-for="(line, idx) in inputLines"
          :key="idx"
          class="flex items-center gap-2 text-sm font-mono"
        >
          <span class="w-6 text-right text-gray-400">{{ idx + 1 }}</span>
          <span
            :class="duplicates.has(line.toLowerCase().trim()) ? 'text-red-500 line-through' : 'text-green-600'"
          >
            {{ line }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard } from '@/utils/clipboard'
import { ref, computed } from 'vue'
import { Delete, DocumentCopy, Operation } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const result = ref<string | null>(null)

const options = ref({
  trimSpaces: true,
  ignoreCase: false,
  removeEmpty: true,
  sortOutput: false,
})

const inputLines = computed(() => inputText.value.split('\n'))

const duplicates = computed(() => {
  // Return a set of lines that appear more than once (lowercased)
  const map = new Map<string, number>()
  for (const line of inputLines.value) {
    const key = options.value.ignoreCase ? line.toLowerCase().trim() : line.trim()
    map.set(key, (map.get(key) || 0) + 1)
  }
  const dupSet = new Set<string>()
  map.forEach((count, key) => {
    if (count > 1) dupSet.add(key)
  })
  return dupSet
})

const stats = computed(() => {
  const total = inputLines.value.length
  const resultLines = result.value ? result.value.split('\n').filter(l => l !== '') : []
  const unique = resultLines.length
  return { total, unique, duplicates: total - unique }
})

const clearText = () => {
  inputText.value = ''
  result.value = null
}

const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
  } catch {
    ElMessage.warning('无法读取剪贴板')
  }
}

const deduplicate = () => {
  const lines = inputText.value.split('\n')
  let processedLines = lines

  if (options.value.trimSpaces) {
    processedLines = processedLines.map(l => l.trim())
  }

  if (options.value.removeEmpty) {
    processedLines = processedLines.filter(l => l.length > 0)
  }

  const seen = new Set<string>()
  const uniqueLines: string[] = []
  for (const line of processedLines) {
    const key = options.value.ignoreCase ? line.toLowerCase() : line
    if (!seen.has(key)) {
      seen.add(key)
      uniqueLines.push(line)
    }
  }

  let output = uniqueLines
  if (options.value.sortOutput) {
    output = [...uniqueLines].sort((a, b) => {
      return options.value.ignoreCase ? a.toLowerCase().localeCompare(b.toLowerCase()) : a.localeCompare(b)
    })
  }

  result.value = output.join('\n')
  ElMessage.success(`去重完成：${lines.length} → ${output.length} 行`)
}

const copyResult = async () => {
  if (!result.value) {
    ElMessage.warning('请先执行去重操作')
    return
  }
  try {
    await copyToClipboard(result.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>
