<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📝 文字提取工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          从 PDF 和图片中提取文字内容
        </p>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <TextExtractor />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TextExtractor from '../components/dev/TextExtractor.vue'
</script>
