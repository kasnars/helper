<template>
  <div class="space-y-6">
    <!-- Mode Switch -->
    <div class="flex gap-4 justify-center">
      <el-radio-group v-model="mode">
        <el-radio-button label="editor">编辑器</el-radio-button>
        <el-radio-button label="diff">对比工具</el-radio-button>
        <el-radio-button label="tree">树形查看</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Editor Mode -->
    <template v-if="mode === 'editor'">
      <div class="grid md:grid-cols-2 gap-4">
        <!-- Input -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">输入 JSON</h3>
            <div class="flex gap-2">
              <el-button size="small" @click="formatJson">
                <el-icon><Document /></el-icon>
                格式化
              </el-button>
              <el-button size="small" @click="compressJson">
                <el-icon><Fold /></el-icon>
                压缩
              </el-button>
              <el-button type="danger" size="small" link @click="clearEditor">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <el-input
            v-model="jsonInput"
            type="textarea"
            :rows="12"
            placeholder="粘贴 JSON 数据..."
            class="font-mono"
            :class="{ 'border-red-500': jsonError }"
          />
          <p v-if="jsonError" class="mt-2 text-sm text-red-500">{{ jsonError }}</p>
        </div>

        <!-- Output -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">结果</h3>
            <el-button size="small" :disabled="!jsonOutput" @click="copyOutput">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
          <el-input
            v-model="jsonOutput"
            type="textarea"
            :rows="12"
            readonly
            class="font-mono"
          />
          <div v-if="jsonStats" class="mt-4 grid grid-cols-3 gap-4 text-center">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <p class="text-xs text-gray-500">字符数</p>
              <p class="font-mono font-semibold">{{ jsonStats.chars }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <p class="text-xs text-gray-500">行数</p>
              <p class="font-mono font-semibold">{{ jsonStats.lines }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <p class="text-xs text-gray-500">大小</p>
              <p class="font-mono font-semibold">{{ jsonStats.size }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- JSON to Other Formats -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">转换为其他格式</h3>
        <div class="flex flex-wrap gap-3">
          <el-button @click="convertToYaml" :disabled="!parsedJson">
            转 YAML
          </el-button>
          <el-button @click="convertToCsv" :disabled="!parsedJson || !isArray">
            转 CSV (数组)
          </el-button>
          <el-button @click="convertToTypescript" :disabled="!parsedJson">
            转 TypeScript 接口
          </el-button>
          <el-button @click="escapeJson" :disabled="!jsonInput">
            转义字符串
          </el-button>
          <el-button @click="unescapeJson" :disabled="!jsonInput">
            去转义
          </el-button>
        </div>
      </div>
    </template>

    <!-- Diff Mode -->
    <template v-if="mode === 'diff'">
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">原始 JSON</h3>
            <el-button type="primary" size="small" @click="compareJson">
              <el-icon><Refresh /></el-icon>
              对比
            </el-button>
          </div>
          <el-input
            v-model="diffLeft"
            type="textarea"
            :rows="10"
            placeholder="原始 JSON..."
            class="font-mono"
          />
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">对比 JSON</h3>
            <el-button size="small" @click="swapDiff">
              <el-icon><Sort /></el-icon>
              交换
            </el-button>
          </div>
          <el-input
            v-model="diffRight"
            type="textarea"
            :rows="10"
            placeholder="对比 JSON..."
            class="font-mono"
          />
        </div>
      </div>

      <!-- Diff Result -->
      <div v-if="diffResult.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">对比结果</h3>
        <div class="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
          <div
            v-for="(line, index) in diffResult"
            :key="index"
            class="px-2 py-1 rounded"
            :class="{
              'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200': line.type === 'added',
              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200': line.type === 'removed',
              'bg-gray-50 dark:bg-gray-700/30': line.type === 'unchanged'
            }"
          >
            <span class="inline-block w-6 text-gray-400 select-none">{{ line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ' }}</span>
            <span>{{ line.text }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Tree Mode -->
    <template v-if="mode === 'tree'">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">JSON 树形查看</h3>
          <el-button size="small" @click="expandAll">展开全部</el-button>
          <el-button size="small" @click="collapseAll">折叠全部</el-button>
        </div>
        <el-input
          v-model="treeInput"
          type="textarea"
          :rows="6"
          placeholder="粘贴 JSON..."
          class="font-mono mb-4"
        />
        <div v-if="treeData" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto">
          <JsonTree :data="treeData" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Delete, CopyDocument, Refresh, Sort } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import JsonTree from './JsonTree.vue'

const mode = ref<'editor' | 'diff' | 'tree'>('editor')
const jsonInput = ref('')
const jsonOutput = ref('')
const jsonError = ref('')

const diffLeft = ref('')
const diffRight = ref('')
const diffResult = ref<Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }>>([])

const treeInput = ref('')
const treeData = ref<any>(null)

const parsedJson = computed(() => {
  try {
    return JSON.parse(jsonInput.value)
  } catch {
    return null
  }
})

const isArray = computed(() => Array.isArray(parsedJson.value))

const jsonStats = computed(() => {
  if (!jsonOutput.value) return null
  return {
    chars: jsonOutput.value.length,
    lines: jsonOutput.value.split('\n').length,
    size: formatBytes(new Blob([jsonOutput.value]).size),
  }
})

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonOutput.value = JSON.stringify(parsed, null, 2)
    jsonError.value = ''
  } catch (e) {
    jsonError.value = '无效的 JSON 格式'
  }
}

const compressJson = () => {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonOutput.value = JSON.stringify(parsed)
    jsonError.value = ''
  } catch (e) {
    jsonError.value = '无效的 JSON 格式'
  }
}

