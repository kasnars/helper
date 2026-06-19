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
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="p-6 rounded-xl border-2 transition-all text-left"
          :class="activeTab === tab.key
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
          "
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="tab.bgClass">
              <el-icon :size="24" :class="tab.iconClass">
                <component :is="tab.icon" />
              </el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ tab.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ tab.desc }}</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ImageConverter v-if="activeTab === 'convert'" />
        <ImageCompressor v-if="activeTab === 'compress'" />
        <ImageStitch v-if="activeTab === 'stitch'" />
        <ImageRotate v-if="activeTab === 'rotate'" />
        <ImageGrayscale v-if="activeTab === 'grayscale'" />
        <ImageBase64 v-if="activeTab === 'base64'" />
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
import { ref, markRaw } from 'vue'
import { Switch, Crop, Lock, Lightning, Collection, Picture, RefreshRight, Brush, Document } from '@element-plus/icons-vue'
import ImageConverter from '../components/image/ImageConverter.vue'
import ImageCompressor from '../components/image/ImageCompressor.vue'
import ImageStitch from '../components/image/ImageStitch.vue'
import ImageRotate from '../components/image/ImageRotate.vue'
import ImageGrayscale from '../components/image/ImageGrayscale.vue'
import ImageBase64 from '../components/image/ImageBase64.vue'

const activeTab = ref('convert')

const tabs = [
  { key: 'convert', title: '格式转换', desc: 'PNG ↔ JPEG ↔ WebP ↔ BMP 互转', icon: markRaw(Switch), bgClass: 'bg-purple-100 dark:bg-purple-900/30', iconClass: 'text-purple-600 dark:text-purple-400' },
  { key: 'compress', title: '图片压缩', desc: '调整质量与尺寸，优化文件大小', icon: markRaw(Crop), bgClass: 'bg-green-100 dark:bg-green-900/30', iconClass: 'text-green-600 dark:text-green-400' },
  { key: 'stitch', title: '图片拼接', desc: '多张图片拼接成长图或横图', icon: markRaw(Picture), bgClass: 'bg-blue-100 dark:bg-blue-900/30', iconClass: 'text-blue-600 dark:text-blue-400' },
  { key: 'rotate', title: '旋转翻转', desc: '任意角度旋转、水平垂直翻转', icon: markRaw(RefreshRight), bgClass: 'bg-orange-100 dark:bg-orange-900/30', iconClass: 'text-orange-600 dark:text-orange-400' },
  { key: 'grayscale', title: '去色处理', desc: '灰度、复古、反色、黑白效果', icon: markRaw(Brush), bgClass: 'bg-gray-100 dark:bg-gray-700/30', iconClass: 'text-gray-600 dark:text-gray-400' },
  { key: 'base64', title: 'Base64 互转', desc: '图片与 Base64 字符串相互转换', icon: markRaw(Document), bgClass: 'bg-pink-100 dark:bg-pink-900/30', iconClass: 'text-pink-600 dark:text-pink-400' },
]
</script>
