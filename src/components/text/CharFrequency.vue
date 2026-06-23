<template>
  <div class="space-y-6">
    <!-- 输入 -->
    <div>
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📝 输入文本</h3>
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="5"
        placeholder="在此输入或粘贴文本..."
        @input="analyze"
      />
    </div>

    <!-- 统计概览 -->
    <div v-if="inputText" class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalCount }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">总字符数</div>
      </div>
      <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ uniqueCount }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">唯一字符数</div>
      </div>
      <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ categoryStats.chinese }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">中文字符</div>
      </div>
      <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ categoryStats.english }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">英文字母</div>
      </div>
      <div class="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl text-center">
        <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{{ categoryStats.digit }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">数字</div>
      </div>
    </div>

    <!-- 分类统计 -->
    <div v-if="inputText">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📊 分类统计</h3>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div
          v-for="cat in categoryDisplay"
          :key="cat.key"
          class="p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md"
          :class="selectedCategory === cat.key
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'"
          @click="selectedCategory = selectedCategory === cat.key ? null : cat.key"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium">{{ cat.icon }} {{ cat.label }}</span>
            <span class="text-sm font-bold" :class="cat.textColor">{{ cat.count }}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="cat.barColor"
              :style="{ width: cat.percent + '%' }"
            />
          </div>
          <div class="text-xs text-gray-400 mt-1">{{ cat.percent.toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <!-- 频次排行 -->
    <div v-if="inputText && sortedChars.length > 0">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">🏆 频次排行</h3>
        <div class="flex gap-2">
          <el-button size="small" @click="sortOrder = 'desc'" :type="sortOrder === 'desc' ? 'primary' : ''">
            ↓ 降序
          </el-button>
          <el-button size="small" @click="sortOrder = 'asc'" :type="sortOrder === 'asc' ? 'primary' : ''">
            ↑ 升序
          </el-button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <el-table :data="filteredChars" stripe style="width: 100%" max-height="400">
          <el-table-column label="排名" width="70" align="center">
            <template #default="{ $index }">
              <span class="font-mono text-gray-500">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="字符" width="100" align="center">
            <template #default="{ row }">
              <span
                class="inline-block px-3 py-1 rounded-lg font-mono text-lg font-bold"
                :class="charBgClass(row.category)"
              >
                {{ row.char === ' ' ? '␣' : row.char }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Unicode" width="120">
            <template #default="{ row }">
              <span class="font-mono text-sm text-gray-500 dark:text-gray-400">
                U+{{ row.code.toString(16).toUpperCase().padStart(4, '0') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="分类" width="100">
            <template #default="{ row }">
              <span class="text-sm">{{ categoryIcon(row.category) }} {{ categoryName(row.category) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="次数" width="80" align="center">
            <template #default="{ row }">
              <span class="font-mono font-bold text-gray-800 dark:text-gray-200">{{ row.count }}</span>
            </template>
          </el-table-column>
          <el-table-column label="占比">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    class="h-3 rounded-full transition-all"
                    :class="charBarClass(row.category)"
                    :style="{ width: (row.count / totalCount * 100) + '%' }"
                  />
                </div>
                <span class="text-xs text-gray-500 w-12 text-right">
                  {{ (row.count / totalCount * 100).toFixed(1) }}%
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 导出 -->
    <div v-if="inputText && sortedChars.length > 0" class="flex gap-2 flex-wrap">
      <el-button type="primary" @click="exportCSV">
        📥 导出 CSV
      </el-button>
      <el-button type="success" @click="exportJSON">
        📥 导出 JSON
      </el-button>
      <el-button @click="exportText">
        📥 导出纯文本
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const selectedCategory = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('desc')

interface CharInfo {
  char: string
  count: number
  code: number
  category: 'chinese' | 'english' | 'digit' | 'punctuation' | 'space' | 'other'
}

const getCharCategory = (char: string): CharInfo['category'] => {
  const code = char.charCodeAt(0)
  if (/\s/.test(char)) return 'space'
  if (/[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\u{2ceb0}-\u{2ebef}\u{30000}-\u{3134f}]/u.test(char)) return 'chinese'
  if (/[a-zA-Z]/.test(char)) return 'english'
  if (/[0-9]/.test(char)) return 'digit'
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(char)) return 'punctuation'
  return 'other'
}

const freqMap = computed(() => {
  const map = new Map<string, { count: number; category: CharInfo['category'] }>()
  for (const char of inputText.value) {
    const entry = map.get(char)
    if (entry) {
      entry.count++
    } else {
      map.set(char, { count: 1, category: getCharCategory(char) })
    }
  }
  return map
})

const totalCount = computed(() => inputText.value.length)

const uniqueCount = computed(() => freqMap.value.size)

const categoryStats = computed(() => {
  const stats = { chinese: 0, english: 0, digit: 0, punctuation: 0, space: 0, other: 0 }
  for (const [char, info] of freqMap.value) {
    stats[info.category] += info.count
  }
  return stats
})

const categoryDisplay = computed(() => {
  const total = totalCount.value || 1
  const categories: { key: string; icon: string; label: string; count: number; percent: number; textColor: string; barColor: string }[] = [
    { key: 'chinese', icon: '🀄', label: '中文', count: categoryStats.value.chinese, percent: categoryStats.value.chinese / total * 100, textColor: 'text-red-600 dark:text-red-400', barColor: 'bg-red-500' },
    { key: 'english', icon: '🔤', label: '英文', count: categoryStats.value.english, percent: categoryStats.value.english / total * 100, textColor: 'text-yellow-600 dark:text-yellow-400', barColor: 'bg-yellow-500' },
    { key: 'digit', icon: '🔢', label: '数字', count: categoryStats.value.digit, percent: categoryStats.value.digit / total * 100, textColor: 'text-green-600 dark:text-green-400', barColor: 'bg-green-500' },
    { key: 'punctuation', icon: '❗', label: '标点', count: categoryStats.value.punctuation, percent: categoryStats.value.punctuation / total * 100, textColor: 'text-purple-600 dark:text-purple-400', barColor: 'bg-purple-500' },
    { key: 'space', icon: '⬜', label: '空格', count: categoryStats.value.space, percent: categoryStats.value.space / total * 100, textColor: 'text-gray-600 dark:text-gray-400', barColor: 'bg-gray-500' },
  ]
  return categories
})

const sortedChars = computed(() => {
  const items: CharInfo[] = []
  for (const [char, info] of freqMap.value) {
    items.push({
      char,
      count: info.count,
      code: char.charCodeAt(0),
      category: info.category,
    })
  }
  items.sort((a, b) => sortOrder.value === 'desc' ? b.count - a.count : a.count - b.count)
  return items
})

const filteredChars = computed(() => {
  if (!selectedCategory.value) return sortedChars.value
  return sortedChars.value.filter(c => c.category === selectedCategory.value)
})

const analyze = () => {
  // 触发响应式更新
}

const categoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    chinese: '🀄', english: '🔤', digit: '🔢', punctuation: '❗', space: '⬜', other: '❓',
  }
  return icons[category] || '❓'
}

const categoryName = (category: string) => {
  const names: Record<string, string> = {
    chinese: '中文', english: '英文', digit: '数字', punctuation: '标点', space: '空格', other: '其他',
  }
  return names[category] || '其他'
}

const charBgClass = (category: string) => {
  const classes: Record<string, string> = {
    chinese: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    english: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    digit: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    punctuation: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    space: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    other: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  }
  return classes[category] || ''
}

const charBarClass = (category: string) => {
  const classes: Record<string, string> = {
    chinese: 'bg-red-500', english: 'bg-yellow-500', digit: 'bg-green-500',
    punctuation: 'bg-purple-500', space: 'bg-gray-500', other: 'bg-blue-500',
  }
  return classes[category] || 'bg-blue-500'
}

const exportCSV = () => {
  const header = '字符,Unicode,分类,次数,占比'
  const rows = sortedChars.value.map(c =>
    `"${c.char}",U+${c.code.toString(16).toUpperCase().padStart(4, '0')},${categoryName(c.category)},${c.count},${(c.count / totalCount.value * 100).toFixed(2)}%`
  )
  const content = [header, ...rows].join('\n')
  downloadFile(content, 'char_frequency.csv', 'text/csv')
  ElMessage.success('CSV 导出成功')
}

const exportJSON = () => {
  const data = {
    totalCount: totalCount.value,
    uniqueCount: uniqueCount.value,
    categoryStats: categoryStats.value,
    characters: sortedChars.value.map(c => ({
      char: c.char,
      unicode: `U+${c.code.toString(16).toUpperCase().padStart(4, '0')}`,
      category: categoryName(c.category),
      count: c.count,
      percent: `${(c.count / totalCount.value * 100).toFixed(2)}%`,
    })),
  }
  const content = JSON.stringify(data, null, 2)
  downloadFile(content, 'char_frequency.json', 'application/json')
  ElMessage.success('JSON 导出成功')
}

const exportText = () => {
  const lines = [
    `=== 字符频次统计 ===`,
    `总字符数: ${totalCount.value}`,
    `唯一字符数: ${uniqueCount.value}`,
    '',
    `分类统计:`,
    `  中文: ${categoryStats.value.chinese}`,
    `  英文: ${categoryStats.value.english}`,
    `  数字: ${categoryStats.value.digit}`,
    `  标点: ${categoryStats.value.punctuation}`,
    `  空格: ${categoryStats.value.space}`,
    '',
    `=== 频次排行 ===`,
  ]
  sortedChars.value.forEach((c, i) => {
    const display = c.char === ' ' ? '空格' : c.char
    lines.push(`${i + 1}. "${display}" (${categoryName(c.category)}) - ${c.count} 次 (${(c.count / totalCount.value * 100).toFixed(1)}%)`)
  })
  const content = lines.join('\n')
  downloadFile(content, 'char_frequency.txt', 'text/plain')
  ElMessage.success('文本导出成功')
}

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>
