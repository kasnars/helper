<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ pageTitle }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          常用开发工具集合，纯前端实现
        </p>
      </div>

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large" class="tool-switcher">
          <el-radio-button
            v-for="tool in visibleTools"
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
import { ref, computed, onMounted, watch, markRaw, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import {
  Document, Share, Timer, Brush, Key, Sort, Postcard, Link,
  Box, Grid, Monitor, Edit, SetUp, Memo
} from '@element-plus/icons-vue'

// Components
const JsonEditor = defineAsyncComponent(() => import('../components/dev/JsonEditor.vue'))
const Base64Tool = defineAsyncComponent(() => import('../components/dev/Base64Tool.vue'))
const TimestampTool = defineAsyncComponent(() => import('../components/dev/TimestampTool.vue'))
const ColorTool = defineAsyncComponent(() => import('../components/dev/ColorTool.vue'))
const HashTool = defineAsyncComponent(() => import('../components/dev/HashTool.vue'))
const RadixTool = defineAsyncComponent(() => import('../components/dev/RadixTool.vue'))
const UUIDTool = defineAsyncComponent(() => import('../components/dev/UUIDTool.vue'))
const JWTDecoder = defineAsyncComponent(() => import('../components/dev/JWTDecoder.vue'))
const URLEncoder = defineAsyncComponent(() => import('../components/dev/URLEncoder.vue'))
const GradientGenerator = defineAsyncComponent(() => import('../components/dev/GradientGenerator.vue'))
const BoxShadowGenerator = defineAsyncComponent(() => import('../components/dev/BoxShadowGenerator.vue'))
const CodeFormatter = defineAsyncComponent(() => import('../components/dev/CodeFormatter.vue'))
const HttpStatusCode = defineAsyncComponent(() => import('../components/dev/HttpStatusCode.vue'))
const FlexboxPlayground = defineAsyncComponent(() => import('../components/dev/FlexboxPlayground.vue'))
const YamlJsonConverter = defineAsyncComponent(() => import('../components/dev/YamlJsonConverter.vue'))
const SqlFormatter = defineAsyncComponent(() => import('../components/dev/SqlFormatter.vue'))
const ChmodCalculator = defineAsyncComponent(() => import('../components/dev/ChmodCalculator.vue'))
const LinuxCommands = defineAsyncComponent(() => import('../components/dev/LinuxCommands.vue'))
const UserAgentParser = defineAsyncComponent(() => import('../components/dev/UserAgentParser.vue'))
const IpCalculator = defineAsyncComponent(() => import('../components/dev/IpCalculator.vue'))
const PaletteGenerator = defineAsyncComponent(() => import('../components/dev/PaletteGenerator.vue'))
const SvgOptimizer = defineAsyncComponent(() => import('../components/dev/SvgOptimizer.vue'))
const SqlCreateTable = defineAsyncComponent(() => import('../components/text/SqlCreateTable.vue'))
const JwtGenerator = defineAsyncComponent(() => import('../components/dev/JwtGenerator.vue'))
const HmacTool = defineAsyncComponent(() => import('../components/dev/HmacTool.vue'))
const CssAnimationGenerator = defineAsyncComponent(() => import('../components/dev/CssAnimationGenerator.vue'))
const CssFilterGenerator = defineAsyncComponent(() => import('../components/dev/CssFilterGenerator.vue'))

type ToolCategory = 'all' | 'encode' | 'format' | 'css' | 'system'

interface ToolItem {
  value: string
  label: string
  shortLabel: string
  icon: any
  category: ToolCategory
}

const tools: ToolItem[] = [
  // 编码/加密
  { value: 'base64', label: 'Base64', shortLabel: 'Base64', icon: markRaw(Share), category: 'encode' },
  { value: 'url', label: 'URL 编解码', shortLabel: 'URL', icon: markRaw(Link), category: 'encode' },
  { value: 'jwt', label: 'JWT 解码', shortLabel: 'JWT', icon: markRaw(Key), category: 'encode' },
  { value: 'hash', label: '哈希', shortLabel: '哈希', icon: markRaw(Key), category: 'encode' },
  { value: 'jwtgenerate', label: 'JWT生成', shortLabel: 'JWT', icon: markRaw(Key), category: 'encode' },
  { value: 'hmac', label: 'HMAC签名', shortLabel: 'HMAC', icon: markRaw(Key), category: 'encode' },

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
  { value: 'cssanimation', label: 'CSS动画', shortLabel: '动画', icon: markRaw(Brush), category: 'css' },
  { value: 'cssfilter', label: 'CSS Filter', shortLabel: 'Filter', icon: markRaw(Brush), category: 'css' },

  // 数据格式 (continued)
  { value: 'svgoptimize', label: 'SVG 优化', shortLabel: 'SVG', icon: markRaw(Document), category: 'format' },
  { value: 'sqlcreate', label: 'SQL建表', shortLabel: 'SQL', icon: markRaw(Document), category: 'format' },

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
  sqlcreate: markRaw(SqlCreateTable),
  jwtgenerate: markRaw(JwtGenerator),
  hmac: markRaw(HmacTool),
  cssanimation: markRaw(CssAnimationGenerator),
  cssfilter: markRaw(CssFilterGenerator),
}

const activeTool = ref('json')
const route = useRoute()
const currentGroup = computed(() => route.meta.toolGroup as ToolCategory | undefined)
const visibleTools = computed(() => currentGroup.value ? tools.filter(tool => tool.category === currentGroup.value) : tools)
const pageTitle = computed(() => route.meta.title === '开发工具' ? '🛠️ 开发工具箱' : `${route.meta.title || '开发工具'}`)

const selectSavedTool = () => {
  const savedTool = sessionStorage.getItem('activeDevTool')
  if (savedTool && visibleTools.value.some(t => t.value === savedTool)) {
    activeTool.value = savedTool
    sessionStorage.removeItem('activeDevTool')
    return
  }
  if (!visibleTools.value.some(t => t.value === activeTool.value)) {
    activeTool.value = visibleTools.value[0]?.value || 'json'
  }
}

// 从 sessionStorage 恢复 tab 状态
onMounted(() => {
  selectSavedTool()
})

watch(() => route.path, selectSavedTool)
</script>
