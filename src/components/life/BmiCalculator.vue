<template>
  <div class="space-y-6">
    <!-- 输入区域 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">BMI 计算器</h3>
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">身高 (cm)</label>
            <el-input-number v-model="height" :min="50" :max="250" :step="1" placeholder="170" class="w-full" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">体重 (kg)</label>
            <el-input-number v-model="weight" :min="10" :max="300" :step="0.5" placeholder="65" class="w-full" />
          </div>
        </div>
        <el-button type="primary" @click="calculate" :disabled="!height || !weight">
          计算 BMI
        </el-button>
      </div>
    </div>

    <!-- 结果 -->
    <div v-if="result" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">计算结果</h3>

      <!-- BMI 数值 -->
      <div class="text-center mb-6">
        <div class="text-5xl font-bold" :class="result.color">{{ result.bmi }}</div>
        <div class="text-lg mt-2" :class="result.color">{{ result.label }}</div>
      </div>

      <!-- BMI 进度条 -->
      <div class="mb-6">
        <div class="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400">
          <div
            class="absolute top-0 w-3 h-3 bg-white border-2 border-gray-800 rounded-full transform -translate-x-1/2 -translate-y-0.5"
            :style="{ left: indicatorPosition + '%' }"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>偏瘦 &lt;18.5</span>
          <span>正常 18.5-24</span>
          <span>偏胖 24-28</span>
          <span>肥胖 &gt;28</span>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 mb-1">BMI 指数</div>
          <div class="font-semibold text-gray-900 dark:text-white">{{ result.bmi }}</div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 mb-1">健康体重范围</div>
          <div class="font-semibold text-gray-900 dark:text-white">{{ result.healthyRange }}</div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 mb-1">与正常值差</div>
          <div class="font-semibold" :class="result.diffColor">{{ result.diff }}</div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 mb-1">建议体重</div>
          <div class="font-semibold text-gray-900 dark:text-white">{{ result.suggestedWeight }}</div>
        </div>
      </div>
    </div>

    <!-- BMI 说明 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">BMI 参考标准</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-lg p-3 text-center bg-blue-50 dark:bg-blue-900/20">
          <div class="text-sm font-medium text-blue-600 dark:text-blue-400">偏瘦</div>
          <div class="text-xs text-gray-500 mt-1">&lt; 18.5</div>
        </div>
        <div class="rounded-lg p-3 text-center bg-green-50 dark:bg-green-900/20">
          <div class="text-sm font-medium text-green-600 dark:text-green-400">正常</div>
          <div class="text-xs text-gray-500 mt-1">18.5 - 23.9</div>
        </div>
        <div class="rounded-lg p-3 text-center bg-yellow-50 dark:bg-yellow-900/20">
          <div class="text-sm font-medium text-yellow-600 dark:text-yellow-400">偏胖</div>
          <div class="text-xs text-gray-500 mt-1">24 - 27.9</div>
        </div>
        <div class="rounded-lg p-3 text-center bg-red-50 dark:bg-red-900/20">
          <div class="text-sm font-medium text-red-600 dark:text-red-400">肥胖</div>
          <div class="text-xs text-gray-500 mt-1">≥ 28</div>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-4">
        BMI（身体质量指数）= 体重(kg) ÷ 身高(m)²。此标准适用于中国成年人。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const height = ref<number | undefined>(undefined)
const weight = ref<number | undefined>(undefined)

const result = computed(() => {
  if (!height.value || !weight.value) return null

  const h = height.value / 100
  const bmi = +(weight.value / (h * h)).toFixed(1)
  const healthyMin = +(18.5 * h * h).toFixed(1)
  const healthyMax = +(23.9 * h * h).toFixed(1)
  const suggestedMin = +(18.5 * h * h).toFixed(1)
  const suggestedMax = +(23.9 * h * h).toFixed(1)

  let label: string
  let color: string
  let diffColor: string

  if (bmi < 18.5) {
    label = '偏瘦'
    color = 'text-blue-500'
    diffColor = 'text-blue-500'
  } else if (bmi < 24) {
    label = '正常'
    color = 'text-green-500'
    diffColor = 'text-green-500'
  } else if (bmi < 28) {
    label = '偏胖'
    color = 'text-yellow-500'
    diffColor = 'text-yellow-500'
  } else {
    label = '肥胖'
    color = 'text-red-500'
    diffColor = 'text-red-500'
  }

  const diff = bmi < 18.5
    ? `+${(18.5 - bmi).toFixed(1)}`
    : bmi > 24
      ? `+${(bmi - 24).toFixed(1)}`
      : '0'

  return {
    bmi,
    label,
    color,
    diffColor,
    healthyRange: `${healthyMin} - ${healthyMax} kg`,
    diff: bmi < 18.5 ? `需增 ${(18.5 * h * h - weight.value).toFixed(1)} kg` : bmi > 24 ? `需减 ${(weight.value - 23.9 * h * h).toFixed(1)} kg` : '正常',
    suggestedWeight: `${suggestedMin} - ${suggestedMax} kg`,
  }
})

const indicatorPosition = computed(() => {
  if (!result.value) return 0
  const bmi = result.value.bmi
  // 映射 BMI 10-40 到 0-100%
  return Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100))
})

const calculate = () => {
  // 触发 computed 重新计算（已自动响应）
}
</script>
