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
          <el-radio-button label="jwt">
            <el-icon><Key /></el-icon>
            <span class="hidden sm:inline">JWT 解码</span>
            <span class="sm:hidden">JWT</span>
          </el-radio-button>
          <el-radio-button label="url">
            <el-icon><Link /></el-icon>
            <span class="hidden sm:inline">URL 编解码</span>
            <span class="sm:hidden">URL</span>
          </el-radio-button>
          <el-radio-button label="cron">
            <el-icon><Timer /></el-icon>
            <span class="hidden sm:inline">Cron 生成器</span>
            <span class="sm:hidden">Cron</span>
          </el-radio-button>
          <el-radio-button label="markdown">
            <el-icon><Document /></el-icon>
            <span class="hidden sm:inline">Markdown</span>
            <span class="sm:hidden">MD</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <RegexTester v-if="activeTool === 'regex'" />
        <JsonEditor v-if="activeTool === 'json'" />
        <Base64Tool v-if="activeTool === 'base64'" />
        <TimestampTool v-if="activeTool === 'timestamp'" />
        <ColorTool v-if="activeTool === 'color'" />
        <HashTool v-if="activeTool === 'hash'" />
        <TextStatTool v-if="activeTool === 'textstat'" />
        <RadixTool v-if="activeTool === 'radix'" />
        <UUIDTool v-if="activeTool === 'uuid'" />
        <JWTDecoder v-if="activeTool === 'jwt'" />
        <URLEncoder v-if="activeTool === 'url'" />
        <CronGenerator v-if="activeTool === 'cron'" />
        <MarkdownPreview v-if="activeTool === 'markdown'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Document, Share, Timer, Brush, Key, Sort, Postcard, Link } from '@element-plus/icons-vue'
import RegexTester from '../components/dev/RegexTester.vue'
import JsonEditor from '../components/dev/JsonEditor.vue'
import Base64Tool from '../components/dev/Base64Tool.vue'
import TimestampTool from '../components/dev/TimestampTool.vue'
import ColorTool from '../components/dev/ColorTool.vue'
import HashTool from '../components/dev/HashTool.vue'
import TextStatTool from '../components/dev/TextStatTool.vue'
import RadixTool from '../components/dev/RadixTool.vue'
import UUIDTool from '../components/dev/UUIDTool.vue'
import JWTDecoder from '../components/dev/JWTDecoder.vue'
import URLEncoder from '../components/dev/URLEncoder.vue'
import CronGenerator from '../components/dev/CronGenerator.vue'
import MarkdownPreview from '../components/dev/MarkdownPreview.vue'

const activeTool = ref<'regex' | 'json' | 'base64' | 'timestamp' | 'color' | 'hash' | 'textstat' | 'radix' | 'uuid' | 'jwt' | 'url' | 'cron' | 'markdown'>('regex')

// 从 sessionStorage 恢复 tab 状态
onMounted(() => {
  const savedTool = sessionStorage.getItem('activeTool')
  if (savedTool && ['regex', 'json', 'base64', 'timestamp', 'color', 'hash', 'textstat', 'radix', 'uuid', 'jwt', 'url', 'cron', 'markdown'].includes(savedTool)) {
    activeTool.value = savedTool as any
    sessionStorage.removeItem('activeTool')
  }
})
</script>
