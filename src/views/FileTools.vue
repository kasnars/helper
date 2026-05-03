<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📁 文件工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          图片、PDF、画板和文字提取工具
        </p>
      </div>

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large">
          <el-radio-button label="image">
            <el-icon><Picture /></el-icon>
            <span class="hidden sm:inline">图片处理</span>
            <span class="sm:hidden">图片</span>
          </el-radio-button>
          <el-radio-button label="pdf">
            <el-icon><DocumentChecked /></el-icon>
            <span class="hidden sm:inline">PDF 工具</span>
            <span class="sm:hidden">PDF</span>
          </el-radio-button>
          <el-radio-button label="whiteboard">
            <el-icon><EditPen /></el-icon>
            <span class="hidden sm:inline">在线画板</span>
            <span class="sm:hidden">画板</span>
          </el-radio-button>
          <el-radio-button label="text">
            <el-icon><Document /></el-icon>
            <span class="hidden sm:inline">文字提取</span>
            <span class="sm:hidden">文字</span>
          </el-radio-button>
          <el-radio-button label="watermark">
            <el-icon><Picture /></el-icon>
            <span class="hidden sm:inline">图片水印</span>
            <span class="sm:hidden">水印</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <!-- Image Processor -->
        <ImageProcessor v-if="activeTool === 'image'" />

        <!-- PDF Tool -->
        <PdfTool v-if="activeTool === 'pdf'" />

        <!-- Whiteboard -->
        <Whiteboard v-if="activeTool === 'whiteboard'" />

        <!-- Text Extractor -->
        <TextExtractor v-if="activeTool === 'text'" />

        <!-- Image Watermark -->
        <ImageWatermark v-if="activeTool === 'watermark'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Picture, DocumentChecked, EditPen, Document } from '@element-plus/icons-vue'
import ImageProcessor from '../views/ImageProcessor.vue'
import PdfTool from '../components/dev/PdfTool.vue'
import Whiteboard from '../components/dev/Whiteboard.vue'
import TextExtractor from '../components/dev/TextExtractor.vue'
import ImageWatermark from '../components/dev/ImageWatermark.vue'

const activeTool = ref<'image' | 'pdf' | 'whiteboard' | 'text' | 'watermark'>('image')

// 从 sessionStorage 恢复 tab 状态
onMounted(() => {
  const savedTool = sessionStorage.getItem('activeTool')
  if (savedTool && ['image', 'pdf', 'whiteboard', 'text', 'watermark'].includes(savedTool)) {
    activeTool.value = savedTool as any
    sessionStorage.removeItem('activeTool')
  }
})
</script>
