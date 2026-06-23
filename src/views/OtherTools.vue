<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔧 其他工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          二维码、白板、SVG编辑、PDF处理等实用工具集合
        </p>
      </div>

      <!-- Tools Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="tool in tools"
          :key="tool.path"
          :to="tool.path"
          class="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
        >
          <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-2xl" :class="tool.bgClass">
            {{ tool.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ tool.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ tool.description }}</p>
          </div>
          <el-icon class="text-gray-400 group-hover:text-blue-500 transition-colors"><ArrowRight /></el-icon>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'

const tools = [
  {
    title: '二维码工具',
    description: '生成和解析二维码',
    icon: '📱',
    path: '/qrcode',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    title: '白板',
    description: '自由绘制和涂鸦',
    icon: '🎨',
    path: '/whiteboard',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    title: 'SVG编辑器',
    description: '在线编辑SVG矢量图形',
    icon: '✏️',
    path: '/svg-editor',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    title: 'PDF工具',
    description: 'PDF查看、转换和编辑',
    icon: '📄',
    path: '/pdf-tool',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    title: '响应式断点测试',
    description: '测试不同屏幕尺寸下的布局',
    icon: '📐',
    path: '/responsive-tester',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  {
    title: '九宫格切图',
    description: '将图片切割为九宫格样式',
    icon: '🖼️',
    path: '/image-grid-splitter',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
  },
]
</script>
