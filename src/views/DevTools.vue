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
            <span class="hidden sm:inline">正则测试</span>
            <span class="sm:hidden">正则</span>
          </el-radio-button>
          <el-radio-button label="json">
            <el-icon><Document /></el-icon>
            <span class="hidden sm:inline">JSON 工具</span>
            <span class="sm:hidden">JSON</span>
          </el-radio-button>
          <el-radio-button label="qrcode">
            <el-icon><FullScreen /></el-icon>
            <span class="hidden sm:inline">二维码</span>
            <span class="sm:hidden">二维码</span>
          </el-radio-button>
          <el-radio-button label="whiteboard">
            <el-icon><EditPen /></el-icon>
            <span class="hidden sm:inline">在线画板</span>
            <span class="sm:hidden">画板</span>
          </el-radio-button>
          <el-radio-button label="pdf">
            <el-icon><DocumentChecked /></el-icon>
            <span class="hidden sm:inline">PDF 工具</span>
            <span class="sm:hidden">PDF</span>
          </el-radio-button>
          <el-radio-button label="base64">
            <el-icon><Share /></el-icon>
            <span class="hidden sm:inline">Base64</span>
            <span class="sm:hidden">Base64</span>
          </el-radio-button>
          <el-radio-button label="timestamp">
            <el-icon><Timer /></el-icon>
            <span class="hidden sm:inline">时间戳</span>
            <span class="sm:hidden">时间戳</span>
          </el-radio-button>
          <el-radio-button label="color">
            <el-icon><Brush /></el-icon>
            <span class="hidden sm:inline">颜色工具</span>
            <span class="sm:hidden">颜色</span>
          </el-radio-button>
          <el-radio-button label="hash">
            <el-icon><Key /></el-icon>
            <span class="hidden sm:inline">哈希</span>
            <span class="sm:hidden">哈希</span>
          </el-radio-button>
          <el-radio-button label="textstat">
            <el-icon><Document /></el-icon>
            <span class="hidden sm:inline">文本统计</span>
            <span class="sm:hidden">文本</span>
          </el-radio-button>
          <el-radio-button label="radix">
            <el-icon><Sort /></el-icon>
            <span class="hidden sm:inline">进制转换</span>
            <span class="sm:hidden">进制</span>
          </el-radio-button>
          <el-radio-button label="uuid">
            <el-icon><Postcard /></el-icon>
            <span class="hidden sm:inline">UUID</span>
            <span class="sm:hidden">UUID</span>
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
        <Base64Tool v-if="activeTool === 'base64'" />
        <TimestampTool v-if="activeTool === 'timestamp'" />
        <ColorTool v-if="activeTool === 'color'" />
        <HashTool v-if="activeTool === 'hash'" />
        <TextStatTool v-if="activeTool === 'textstat'" />
        <RadixTool v-if="activeTool === 'radix'" />
        <UUIDTool v-if="activeTool === 'uuid'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Document, FullScreen, EditPen, DocumentChecked, Share, Timer, Brush, Key, Sort, Postcard } from '@element-plus/icons-vue'
import RegexTester from '../components/dev/RegexTester.vue'
import JsonEditor from '../components/dev/JsonEditor.vue'
import QrCodeTool from '../components/dev/QrCodeTool.vue'
import Whiteboard from '../components/dev/Whiteboard.vue'
import PdfTool from '../components/dev/PdfTool.vue'
import Base64Tool from '../components/dev/Base64Tool.vue'
import TimestampTool from '../components/dev/TimestampTool.vue'
import ColorTool from '../components/dev/ColorTool.vue'
import HashTool from '../components/dev/HashTool.vue'
import TextStatTool from '../components/dev/TextStatTool.vue'
import RadixTool from '../components/dev/RadixTool.vue'
import UUIDTool from '../components/dev/UUIDTool.vue'

const activeTool = ref<'regex' | 'json' | 'qrcode' | 'whiteboard' | 'pdf' | 'base64' | 'timestamp' | 'color' | 'hash' | 'textstat' | 'radix' | 'uuid'>('regex')
</script>
