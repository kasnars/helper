<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🌟 生活工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          日常生活中的实用计算器
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
          <el-radio-button label="bmi">
            <el-icon><DataLine /></el-icon>
            <span class="hidden sm:inline">BMI 计算</span>
            <span class="sm:hidden">BMI</span>
          </el-radio-button>
          <el-radio-button label="age">
            <el-icon><Calendar /></el-icon>
            <span class="hidden sm:inline">年龄星座</span>
            <span class="sm:hidden">年龄</span>
          </el-radio-button>
          <el-radio-button label="datecalc">
            <el-icon><Timer /></el-icon>
            <span class="hidden sm:inline">日期计算</span>
            <span class="sm:hidden">日期</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <!-- Food Picker -->
        <FoodPicker v-if="activeTool === 'food'" />

        <!-- Random Number -->
        <RandomNumber v-if="activeTool === 'random'" />

        <!-- BMI Calculator -->
        <BmiCalculator v-if="activeTool === 'bmi'" />

        <!-- Age Calculator -->
        <AgeCalculator v-if="activeTool === 'age'" />

        <!-- Date Calculator -->
        <DateCalculator v-if="activeTool === 'datecalc'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Food, CircleCheckFilled, DataLine, Calendar, Timer } from '@element-plus/icons-vue'
import FoodPicker from '../views/FoodPicker.vue'
import RandomNumber from '../views/RandomNumber.vue'
import BmiCalculator from '../components/life/BmiCalculator.vue'
import AgeCalculator from '../components/life/AgeCalculator.vue'
import DateCalculator from '../components/life/DateCalculator.vue'

const activeTool = ref('food')

// 从 sessionStorage 恢复 tab 状态
onMounted(() => {
  const savedTool = sessionStorage.getItem('activeLifeTool')
  if (savedTool && ['food', 'random', 'bmi', 'age', 'datecalc'].includes(savedTool)) {
    activeTool.value = savedTool
    sessionStorage.removeItem('activeLifeTool')
  }
})
</script>
