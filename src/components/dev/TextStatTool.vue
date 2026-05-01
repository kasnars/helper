<template>
  <div class="space-y-6">
    <!-- Text Input -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">文本统计</h3>
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
        v-model="text"
        type="textarea"
        :rows="8"
        placeholder="输入或粘贴文本..."
        @input="analyzeText"
      />
    </div>

    <!-- Statistics -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 mb-1">字符数</p>
        <p class="font-mono text-2xl font-semibold text-blue-600 dark:text-blue-400">{{ stats.characters }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 mb-1">单词数</p>
        <p class="font-mono text-2xl font-semibold text-green-600 dark:text-green-400">{{ stats.words }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 mb-1">句子数</p>
        <p class="font-mono text-2xl font-semibold text-purple-600 dark:text-purple-400">{{ stats.sentences }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 mb-1">段落数</p>
        <p class="font-mono text-2xl font-semibold text-orange-600 dark:text-orange-400">{{ stats.paragraphs }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 mb-1">行数</p>
        <p class="font-mono text-2xl font-semibold text-pink-600 dark:text-pink-400">{{ stats.lines }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 mb-1">中文字符</p>
        <p class="font-mono text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{{ stats.chineseChars }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 mb-1">空格数</p>
        <p class="font-mono text-2xl font-semibold text-teal-600 dark:text-teal-400">{{ stats.spaces }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 mb-1">预估阅读时间</p>
        <p class="font-mono text-lg font-semibold text-red-600 dark:text-red-400">{{ stats.readingTime }}</p>
      </div>
    </div>

    <!-- Word Frequency -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">词频统计</h3>
      <div v-if="wordFrequency && wordFrequency.length > 0" class="space-y-2">
        <div
          v-for="(item, index) in wordFrequency.slice(0, 20)"
          :key="index"
          class="flex items-center gap-4"
        >
          <span class="text-sm text-gray-600 dark:text-gray-400 w-8">{{ index + 1 }}</span>
          <span class="font-mono text-sm flex-1">{{ item.word }}</span>
          <div class="flex-1">
            <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                class="bg-blue-500 h-full rounded-full transition-all"
                :style="{ width: (item.count / wordFrequency[0].count * 100) + '%' }"
              />
            </div>
          </div>
          <span class="font-mono text-sm w-12 text-right">{{ item.count }}</span>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500 text-center py-4">输入文本以查看词频统计</p>
    </div>

    <!-- Text Tools -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">文本工具</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <el-button @click="toUpperCase">转大写</el-button>
        <el-button @click="toLowerCase">转小写</el-button>
        <el-button @click="toTitleCase">首字母大写</el-button>
        <el-button @click="toSentenceCase">句首大写</el-button>
        <el-button @click="removeExtraSpaces">去除多余空格</el-button>
        <el-button @click="reverseText">反转文本</el-button>
        <el-button @click="removeDuplicateLines">去重行</el-button>
        <el-button @click="sortLines">排序行</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Delete, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const text = ref('')
const stats = ref<any>(null)
const wordFrequency = ref<Array<{ word: string; count: number }>>([])

const analyzeText = () => {
  if (!text.value) {
    stats.value = null
    wordFrequency.value = []
    return
  }
  
  const textValue = text.value
  
  // Basic statistics
  const characters = textValue.length
  const words = textValue.trim() ? textValue.trim().split(/\s+/).length : 0
  const sentences = textValue.split(/[.!?。！？]+/).filter(s => s.trim()).length
  const paragraphs = textValue.split(/\n\s*\n/).filter(p => p.trim()).length
  const lines = textValue.split('\n').length
  const chineseChars = (textValue.match(/[\u4e00-\u9fa5]/g) || []).length
  const spaces = (textValue.match(/\s/g) || []).length
  
  // Reading time (average 200-300 words per minute for Chinese, 200-250 for English)
  const readingMinutes = Math.ceil(words / 200)
  const readingTime = readingMinutes < 1 ? '少于 1 分钟' : `约 ${readingMinutes} 分钟`
  
  stats.value = {
    characters,
    words,
    sentences,
    paragraphs,
    lines,
    chineseChars,
    spaces,
    readingTime
  }
  
  // Word frequency
  const wordsArray = textValue.toLowerCase().match(/\b\w+\b/g) || []
  const frequency: { [key: string]: number } = {}
  
  wordsArray.forEach(word => {
    if (word.length > 1) { // Skip single character words
      frequency[word] = (frequency[word] || 0) + 1
    }
  })
  
  wordFrequency.value = Object.entries(frequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
}

const clearText = () => {
  text.value = ''
  stats.value = null
  wordFrequency.value = []
}

const pasteText = async () => {
  try {
    const clipboardText = await navigator.clipboard.readText()
    text.value = clipboardText
    analyzeText()
    ElMessage.success('已粘贴')
  } catch (e) {
    ElMessage.error('无法读取剪贴板')
  }
}

const toUpperCase = () => {
  text.value = text.value.toUpperCase()
}

const toLowerCase = () => {
  text.value = text.value.toLowerCase()
}

const toTitleCase = () => {
  text.value = text.value.replace(/\b\w/g, char => char.toUpperCase())
}

const toSentenceCase = () => {
  text.value = text.value.toLowerCase().replace(/(^\s*|[.!?。！?\s]+)(\w)/g, (match, separator, char) => {
    return separator + char.toUpperCase()
  })
}

const removeExtraSpaces = () => {
  text.value = text.value.replace(/\s+/g, ' ').trim()
}

const reverseText = () => {
  text.value = text.value.split('').reverse().join('')
}

const removeDuplicateLines = () => {
  const lines = text.value.split('\n')
  const uniqueLines = [...new Set(lines)]
  text.value = uniqueLines.join('\n')
  ElMessage.success(`已去除 ${lines.length - uniqueLines.length} 行重复`)
}

const sortLines = () => {
  const lines = text.value.split('\n')
  lines.sort((a, b) => a.localeCompare(b, 'zh-CN'))
  text.value = lines.join('\n')
  ElMessage.success('已排序')
}
</script>
