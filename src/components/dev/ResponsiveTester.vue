<template>
  <div class="space-y-6">
    <!-- URL 输入 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">🌐 响应式断点测试器</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">输入网址，预览不同屏幕尺寸下的显示效果</p>

      <div class="flex gap-3">
        <el-input
          v-model="url"
          placeholder="请输入网址，如 https://example.com"
          class="flex-1"
          @keyup.enter="loadUrl"
        >
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="loadUrl" :disabled="!url.trim()">
          加载
        </el-button>
      </div>
    </div>

    <!-- 断点按钮 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">📐 设备断点</h3>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500 dark:text-gray-400">当前宽度:</span>
          <span class="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{{ currentWidth }}px</span>
          <el-tag :type="deviceTagType" size="large">{{ deviceLabel }}</el-tag>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <el-button
          v-for="bp in breakpoints"
          :key="bp.name"
          :type="currentWidth === bp.width ? 'primary' : ''"
          :plain="currentWidth !== bp.width"
          @click="setBreakpoint(bp.width)"
        >
          {{ bp.icon }} {{ bp.label }} ({{ bp.width }}px)
        </el-button>
        <el-button @click="resetWidth">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">🖥️ 预览窗口</h3>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">拖拽右侧边缘调整宽度</span>
          <el-slider
            v-model="currentWidth"
            :min="280"
            :max="2560"
            :step="1"
            class="w-48"
            :show-tooltip="false"
          />
        </div>
      </div>

      <div
        class="relative mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900"
        :style="{ width: currentWidth + 'px', maxWidth: '100%' }"
      >
        <!-- 宽度标尺 -->
        <div class="h-8 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 border-b border-gray-300 dark:border-gray-600 select-none">
          <span class="font-mono font-bold">{{ currentWidth }} × {{ currentHeight }}</span>
          <span class="ml-2">|</span>
          <span class="ml-2">{{ deviceLabel }}</span>
        </div>

        <!-- iframe 容器 -->
        <div
          class="relative"
          style="height: 600px;"
          ref="containerRef"
        >
          <iframe
            v-if="iframeUrl"
            :src="iframeUrl"
            class="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            ref="iframeRef"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500"
          >
            <div class="text-center">
              <div class="text-6xl mb-4">🌐</div>
              <p class="text-lg">请输入网址并点击加载</p>
              <p class="text-sm mt-2">支持任何公开可访问的网页</p>
            </div>
          </div>
        </div>

        <!-- 拖拽调整手柄 -->
        <div
          class="absolute top-0 right-0 bottom-0 w-4 cursor-col-resize group flex items-center justify-center hover:bg-blue-500/10 transition-colors"
          @mousedown="startDrag"
        >
          <div class="w-1 h-12 bg-gray-400 dark:bg-gray-500 rounded-full group-hover:bg-blue-500 transition-colors" />
        </div>
      </div>
    </div>

    <!-- 快捷信息 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 常用断点参考</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          v-for="bp in breakpoints"
          :key="bp.name"
          class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          :class="{ 'ring-2 ring-blue-500': currentWidth === bp.width }"
          @click="setBreakpoint(bp.width)"
        >
          <div class="text-2xl mb-1">{{ bp.icon }}</div>
          <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ bp.label }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ bp.width }}px</div>
          <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ bp.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { Link, RefreshLeft } from '@element-plus/icons-vue'

interface Breakpoint {
  name: string
  label: string
  icon: string
  width: number
  desc: string
}

const breakpoints: Breakpoint[] = [
  { name: 'mobile', label: '手机', icon: '📱', width: 375, desc: 'iPhone SE' },
  { name: 'tablet', label: '平板', icon: '📱', width: 768, desc: 'iPad Mini' },
  { name: 'laptop', label: '笔记本', icon: '💻', width: 1024, desc: 'MacBook Air' },
  { name: 'desktop', label: '桌面', icon: '🖥️', width: 1440, desc: 'Desktop' },
]

const url = ref('')
const iframeUrl = ref('')
const currentWidth = ref(768)
const currentHeight = ref(600)
const containerRef = ref<HTMLElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)

// 拖拽状态
let isDragging = false
let startX = 0
let startWidth = 0

const deviceLabel = computed(() => {
  const w = currentWidth.value
  if (w < 480) return '手机'
  if (w < 768) return '大屏手机'
  if (w < 1024) return '平板'
  if (w < 1440) return '笔记本'
  if (w < 1920) return '桌面'
  return '大屏'
})

const deviceTagType = computed(() => {
  const w = currentWidth.value
  if (w < 480) return 'danger' as const
  if (w < 768) return 'warning' as const
  if (w < 1024) return '' as const
  if (w < 1440) return 'success' as const
  return 'primary' as const
})

const loadUrl = () => {
  let inputUrl = url.value.trim()
  if (!inputUrl) return
  if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
    inputUrl = 'https://' + inputUrl
    url.value = inputUrl
  }
  iframeUrl.value = inputUrl
}

const setBreakpoint = (width: number) => {
  currentWidth.value = width
}

const resetWidth = () => {
  currentWidth.value = 768
}

const startDrag = (e: MouseEvent) => {
  isDragging = true
  startX = e.clientX
  startWidth = currentWidth.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging) return
  const delta = e.clientX - startX
  const newWidth = Math.min(2560, Math.max(280, startWidth + delta))
  currentWidth.value = Math.round(newWidth)
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>
