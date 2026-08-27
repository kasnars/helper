<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🧰 实用工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          二维码、加密、转换等实用小工具
        </p>
      </div>

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large" class="tool-switcher">
          <el-radio-button label="unit">
            <el-icon><ScaleToOriginal /></el-icon>
            <span class="hidden sm:inline">单位换算</span>
            <span class="sm:hidden">换算</span>
          </el-radio-button>
          <el-radio-button label="password">
            <el-icon><Lock /></el-icon>
            <span class="hidden sm:inline">密码生成</span>
            <span class="sm:hidden">密码</span>
          </el-radio-button>
          <el-radio-button label="encrypt">
            <el-icon><Key /></el-icon>
            <span class="hidden sm:inline">加密解密</span>
            <span class="sm:hidden">加密</span>
          </el-radio-button>
          <el-radio-button label="cron">
            <el-icon><Timer /></el-icon>
            <span class="hidden sm:inline">Cron 生成器</span>
            <span class="sm:hidden">Cron</span>
          </el-radio-button>
          <el-radio-button label="json2excel">
            <el-icon><Grid /></el-icon>
            <span class="hidden sm:inline">JSON转Excel</span>
            <span class="sm:hidden">Excel</span>
          </el-radio-button>
          <el-radio-button label="amount">
            <el-icon><Money /></el-icon>
            <span class="hidden sm:inline">金额大写</span>
            <span class="sm:hidden">金额</span>
          </el-radio-button>
          <el-radio-button label="tts">
            <el-icon><Microphone /></el-icon>
            <span class="hidden sm:inline">文字转语音</span>
            <span class="sm:hidden">语音</span>
          </el-radio-button>
          <el-radio-button label="mock">
            <el-icon><DataLine /></el-icon>
            <span class="hidden sm:inline">Mock数据</span>
            <span class="sm:hidden">Mock</span>
          </el-radio-button>
          <el-radio-button label="cssunit">
            <el-icon><SetUp /></el-icon>
            <span class="hidden sm:inline">CSS单位转换</span>
            <span class="sm:hidden">CSS</span>
          </el-radio-button>
          <el-radio-button label="jsontree">
            <el-icon><Share /></el-icon>
            <span class="hidden sm:inline">JSON查看器</span>
            <span class="sm:hidden">JSON树</span>
          </el-radio-button>
          <el-radio-button label="audioviz">
            <el-icon><Headset /></el-icon>
            <span class="hidden sm:inline">音频可视化</span>
            <span class="sm:hidden">波形</span>
          </el-radio-button>
          <el-radio-button label="pwcheck">
            <el-icon><Lock /></el-icon>
            <span class="hidden sm:inline">密码强度</span>
            <span class="sm:hidden">强度</span>
          </el-radio-button>
          <el-radio-button label="totp">
            <el-icon><Key /></el-icon>
            <span class="hidden sm:inline">TOTP验证码</span>
            <span class="sm:hidden">TOTP</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <UnitConverter v-if="activeTool === 'unit'" />
        <PasswordGenerator v-if="activeTool === 'password'" />
        <TextEncryptor v-if="activeTool === 'encrypt'" />
        <CronGenerator v-if="activeTool === 'cron'" />
        <JsonToExcel v-if="activeTool === 'json2excel'" />
        <AmountToChinese v-if="activeTool === 'amount'" />
        <TextToSpeech v-if="activeTool === 'tts'" />
        <MockDataGenerator v-if="activeTool === 'mock'" />
        <CssUnitConverter v-if="activeTool === 'cssunit'" />
        <JsonTreeView v-if="activeTool === 'jsontree'" />
        <AudioVisualizer v-if="activeTool === 'audioviz'" />
        <PasswordStrengthChecker v-if="activeTool === 'pwcheck'" />
        <TotpGenerator v-if="activeTool === 'totp'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { ScaleToOriginal, Lock, Key, Timer, Grid, Money, Microphone, DataLine, SetUp, Share, Headset } from '@element-plus/icons-vue'
const UnitConverter = defineAsyncComponent(() => import('../components/dev/UnitConverter.vue'))
const PasswordGenerator = defineAsyncComponent(() => import('../components/life/PasswordGenerator.vue'))
const TextEncryptor = defineAsyncComponent(() => import('../components/life/TextEncryptor.vue'))
const CronGenerator = defineAsyncComponent(() => import('../components/dev/CronGenerator.vue'))
const JsonToExcel = defineAsyncComponent(() => import('../components/utility/JsonToExcel.vue'))
const AmountToChinese = defineAsyncComponent(() => import('../components/utility/AmountToChinese.vue'))
const TextToSpeech = defineAsyncComponent(() => import('../components/utility/TextToSpeech.vue'))
const MockDataGenerator = defineAsyncComponent(() => import('../components/utility/MockDataGenerator.vue'))
const CssUnitConverter = defineAsyncComponent(() => import('../components/utility/CssUnitConverter.vue'))
const JsonTreeView = defineAsyncComponent(() => import('../components/utility/JsonTreeView.vue'))
const AudioVisualizer = defineAsyncComponent(() => import('../components/utility/AudioVisualizer.vue'))
const PasswordStrengthChecker = defineAsyncComponent(() => import('../components/utility/PasswordStrengthChecker.vue'))
const TotpGenerator = defineAsyncComponent(() => import('../components/utility/TotpGenerator.vue'))

const activeTool = ref('unit')
const toolList = ['unit', 'password', 'encrypt', 'cron', 'json2excel', 'amount', 'tts', 'mock', 'cssunit', 'jsontree', 'audioviz', 'pwcheck', 'totp']

onMounted(() => {
  const savedTool = sessionStorage.getItem('activeUtilityTool')
  if (savedTool && toolList.includes(savedTool)) {
    activeTool.value = savedTool
    sessionStorage.removeItem('activeUtilityTool')
  }
})
</script>
