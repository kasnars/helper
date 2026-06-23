<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📝 文本工具箱
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          文本处理与分析工具集合
        </p>
      </div>

      <!-- Category Filter -->
      <div class="flex flex-wrap gap-2 justify-center mb-6">
        <el-button
          v-for="cat in categories"
          :key="cat.value"
          :type="activeCategory === cat.value ? 'primary' : ''"
          :plain="activeCategory !== cat.value"
          @click="handleCategoryChange(cat.value)"
        >
          {{ cat.icon }} {{ cat.label }}
        </el-button>
      </div>

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large">
          <el-radio-button
            v-for="tool in filteredTools"
            :key="tool.value"
            :label="tool.value"
          >
            <el-icon><component :is="tool.icon" /></el-icon>
            <span class="hidden sm:inline">{{ tool.label }}</span>
            <span class="sm:hidden">{{ tool.shortLabel }}</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <component :is="toolComponents[activeTool]" v-if="toolComponents[activeTool]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { Search, Reading, Delete, Memo, Document, View, Grid, Key } from '@element-plus/icons-vue'

// Components
import RegexTester from '../components/dev/RegexTester.vue'
import RegexVisualizer from '../components/text/RegexVisualizer.vue'
import TextStatTool from '../components/dev/TextStatTool.vue'
import TextDedup from '../components/dev/TextDedup.vue'
import MarkdownPreview from '../components/dev/MarkdownPreview.vue'
import TextExtractor from '../components/dev/TextExtractor.vue'
import FileDiff from '../components/file/FileDiff.vue'
import SqlCreateTable from '../components/text/SqlCreateTable.vue'
import HtmlEntityTool from '../components/text/HtmlEntityTool.vue'
import CharFrequency from '../components/text/CharFrequency.vue'
import Rot13Cipher from '../components/text/Rot13Cipher.vue'

type ToolCategory = 'all' | 'text' | 'file' | 'dev'

interface ToolItem {
  value: string
  label: string
  shortLabel: string
  icon: any
  category: ToolCategory
}

const categories = [
  { label: '全部', value: 'all' as ToolCategory, icon: '📋' },
  { label: '文本处理', value: 'text' as ToolCategory, icon: '📝' },
  { label: '开发辅助', value: 'dev' as ToolCategory, icon: '💻' },
  { label: '文件分析', value: 'file' as ToolCategory, icon: '📄' },
]

const tools: ToolItem[] = [
  // 文本处理
  { value: 'regex', label: '正则测试', shortLabel: '正则', icon: markRaw(Search), category: 'text' },
  { value: 'regexviz', label: '正则可视化', shortLabel: '可视化', icon: markRaw(View), category: 'text' },
  { value: 'textstat', label: '文本统计', shortLabel: '统计', icon: markRaw(Reading), category: 'text' },
  { value: 'textdedup', label: '文本去重', shortLabel: '去重', icon: markRaw(Delete), category: 'text' },
  { value: 'markdown', label: 'Markdown', shortLabel: 'MD', icon: markRaw(Memo), category: 'text' },
  { value: 'htmlentity', label: 'HTML实体', shortLabel: '实体', icon: markRaw(Document), category: 'text' },
  { value: 'charfreq', label: '字符频次', shortLabel: '频次', icon: markRaw(Reading), category: 'text' },
  { value: 'rot13', label: 'ROT13/凯撒', shortLabel: 'ROT13', icon: markRaw(Key), category: 'text' },

  // 开发辅助
  { value: 'sqlcreate', label: 'SQL建表', shortLabel: 'SQL', icon: markRaw(Grid), category: 'dev' },

  // 文件分析
  { value: 'textextractor', label: '文本提取', shortLabel: '提取', icon: markRaw(Document), category: 'file' },
  { value: 'filediff', label: '文件对比', shortLabel: '对比', icon: markRaw(Delete), category: 'file' },
]

const toolComponents: Record<string, any> = {
  regex: markRaw(RegexTester),
  regexviz: markRaw(RegexVisualizer),
  textstat: markRaw(TextStatTool),
  textdedup: markRaw(TextDedup),
  markdown: markRaw(MarkdownPreview),
  htmlentity: markRaw(HtmlEntityTool),
  charfreq: markRaw(CharFrequency),
  sqlcreate: markRaw(SqlCreateTable),
  textextractor: markRaw(TextExtractor),
  filediff: markRaw(FileDiff),
  rot13: markRaw(Rot13Cipher),
}

const activeCategory = ref<ToolCategory>('all')
const activeTool = ref('regex')

const filteredTools = computed(() => {
  if (activeCategory.value === 'all') return tools
  return tools.filter(t => t.category === activeCategory.value)
})

const handleCategoryChange = (cat: ToolCategory) => {
  activeCategory.value = cat
  const filtered = cat === 'all' ? tools : tools.filter(t => t.category === cat)
  if (!filtered.find(t => t.value === activeTool.value)) {
    activeTool.value = filtered[0]?.value || 'regex'
  }
}

onMounted(() => {
  const savedTool = sessionStorage.getItem('activeTextTool')
  if (savedTool && tools.some(t => t.value === savedTool)) {
    activeTool.value = savedTool
    const tool = tools.find(t => t.value === savedTool)
    if (tool) {
      activeCategory.value = tool.category
    }
    sessionStorage.removeItem('activeTextTool')
  }
})
</script>
