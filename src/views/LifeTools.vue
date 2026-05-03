<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🌟 生活工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          日常生活中的实用小工具
        </p>
      </div>

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large">
          <el-radio-button label="food">
            <el-icon><Food /></el-icon>
            <span class="hidden sm:inline">今天吃什么</span>
            <span class="sm:hidden">吃什么</span>
          </el-radio-button>
          <el-radio-button label="random">
            <el-icon><CircleCheckFilled /></el-icon>
            <span class="hidden sm:inline">随机数生成</span>
            <span class="sm:hidden">随机数</span>
          </el-radio-button>
          <el-radio-button label="qrcode">
            <el-icon><FullScreen /></el-icon>
            <span class="hidden sm:inline">二维码工具</span>
            <span class="sm:hidden">二维码</span>
          </el-radio-button>
          <el-radio-button label="unit">
            <el-icon><ScaleToOriginal /></el-icon>
            <span class="hidden sm:inline">单位换算</span>
            <span class="sm:hidden">换算</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <!-- Food Picker -->
        <FoodPicker v-if="activeTool === 'food'" />

        <!-- Random Number -->
        <RandomNumber v-if="activeTool === 'random'" />

        <!-- QR Code Tool -->
        <QrCodeTool v-if="activeTool === 'qrcode'" />

        <!-- Unit Converter -->
        <UnitConverter v-if="activeTool === 'unit'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Food, CircleCheckFilled, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'
import FoodPicker from '../views/FoodPicker.vue'
import RandomNumber from '../views/RandomNumber.vue'
import QrCodeTool from '../components/dev/QrCodeTool.vue'
import UnitConverter from '../components/dev/UnitConverter.vue'

const activeTool = ref<'food' | 'random' | 'qrcode' | 'unit'>('food')

// 从 sessionStorage 恢复 tab 状态
onMounted(() => {
  const savedTool = sessionStorage.getItem('activeTool')
  if (savedTool && ['food', 'random', 'qrcode', 'unit'].includes(savedTool)) {
    activeTool.value = savedTool as any
    sessionStorage.removeItem('activeTool')
  }
})
</script>
