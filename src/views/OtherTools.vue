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

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large">
          <el-radio-button label="qrcode">
            <el-icon><FullScreen /></el-icon>
            <span class="hidden sm:inline">二维码工具</span>
            <span class="sm:hidden">二维码</span>
          </el-radio-button>
          <el-radio-button label="whiteboard">
            <el-icon><EditPen /></el-icon>
            <span class="hidden sm:inline">在线画板</span>
            <span class="sm:hidden">画板</span>
          </el-radio-button>
          <el-radio-button label="svg">
            <el-icon><Edit /></el-icon>
            <span class="hidden sm:inline">SVG 编辑器</span>
            <span class="sm:hidden">SVG</span>
          </el-radio-button>
          <el-radio-button label="pdf">
            <el-icon><Document /></el-icon>
            <span class="hidden sm:inline">PDF 工具</span>
            <span class="sm:hidden">PDF</span>
          </el-radio-button>
          <el-radio-button label="responsive">
            <el-icon><View /></el-icon>
            <span class="hidden sm:inline">响应式测试</span>
            <span class="sm:hidden">响应式</span>
          </el-radio-button>
          <el-radio-button label="gridsplitter">
            <el-icon><Grid /></el-icon>
            <span class="hidden sm:inline">九宫格切图</span>
            <span class="sm:hidden">切图</span>
          </el-radio-button>
          <el-radio-button label="emoji">
            <el-icon><Star /></el-icon>
            <span class="hidden sm:inline">Emoji 搜索</span>
            <span class="sm:hidden">Emoji</span>
          </el-radio-button>
          <el-radio-button label="flowchart">
            <el-icon><Share /></el-icon>
            <span class="hidden sm:inline">流程图画图</span>
            <span class="sm:hidden">流程图</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <QrCodeTool v-if="activeTool === 'qrcode'" />
        <Whiteboard v-if="activeTool === 'whiteboard'" />
        <SvgEditor v-if="activeTool === 'svg'" />
        <PdfTool v-if="activeTool === 'pdf'" />
        <ResponsiveTester v-if="activeTool === 'responsive'" />
        <ImageGridSplitter v-if="activeTool === 'gridsplitter'" />
        <EmojiSearch v-if="activeTool === 'emoji'" />
        <FlowchartEditor v-if="activeTool === 'flowchart'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FullScreen, EditPen, Edit, Document, View, Grid, Star, Share } from '@element-plus/icons-vue'
import QrCodeTool from '../components/dev/QrCodeTool.vue'
import Whiteboard from '../components/dev/Whiteboard.vue'
import SvgEditor from '../components/file/SvgEditor.vue'
import PdfTool from '../components/dev/PdfTool.vue'
import ResponsiveTester from '../components/dev/ResponsiveTester.vue'
import ImageGridSplitter from '../components/image/ImageGridSplitter.vue'
import EmojiSearch from '../components/other/EmojiSearch.vue'
import FlowchartEditor from '../components/other/FlowchartEditor.vue'

const activeTool = ref('qrcode')
const toolList = ['qrcode', 'whiteboard', 'svg', 'pdf', 'responsive', 'gridsplitter', 'emoji', 'flowchart']

onMounted(() => {
  const savedTool = sessionStorage.getItem('activeOtherTool')
  if (savedTool && toolList.includes(savedTool)) {
    activeTool.value = savedTool
    sessionStorage.removeItem('activeOtherTool')
  }
})
</script>
