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

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large" class="tool-switcher">
          <el-radio-button
            v-for="tool in tools"
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
import { ref, onMounted, markRaw, defineAsyncComponent } from 'vue'
import { Search, Reading, Delete, Memo, Document, View, Grid, Key, Sort } from '@element-plus/icons-vue'

// Components
const RegexTester = defineAsyncComponent(() => import('../components/dev/RegexTester.vue'))
const RegexVisualizer = defineAsyncComponent(() => import('../components/text/RegexVisualizer.vue'))
const TextStatTool = defineAsyncComponent(() => import('../components/dev/TextStatTool.vue'))
const TextDedup = defineAsyncComponent(() => import('../components/dev/TextDedup.vue'))
const MarkdownPreview = defineAsyncComponent(() => import('../components/dev/MarkdownPreview.vue'))
const TextExtractor = defineAsyncComponent(() => import('../components/dev/TextExtractor.vue'))
const FileDiff = defineAsyncComponent(() => import('../components/file/FileDiff.vue'))
const HtmlEntityTool = defineAsyncComponent(() => import('../components/text/HtmlEntityTool.vue'))
const CharFrequency = defineAsyncComponent(() => import('../components/text/CharFrequency.vue'))
const Rot13Cipher = defineAsyncComponent(() => import('../components/text/Rot13Cipher.vue'))
const XmlFormatter = defineAsyncComponent(() => import('../components/text/XmlFormatter.vue'))
const TextSortFilter = defineAsyncComponent(() => import('../components/text/TextSortFilter.vue'))

type ToolCategory = 'all' | 'text' | 'file' | 'dev'

interface ToolItem {
  value: string
  label: string
  shortLabel: string
  icon: any
  category: ToolCategory
}

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
  { value: 'xml', label: 'XML格式化', shortLabel: 'XML', icon: markRaw(Document), category: 'text' },
  { value: 'textsort', label: '文本排序', shortLabel: '排序', icon: markRaw(Sort), category: 'text' },

  // 开发辅助

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
  textextractor: markRaw(TextExtractor),
  filediff: markRaw(FileDiff),
  rot13: markRaw(Rot13Cipher),
  xml: markRaw(XmlFormatter),
  textsort: markRaw(TextSortFilter),
}

const activeTool = ref('regex')

onMounted(() => {
  const savedTool = sessionStorage.getItem('activeTextTool')
  if (savedTool && tools.some(t => t.value === savedTool)) {
    activeTool.value = savedTool
    sessionStorage.removeItem('activeTextTool')
  }
})
</script>
