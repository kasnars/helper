<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🖼️ 图片处理
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          图片格式转换与压缩，纯前端处理保护隐私
        </p>
      </div>

      <!-- Feature Cards -->
      <div class="grid md:grid-cols-2 gap-4 mb-8">
        <button
          @click="activeTab = 'convert'"
          class="p-6 rounded-xl border-2 transition-all text-left"
          :class="activeTab === 'convert'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
          "
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <el-icon :size="24" class="text-purple-600 dark:text-purple-400">
                <Switch />
              </el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">格式转换</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">PNG ↔ JPEG ↔ WebP ↔ BMP 互转</p>
            </div>
          </div>
        </button>

        <button
          @click="activeTab = 'compress'"
          class="p-6 rounded-xl border-2 transition-all text-left"
          :class="activeTab === 'compress'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
          "
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <el-icon :size="24" class="text-green-600 dark:text-green-400">
                <Crop />
              </el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">图片压缩</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">调整质量与尺寸，优化文件大小</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ImageConverter v-if="activeTab === 'convert'" />
        <ImageCompressor v-if="activeTab === 'compress'" />
      </div>

      <!-- Tips -->
      <div class="mt-8 grid md:grid-cols-3 gap-4">
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon class="text-blue-500"><Lock /></el-icon>
            <span class="font-medium text-gray-900 dark:text-white">隐私安全</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">所有图片处理都在本地浏览器完成，不会上传到任何服务器</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon class="text-green-500"><Lightning /></el-icon>
            <span class="font-medium text-gray-900 dark:text-white">快速处理</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">利用 Canvas API 进行硬件加速，处理速度快</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon class="text-purple-500"><Collection /></el-icon>
            <span class="font-medium text-gray-900 dark:text-white">批量操作</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">支持同时处理多张图片，提高工作效率</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Switch, Crop, Lock, Lightning, Collection } from '@element-plus/icons-vue'
import ImageConverter from '../components/image/ImageConverter.vue'
import ImageCompressor from '../components/image/ImageCompressor.vue'

const activeTab = ref<'convert' | 'compress'>('convert')
</script>
