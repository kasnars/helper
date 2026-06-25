<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🛠️ 开发工具箱
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          常用开发工具集合，纯前端实现
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
import {
  Document, Share, Timer, Brush, Key, Sort, Postcard, Link,
  Box, Grid, Monitor, Edit, SetUp, Memo
} from '@element-plus/icons-vue'

// Components
import JsonEditor from '../components/dev/JsonEditor.vue'
import Base64Tool from '../components/dev/Base64Tool.vue'
import TimestampTool from '../components/dev/TimestampTool.vue'
import ColorTool from '../components/dev/ColorTool.vue'
import HashTool from '../components/dev/HashTool.vue'
import RadixTool from '../components/dev/RadixTool.vue'
import UUIDTool from '../components/dev/UUIDTool.vue'
import JWTDecoder from '../components/dev/JWTDecoder.vue'
import URLEncoder from '../components/dev/URLEncoder.vue'
import GradientGenerator from '../components/dev/GradientGenerator.vue'
import BoxShadowGenerator from '../components/dev/BoxShadowGenerator.vue'
import CodeFormatter from '../components/dev/CodeFormatter.vue'
import HttpStatusCode from '../components/dev/HttpStatusCode.vue'
import FlexboxPlayground from '../components/dev/FlexboxPlayground.vue'
import YamlJsonConverter from '../components/dev/YamlJsonConverter.vue'
import SqlFormatter from '../components/dev/SqlFormatter.vue'
import ChmodCalculator from '../components/dev/ChmodCalculator.vue'
import LinuxCommands from '../components/dev/LinuxCommands.vue'
import UserAgentParser from '../components/dev/UserAgentParser.vue'
import IpCalculator from '../components/dev/IpCalculator.vue'
import PaletteGenerator from '../components/dev/PaletteGenerator.vue'
import SvgOptimizer from '../components/dev/SvgOptimizer.vue'

type ToolCategory = 'all' | 'encode' | 'format' | 'css' | 'system'

interface ToolItem {
  value: string
  label: string
  shortLabel: string
  icon: any
  category: ToolCategory
}

const categories = [
  { label: '全部', value: 'all' as ToolCategory, icon: '📋' },
  { label: '编码/加密', value: 'encode' as ToolCategory, icon: '🔐' },
  { label: '数据格式', value: 'format' as ToolCategory, icon: '📄' },
  { label: 'Web/CSS', value: 'css' as ToolCategory, icon: '🎨' },
  { label: '系统/运维', value: 'system' as ToolCategory, icon: '⚙️' },
]

const tools: ToolItem[] = [
  // 编码/加密
  { value: 'base64', label: 'Base64', shortLabel: 'Base64', icon: markRaw(Share), category: 'encode' },
  { value: 'url', label: 'URL 编解码', shortLabel: 'URL', icon: markRaw(Link), category: 'encode' },
  { value: 'jwt', label: 'JWT 解码', shortLabel: 'JWT', icon: markRaw(Key), category: 'encode' },
  { value: 'hash', label: '哈希', shortLabel: '哈希', icon: markRaw(Key), category: 'encode' },

  // 数据格式
  { value: 'json', label: 'JSON 工具', shortLabel: 'JSON', icon: markRaw(Document), category: 'format' },
  { value: 'yaml', label: 'YAML/JSON', shortLabel: 'YAML', icon: markRaw(Document), category: 'format' },
  { value: 'sql', label: 'SQL格式化', shortLabel: 'SQL', icon: markRaw(Document), category: 'format' },
  { value: 'formatter', label: '代码格式化', shortLabel: '格式化', icon: markRaw(Edit), category: 'format' },

  // Web/CSS
  { value: 'color', label: '颜色工具', shortLabel: '颜色', icon: markRaw(Brush), category: 'css' },
  { value: 'gradient', label: '渐变生成', shortLabel: '渐变', icon: markRaw(Brush), category: 'css' },
  { value: 'boxshadow', label: '阴影生成', shortLabel: '阴影', icon: markRaw(Box), category: 'css' },
  { value: 'flexbox', label: 'Flexbox', shortLabel: 'Flex', icon: markRaw(Grid), category: 'css' },
  { value: 'http', label: 'HTTP状态码', shortLabel: 'HTTP', icon: markRaw(Link), category: 'css' },

  // Web/CSS (continued)
  { value: 'palette', label: '调色板生成', shortLabel: '调色板', icon: markRaw(Brush), category: 'css' },

  // 数据格式 (continued)
  { value: 'svgoptimize', label: 'SVG 优化', shortLabel: 'SVG', icon: markRaw(Document), category: 'format' },

  // 系统/运维
  { value: 'timestamp', label: '时间戳', shortLabel: '时间戳', icon: markRaw(Timer), category: 'system' },
  { value: 'uuid', label: 'UUID', shortLabel: 'UUID', icon: markRaw(Postcard), category: 'system' },
  { value: 'radix', label: '进制转换', shortLabel: '进制', icon: markRaw(Sort), category: 'system' },
  { value: 'chmod', label: 'Chmod计算', shortLabel: 'Chmod', icon: markRaw(SetUp), category: 'system' },
  { value: 'linux', label: 'Linux命令', shortLabel: 'Linux', icon: markRaw(Monitor), category: 'system' },
  { value: 'useragent', label: 'UA解析', shortLabel: 'UA', icon: markRaw(Monitor), category: 'system' },
  { value: 'ipcalc', label: 'IP 计算器', shortLabel: 'IP', icon: markRaw(Monitor), category: 'system' },
]

const toolComponents: Record<string, any> = {
  json: markRaw(JsonEditor),
  base64: markRaw(Base64Tool),
  timestamp: markRaw(TimestampTool),
  color: markRaw(ColorTool),
  hash: markRaw(HashTool),
  radix: markRaw(RadixTool),
  uuid: markRaw(UUIDTool),
  jwt: markRaw(JWTDecoder),
  url: markRaw(URLEncoder),
  gradient: markRaw(GradientGenerator),
  boxshadow: markRaw(BoxShadowGenerator),
  formatter: markRaw(CodeFormatter),
  http: markRaw(HttpStatusCode),
  flexbox: markRaw(FlexboxPlayground),
  yaml: markRaw(YamlJsonConverter),
  sql: markRaw(SqlFormatter),
  chmod: markRaw(ChmodCalculator),
  linux: markRaw(LinuxCommands),
  useragent: markRaw(UserAgentParser),
  ipcalc: markRaw(IpCalculator),
  palette: markRaw(PaletteGenerator),
  svgoptimize: markRaw(SvgOptimizer),
}

const activeCategory = ref<ToolCategory>('all')
const activeTool = ref('json')

const filteredTools = computed(() => {
  if (activeCategory.value === 'all') return tools
  return tools.filter(t => t.category === activeCategory.value)
})

// 切换分类时，如果当前工具不在新分类中，自动选择第一个
const handleCategoryChange = (cat: ToolCategory) => {
  activeCategory.value = cat
  const filtered = cat === 'all' ? tools : tools.filter(t => t.category === cat)
  if (!filtered.find(t => t.value === activeTool.value)) {
    activeTool.value = filtered[0]?.value || 'json'
  }
}

// 从 sessionStorage 恢复 tab 状态
onMounted(() => {
  const savedTool = sessionStorage.getItem('activeDevTool')
  if (savedTool && tools.some(t => t.value === savedTool)) {
    activeTool.value = savedTool
    // 自动选中对应的分类
    const tool = tools.find(t => t.value === savedTool)
    if (tool) {
      activeCategory.value = tool.category
    }
    sessionStorage.removeItem('activeDevTool')
  }
})
</script>
