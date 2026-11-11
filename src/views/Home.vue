<template>
  <div class="min-h-screen pb-12">
    <section class="px-4 pb-8 pt-24 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl text-center">
        <p class="mb-3 text-sm font-medium tracking-[0.2em] text-blue-600 dark:text-blue-400">HELPER</p>
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-6xl">Helper 工具集</h1>
        <p class="mb-6 text-lg text-gray-600 dark:text-gray-400">日常和开发要用的小工具，算完就留在浏览器里。</p>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          @click="openPalette"
        >
          <el-icon><Search /></el-icon>
          搜索全部工具
          <kbd class="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-900">Ctrl K</kbd>
        </button>
      </div>
    </section>

    <main class="space-y-12 px-4 sm:px-6 lg:px-8">
      <section v-if="favoriteTools.length" class="mx-auto max-w-6xl">
        <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">收藏</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <button v-for="entry in favoriteTools" :key="entry.id" class="rounded-xl border border-amber-200 bg-white p-4 text-left dark:border-amber-900/50 dark:bg-gray-800" @click="openTool(entry.id)">
            <div class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ entry.name }}</div>
            <div class="mt-1 text-xs text-gray-500">{{ category(entry) }}</div>
          </button>
        </div>
      </section>

      <section v-if="recentTools.length" class="mx-auto max-w-6xl">
        <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">最近使用</h2>
        <div class="flex flex-wrap gap-2">
          <button v-for="entry in recentTools" :key="entry.id" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" @click="openTool(entry.id)">
            {{ entry.name }}
          </button>
        </div>
      </section>

      <section class="mx-auto max-w-6xl">
        <div class="mb-5">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">全部工具</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">按场景进入，里面再用标签切换具体工具</p>
        </div>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard v-for="item in categories" :key="item.to" v-bind="item" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import ToolCard from '../components/common/ToolCard.vue'
import { useUsageStore } from '../stores/usage'
import { openTool } from '../tools/navigate'
import { findTool, toolCategoryLabel } from '../tools/registry'

const usage = useUsageStore()
onMounted(() => usage.load())

const favoriteTools = computed(() => usage.favorites.map((id) => findTool(id)).filter((item) => item !== undefined))
const recentTools = computed(() => usage.recent.map((id) => findTool(id)).filter((item) => item !== undefined).slice(0, 8))
const category = (entry: NonNullable<ReturnType<typeof findTool>>) => toolCategoryLabel(entry)
const openPalette = () => window.dispatchEvent(new Event('helper:open-palette'))

const categories = [
  { to: '/life', title: '生活工具', description: '番茄钟、记账、个税、房贷、倒计时和今天吃什么。', icon: 'Star', color: 'orange' as const },
  { to: '/imagetools', title: '图片工具', description: '裁剪、水印、EXIF、长图拼接、OCR 和视频转 GIF。', icon: 'Picture', color: 'pink' as const },
  { to: '/texttools', title: '文本工具', description: 'Markdown、文本对比、正则和格式整理。', icon: 'Document', color: 'purple' as const },
  { to: '/utility', title: '实用工具', description: '单位、汇率、Mock 数据、AI 费用和本地备份。', icon: 'Suitcase', color: 'blue' as const },
  { to: '/devtools', title: '开发工具', description: 'JSON、SQL、代码格式化和 curl 转代码。', icon: 'Tools', color: 'green' as const },
  { to: '/securitytools', title: '编码与安全', description: 'Base64、URL、JWT 解码与签名校验、哈希。', icon: 'Lock', color: 'red' as const },
  { to: '/webtools', title: 'Web 与 CSS', description: '颜色、色阶、阴影、渐变、圆角和贝塞尔曲线。', icon: 'Brush', color: 'pink' as const },
  { to: '/systemtools', title: '系统与网络', description: '时间戳、进制、Linux 命令和 IP 计算。', icon: 'Monitor', color: 'orange' as const },
  { to: '/other', title: '其他工具', description: '二维码、画板、PDF、流程图和压缩包。', icon: 'Grid', color: 'red' as const },
]
</script>