const clearEditor = () => {
  jsonInput.value = ''
  jsonOutput.value = ''
  jsonError.value = ''
}

const copyOutput = () => {
  navigator.clipboard.writeText(jsonOutput.value)
  ElMessage.success('已复制')
}

const convertToYaml = () => {
  // Simple YAML conversion
  const obj = parsedJson.value
  jsonOutput.value = objectToYaml(obj)
}

const objectToYaml = (obj: any, indent = 0): string => {
  const spaces = '  '.repeat(indent)
  if (obj === null) return 'null'
  if (typeof obj === 'string') return obj
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map(item => `${spaces}- ${objectToYaml(item, indent + 1).trim()}`).join('\n')
  }
  const entries = Object.entries(obj)
  if (entries.length === 0) return '{}'
  return entries.map(([key, value]) => {
    const valueStr = objectToYaml(value, indent + 1)
    if (typeof value === 'object' && value !== null) {
      return `${spaces}${key}:\n${valueStr}`
    }
    return `${spaces}${key}: ${valueStr}`
  }).join('\n')
}

const convertToCsv = () => {
  const arr = parsedJson.value as any[]
  if (!arr.length) return
  const headers = Object.keys(arr[0])
  const rows = arr.map(obj => headers.map(h => obj[h]).join(','))
  jsonOutput.value = [headers.join(','), ...rows].join('\n')
}

const convertToTypescript = () => {
  const obj = parsedJson.value
  const interfaces = generateTypescript(obj, 'Root')
  jsonOutput.value = interfaces
}

const generateTypescript = (obj: any, name: string): string => {
  if (obj === null) return 'null'
  if (typeof obj !== 'object') return typeof obj
  if (Array.isArray(obj)) {
    const itemType = obj.length > 0 ? generateTypescript(obj[0], name + 'Item') : 'any'
    return `${itemType}[]`
  }
  const fields = Object.entries(obj).map(([key, value]) => {
    const optional = value === undefined ? '?' : ''
    const type = value === undefined ? 'any' : generateTypescript(value, capitalize(key))
    return `  ${key}${optional}: ${type};`
  }).join('\n')
  return `interface ${name} {\n${fields}\n}`
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const escapeJson = () => {
  jsonOutput.value = JSON.stringify(jsonInput.value)
}

const unescapeJson = () => {
  try {
    jsonOutput.value = JSON.parse(jsonInput.value)
  } catch {
    jsonError.value = '无法去转义'
  }
}

const compareJson = () => {
  try {
    const left = JSON.parse(diffLeft.value)
    const right = JSON.parse(diffRight.value)
    const leftStr = JSON.stringify(left, null, 2)
    const rightStr = JSON.stringify(right, null, 2)
    diffResult.value = simpleDiff(leftStr.split('\n'), rightStr.split('\n'))
  } catch {
    ElMessage.error('请确保两边都是有效的 JSON')
  }
}

const simpleDiff = (left: string[], right: string[]): Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> => {
  const result: Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> = []
  const maxLen = Math.max(left.length, right.length)
  for (let i = 0; i < maxLen; i++) {
    if (i >= left.length) {
      result.push({ type: 'added', text: right[i] })
    } else if (i >= right.length) {
      result.push({ type: 'removed', text: left[i] })
    } else if (left[i] !== right[i]) {
      result.push({ type: 'removed', text: left[i] })
      result.push({ type: 'added', text: right[i] })
    } else {
      result.push({ type: 'unchanged', text: left[i] })
    }
  }
  return result
}

const swapDiff = () => {
  const temp = diffLeft.value
  diffLeft.value = diffRight.value
  diffRight.value = temp
}

const expandAll = () => {
  document.querySelectorAll('.tree-item').forEach(el => {
    el.classList.remove('collapsed')
  })
}

const collapseAll = () => {
  document.querySelectorAll('.tree-item').forEach(el => {
    el.classList.add('collapsed')
  })
}

watch(treeInput, (val) => {
  try {
    treeData.value = JSON.parse(val)
  } catch {
    treeData.value = null
  }
})
</script>
