<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 输入 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📝 输入 JSON</h3>
        <el-input
          v-model="jsonInput"
          type="textarea"
          :rows="12"
          placeholder='粘贴JSON数据，例如：{"name":"张三","age":25,"tags":["a","b"]}'
          class="font-mono text-sm"
        />
        <div class="mt-3 flex gap-2 flex-wrap">
          <el-button type="primary" @click="parseJson" :disabled="!jsonInput.trim()">
            <el-icon><View /></el-icon> 解析并查看
          </el-button>
          <el-button @click="loadExample">加载示例</el-button>
          <el-button @click="clearAll">清空</el-button>
        </div>
      </div>

      <!-- 工具栏 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">🔍 搜索与操作</h3>
        <el-input
          v-model="searchQuery"
          placeholder="搜索 Key 或 Value..."
          clearable
          prefix-icon="Search"
          class="mb-3"
          @input="onSearch"
        />
        <div class="flex gap-2 mb-3">
          <el-button size="small" @click="expandAll">展开全部</el-button>
          <el-button size="small" @click="collapseAll">折叠全部</el-button>
          <el-button size="small" @click="copyJson" :disabled="!parsedData">
            <el-icon><CopyDocument /></el-icon> 复制格式化
          </el-button>
        </div>
        <!-- 统计信息 -->
        <div v-if="stats" class="grid grid-cols-3 gap-2">
          <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.total }}</div>
            <div class="text-xs text-gray-500">总节点数</div>
          </div>
          <div class="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.maxDepth }}</div>
            <div class="text-xs text-gray-500">最大深度</div>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.size }}</div>
            <div class="text-xs text-gray-500">数据大小</div>
          </div>
        </div>
        <!-- 类型统计 -->
        <div v-if="stats && stats.typeCount" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="(count, type) in stats.typeCount"
            :key="type"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="getTypeBadgeClass(type as string)"
          >
            {{ type }}: {{ count }}
          </span>
        </div>
      </div>
    </div>

    <!-- 树形视图 -->
    <div v-if="parsedData !== null">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">🌳 树形结构</h3>
      <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-auto max-h-[500px] bg-gray-50 dark:bg-gray-900 p-4 font-mono text-sm">
        <TreeNode
          :data="parsedData"
          :key-name="rootKey"
          :depth="0"
          :search="searchQuery"
          :expanded-paths="expandedPaths"
          @toggle="togglePath"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="parsedData === null && !error" class="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
      <p>粘贴JSON数据后点击解析</p>
    </div>

    <!-- 错误提示 -->
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
  </div>
</template>

<script setup lang="ts">

import { copyToClipboard } from '@/utils/clipboard'
import { ref, reactive, computed } from 'vue'
import { View, CopyDocument, Search } from '@element-plus/icons-vue'
import TreeNode from './TreeNode.vue'

interface TreeNodeData {
  key: string
  value: any
  type: string
  depth: number
  path: string
  childCount?: number
}

const jsonInput = ref('')
const parsedData = ref<any>(null)
const rootKey = ref('root')
const error = ref('')
const searchQuery = ref('')
const expandedPaths = reactive<Set<string>>(new Set())

interface Stats {
  total: number
  maxDepth: number
  size: string
  typeCount: Record<string, number>
}

const stats = ref<Stats | null>(null)

const parseJson = () => {
  error.value = ''
  try {
    const data = JSON.parse(jsonInput.value)
    parsedData.value = data
    stats.value = analyzeData(data)
    expandAll()
  } catch (e) {
    error.value = 'JSON格式错误：' + (e as Error).message
    parsedData.value = null
    stats.value = null
  }
}

const analyzeData = (data: any): Stats => {
  let total = 0
  let maxDepth = 0
  const typeCount: Record<string, number> = {}

  const traverse = (obj: any, depth: number) => {
    if (depth > maxDepth) maxDepth = depth
    total++

    const type = getJsonType(obj)
    typeCount[type] = (typeCount[type] || 0) + 1

    if (type === 'object' && obj !== null) {
      const keys = Object.keys(obj)
      keys.forEach(k => traverse(obj[k], depth + 1))
    } else if (type === 'array') {
      obj.forEach((item: any) => traverse(item, depth + 1))
    }
  }

  traverse(data, 0)

  const sizeBytes = new Blob([JSON.stringify(data)]).size
  const size = sizeBytes > 1024 ? (sizeBytes / 1024).toFixed(1) + ' KB' : sizeBytes + ' B'

  return { total, maxDepth, size, typeCount }
}

const getJsonType = (value: any): string => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

const togglePath = (path: string) => {
  if (expandedPaths.has(path)) {
    expandedPaths.delete(path)
  } else {
    expandedPaths.add(path)
  }
}

const expandAll = () => {
  if (parsedData.value === null) return
  const paths = new Set<string>()
  const traverse = (obj: any, path: string) => {
    const type = getJsonType(obj)
    if (type === 'object' && obj !== null) {
      paths.add(path)
      Object.keys(obj).forEach(k => traverse(obj[k], path + '.' + k))
    } else if (type === 'array') {
      paths.add(path)
      obj.forEach((item: any, i: number) => traverse(item, path + '[' + i + ']'))
    }
  }
  traverse(parsedData.value, 'root')
  expandedPaths.clear()
  paths.forEach(p => expandedPaths.add(p))
}

const collapseAll = () => {
  expandedPaths.clear()
}

const copyJson = async () => {
  if (parsedData.value === null) return
  try {
    await copyToClipboard(JSON.stringify(parsedData.value, null, 2))
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = JSON.stringify(parsedData.value, null, 2)
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

const onSearch = () => {
  if (searchQuery.value && parsedData.value !== null) {
    expandAll()
  }
}

const loadExample = () => {
  jsonInput.value = JSON.stringify({
    name: '张三',
    age: 25,
    isActive: true,
    address: {
      city: '北京',
      district: '朝阳区',
      zip: '100000'
    },
    hobbies: ['编程', '阅读', '跑步'],
    scores: [95, 87, 92],
    metadata: null,
    projects: [
      { id: 1, name: '项目A', status: 'completed' },
      { id: 2, name: '项目B', status: 'in-progress' }
    ]
  }, null, 2)
  parseJson()
}

const clearAll = () => {
  jsonInput.value = ''
  parsedData.value = null
  error.value = ''
  searchQuery.value = ''
  stats.value = null
  expandedPaths.clear()
}

const getTypeBadgeClass = (type: string): string => {
  const classes: Record<string, string> = {
    string: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    number: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    boolean: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    object: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    array: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    null: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
  }
  return classes[type] || classes.null
}
</script>
