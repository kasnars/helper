<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🛠️ 开发工具箱
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          常用开发工具集合，纯前端实现
        </p>
      </div>

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large">
          <el-radio-button label="regex">
            <el-icon><Search /></el-icon>
            正则测试
          </el-radio-button>
          <el-radio-button label="json">
            <el-icon><Document /></el-icon>
            JSON 工具
          </el-radio-button>
          <el-radio-button label="qrcode">
            <el-icon><FullScreen /></el-icon>
            二维码
          </el-radio-button>
          <el-radio-button label="whiteboard">
            <el-icon><EditPen /></el-icon>
            在线画板
          </el-radio-button>
          <el-radio-button label="pdf">
            <el-icon><DocumentChecked /></el-icon>
            PDF 工具
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <RegexTester v-if="activeTool === 'regex'" />
        <JsonEditor v-if="activeTool === 'json'" />
        <QrCodeTool v-if="activeTool === 'qrcode'" />
        <Whiteboard v-if="activeTool === 'whiteboard'" />
        <PdfTool v-if="activeTool === 'pdf'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Document, FullScreen, EditPen, DocumentChecked } from '@element-plus/icons-vue'
import RegexTester from '../components/dev/RegexTester.vue'
import JsonEditor from '../components/dev/JsonEditor.vue'
import QrCodeTool from '../components/dev/QrCodeTool.vue'
import Whiteboard from '../components/dev/Whiteboard.vue'
import PdfTool from '../components/dev/PdfTool.vue'

const activeTool = ref<'regex' | 'json' | 'qrcode' | 'whiteboard' | 'pdf'>('regex')
</script>
