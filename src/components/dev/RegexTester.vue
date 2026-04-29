<template>
  <div class="space-y-6">
    <!-- Pattern Input -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">正则表达式</h3>
        <div class="flex gap-2">
          <el-checkbox v-model="flags.global">g</el-checkbox>
          <el-checkbox v-model="flags.ignoreCase">i</el-checkbox>
          <el-checkbox v-model="flags.multiline">m</el-checkbox>
          <el-checkbox v-model="flags.dotAll">s</el-checkbox>
          <el-checkbox v-model="flags.unicode">u</el-checkbox>
        </div>
      </div>
      <el-input
        v-model="pattern"
        placeholder="输入正则表达式，如: \\d+"
        size="large"
        class="font-mono"
      >
        <template #prepend>/</template>
        <template #append>/{{ flagString }}</template>
      </el-input>
      <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
    </div>

    <!-- Test String -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">测试文本</h3>
        <el-button type="primary" link @click="clearText">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
      <el-input
        v-model="testString"
        type="textarea"
        :rows="6"
        placeholder="输入要测试的文本..."
        class="font-mono"
      />
    </div>

    <!-- Results -->
    <div v-if="matches.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        匹配结果 ({{ matches.length }} 个)
      </h3>
      <div class="space-y-3">
        <div
          v-for="(match, index) in matches"
          :key="index"
          class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div class="flex items-center gap-2 mb-2">
            <el-tag type="primary" size="small">#{{ index + 1 }}</el-tag>
            <span class="text-sm text-gray-500">
              位置: {{ match.index }} - {{ match.index + match.text.length }}
            </span>
          </div>
          <p class="font-mono text-gray-900 dark:text-white break-all">{{ match.text }}</p>
          <div v-if="match.groups && Object.keys(match.groups).length > 0" class="mt-2">
            <p class="text-xs text-gray-500 mb-1">捕获组:</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(value, key) in match.groups"
                :key="key"
                class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
              >
                {{ key }}: {{ value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Highlighted Preview -->
    <div v-if="testString && pattern" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">高亮预览</h3>
      <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono whitespace-pre-wrap break-all">
        <template v-for="(part, index) in highlightedParts" :key="index">
          <mark v-if="part.matched" class="bg-yellow-200 dark:bg-yellow-600/50 px-1 rounded">{{ part.text }}</mark>
          <span v-else>{{ part.text }}</span>
        </template>
      </div>
    </div>

    <!-- Common Patterns -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">常用正则</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          v-for="preset in presets"
          :key="preset.name"
          class="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          @click="applyPreset(preset)"
        >
          <p class="font-medium text-gray-900 dark:text-white">{{ preset.name }}</p>
          <p class="text-sm text-gray-500 font-mono mt-1">{{ preset.pattern }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ preset.description }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface MatchResult {
  text: string
  index: number
  groups: Record<string, string>
}

const pattern = ref('')
const testString = ref('')
const error = ref('')
const matches = ref<MatchResult[]>([])

const flags = ref({
  global: true,
  ignoreCase: false,
  multiline: false,
  dotAll: false,
  unicode: false,
})

const flagString = computed(() => {
  let str = ''
  if (flags.value.global) str += 'g'
  if (flags.value.ignoreCase) str += 'i'
  if (flags.value.multiline) str += 'm'
  if (flags.value.dotAll) str += 's'
  if (flags.value.unicode) str += 'u'
  return str
})

const presets = [
  {
    name: '邮箱地址',
    pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
    description: '匹配标准邮箱格式',
    flags: '',
  },
  {
    name: '手机号码',
    pattern: '^1[3-9]\\d{9}$',
    description: '匹配中国大陆手机号',
    flags: '',
  },
  {
    name: '身份证号',
    pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',
    description: '匹配 18 位身份证号码',
    flags: '',
  },
  {
    name: 'URL 链接',
    pattern: 'https?://[\\w.-]+(?:\\.[\\w.-]+)+[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=]*',
    description: '匹配 HTTP/HTTPS 链接',
    flags: 'i',
  },
  {
    name: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]+',
    description: '匹配中文字符',
    flags: 'g',
  },
  {
    name: '日期格式',
    pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
    description: '匹配 YYYY-MM-DD 格式日期',
    flags: 'g',
  },
]

const highlightedParts = computed(() => {
  if (!pattern.value || !testString.value || matches.value.length === 0) {
    return [{ text: testString.value, matched: false }]
  }

  const parts: Array<{ text: string; matched: boolean }> = []
  let lastIndex = 0

  matches.value.forEach(match => {
    if (match.index > lastIndex) {
      parts.push({
        text: testString.value.slice(lastIndex, match.index),
        matched: false,
      })
    }
    parts.push({
      text: match.text,
      matched: true,
    })
    lastIndex = match.index + match.text.length
  })

  if (lastIndex < testString.value.length) {
    parts.push({
      text: testString.value.slice(lastIndex),
      matched: false,
    })
  }

  return parts
})

const testRegex = () => {
  error.value = ''
  matches.value = []

  if (!pattern.value || !testString.value) return

  try {
    const regex = new RegExp(pattern.value, flagString.value)
    const text = testString.value
    let match

    if (flags.value.global) {
      while ((match = regex.exec(text)) !== null) {
        matches.value.push({
          text: match[0],
          index: match.index,
          groups: match.groups || {},
        })
        if (match.index === regex.lastIndex) regex.lastIndex++
      }
    } else {
      match = regex.exec(text)
      if (match) {
        matches.value.push({
          text: match[0],
          index: match.index,
          groups: match.groups || {},
        })
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid regex'
  }
}

const clearText = () => {
  testString.value = ''
  matches.value = []
}

const applyPreset = (preset: typeof presets[0]) => {
  pattern.value = preset.pattern
  flags.value.global = preset.flags.includes('g')
  flags.value.ignoreCase = preset.flags.includes('i')
  flags.value.multiline = preset.flags.includes('m')
  flags.value.dotAll = preset.flags.includes('s')
  flags.value.unicode = preset.flags.includes('u')
  ElMessage.success(`已加载: ${preset.name}`)
}

watch([pattern, testString, flags], testRegex, { deep: true })
</script>
