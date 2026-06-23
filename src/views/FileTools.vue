<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📁 文件工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          图片、PDF、画板和文字提取工具已拆分到专属分类
        </p>
      </div>

      <!-- Notice -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
        <el-icon :size="48" class="text-blue-500 mb-4"><InfoFilled /></el-icon>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">工具已迁移</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          原文件工具中的功能已拆分到以下分类：
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link to="/imagetools" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors">
            <el-icon><Picture /></el-icon>
            <span>图片工具</span>
          </router-link>
          <router-link to="/texttools" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors">
            <el-icon><Document /></el-icon>
            <span>文本工具</span>
          </router-link>
          <router-link to="/utility" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors">
            <el-icon><Suitcase /></el-icon>
            <span>实用工具</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Picture, Document, Suitcase, InfoFilled } from '@element-plus/icons-vue'
</script>
