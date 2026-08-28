<template>
  <div class="min-h-screen pb-12">
    <section class="px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl text-center">
        <p class="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Helper Workspace</p>
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-6xl"><span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Helper</span> 工具集</h1>
        <p class="mb-8 text-lg text-gray-600 dark:text-gray-400">一个简单、快速、隐私优先的在线工具箱</p>
        <el-input v-model="searchText" size="large" clearable class="home-search" placeholder="搜索工具分类，例如：JSON、图片、密码"><template #prefix><el-icon><Search /></el-icon></template></el-input>
      </div>
    </section>

    <main class="space-y-12 px-4 sm:px-6 lg:px-8">
      <section class="mx-auto max-w-6xl">
        <div class="mb-5"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">常用工具</h2><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">快速进入高频功能</p></div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <button v-for="tool in quickTools" :key="tool.tab" class="rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800" @click="openTool(tool)"><el-icon :size="22" class="mb-2 text-blue-600 dark:text-blue-400"><component :is="tool.icon" /></el-icon><div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ tool.name }}</div></button>
        </div>
      </section>

      <section class="mx-auto max-w-6xl">
        <div class="mb-5"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">全部工具</h2><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">按场景选择你需要的工具集合</p></div>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"><ToolCard v-for="tool in filteredCategories" :key="tool.to" v-bind="tool" /></div>
        <el-empty v-if="filteredCategories.length === 0" description="没有找到匹配的分类" />
      </section>

      <section class="mx-auto max-w-6xl rounded-2xl bg-gray-50/70 px-5 py-8 dark:bg-gray-800/40">
        <h2 class="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">平台特点</h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3"><div v-for="feature in features" :key="feature.title" class="text-center"><div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><el-icon :size="24"><component :is="feature.icon" /></el-icon></div><h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{{ feature.title }}</h3><p class="text-sm text-gray-500 dark:text-gray-400">{{ feature.description }}</p></div></div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Star, Picture, Document, Suitcase, Tools, Grid, Lock, Brush, Monitor, Cellphone, Files } from '@element-plus/icons-vue'
import ToolCard from '../components/common/ToolCard.vue'

const router = useRouter()
const searchText = ref('')
const categories = [
  { to: '/life', title: '生活工具', description: '今天吃什么、随机数、BMI和日期计算等日常工具。', icon: Star, color: 'orange' as const },
  { to: '/imagetools', title: '图片工具', description: '图片压缩、格式转换、裁剪、拼接和批量处理。', icon: Picture, color: 'pink' as const },
  { to: '/texttools', title: '文本工具', description: '正则、Markdown、文本统计、去重和文件对比。', icon: Document, color: 'purple' as const },
  { to: '/utility', title: '实用工具', description: 'Mock数据、JSON转Excel、TTS和密码强度检测。', icon: Suitcase, color: 'blue' as const },
  { to: '/devtools', title: '开发工具', description: 'JSON、YAML、SQL格式化、SQL建表和代码格式化。', icon: Tools, color: 'green' as const },
  { to: '/securitytools', title: '编码与安全', description: 'Base64、URL、JWT、哈希和UUID等工具。', icon: Lock, color: 'red' as const },
  { to: '/webtools', title: 'Web 与 CSS', description: '颜色、渐变、阴影、Flexbox和HTTP状态码。', icon: Brush, color: 'pink' as const },
  { to: '/systemtools', title: '系统与网络', description: '时间戳、进制转换、Linux命令、UA和IP计算器。', icon: Monitor, color: 'orange' as const },
  { to: '/other', title: '其他工具', description: '二维码、PDF、在线画板、流程图等更多工具。', icon: Grid, color: 'red' as const },
]
const quickTools = [
  { name: 'JSON工具', path: '/devtools', tab: 'json', icon: Document }, { name: '图片压缩', path: '/imagetools', tab: 'processor', icon: Picture }, { name: 'Mock数据', path: '/utility', tab: 'mock', icon: Suitcase }, { name: 'SQL建表', path: '/devtools', tab: 'sqlcreate', icon: Tools }, { name: 'Base64', path: '/securitytools', tab: 'base64', icon: Lock }, { name: '二维码', path: '/other', tab: 'qrcode', icon: Grid },
]
const features = [{ title: '本地处理', description: '数据在浏览器本地处理，不上传服务器。', icon: Lock }, { title: '响应式设计', description: '适配移动端、平板和桌面设备。', icon: Cellphone }, { title: '便捷访问', description: '支持搜索、分类入口和快速工具。', icon: Files }]
const filteredCategories = computed(() => { const keyword = searchText.value.trim().toLowerCase(); return keyword ? categories.filter(tool => `${tool.title}${tool.description}`.toLowerCase().includes(keyword)) : categories })
const openTool = (tool: typeof quickTools[number]) => { const key = tool.path === '/devtools' || tool.path.endsWith('tools') ? 'activeDevTool' : tool.path === '/utility' ? 'activeUtilityTool' : tool.path === '/imagetools' ? 'activeImageTool' : 'activeOtherTool'; sessionStorage.setItem(key, tool.tab); router.push(tool.path) }
</script>
