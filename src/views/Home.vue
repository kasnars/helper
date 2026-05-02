<template>
  <div class="min-h-screen">
    <!-- Hero section -->
    <div class="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Helper
          </span>
          工具集
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
          整合日常小工具，让生活更便捷
        </p>
      </div>
    </div>

    <!-- Tools grid -->
    <div class="px-4 sm:px-6 lg:px-8 pb-12">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            to="/life"
            title="生活工具"
            description="今天吃什么、随机数生成、密码本、在线画板等日常生活实用工具。"
            :icon="Star"
            color="orange"
          />
          <ToolCard
            to="/file"
            title="文件工具"
            description="图片格式转换与压缩、PDF处理工具，纯前端处理保护隐私。"
            :icon="FolderOpened"
            color="blue"
          />
          <ToolCard
            to="/devtools"
            title="开发工具"
            description="Base64、时间戳、颜色工具、哈希生成、JSON编辑器、二维码等开发必备工具。"
            :icon="Tools"
            color="green"
          />
        </div>
      </div>
    </div>

    <!-- Features section -->
    <div class="px-4 sm:px-6 lg:px-8 py-12 bg-gray-50/50 dark:bg-gray-800/30">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">功能特点</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="text-center p-4">
            <div class="w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <el-icon :size="24" class="text-blue-600 dark:text-blue-400">
                <Moon />
              </el-icon>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">暗黑模式</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">支持白天/黑夜主题切换</p>
          </div>
          <div class="text-center p-4">
            <div class="w-12 h-12 mx-auto rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <el-icon :size="24" class="text-green-600 dark:text-green-400">
                <Cellphone />
              </el-icon>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">响应式设计</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">完美适配移动端和PC端</p>
          </div>
          <div class="text-center p-4">
            <div class="w-12 h-12 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
              <el-icon :size="24" class="text-purple-600 dark:text-purple-400">
                <Files />
              </el-icon>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">数据持久化</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">本地存储，数据不丢失</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, FolderOpened, Tools, Moon, Cellphone, Files } from '@element-plus/icons-vue'
import ToolCard from '../components/common/ToolCard.vue'
</script>
