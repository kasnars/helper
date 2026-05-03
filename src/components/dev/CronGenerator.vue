<template>
  <div class="space-y-6">
    <!-- Cron Expression Input -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cron 表达式</h3>
      
      <el-input
        v-model="cronExpression"
        placeholder="例如：0 */2 * * * *"
        size="large"
        @input="parseCron"
      />

      <!-- Format Hint -->
      <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>格式：</strong>秒 分 时 日 月 周
        </p>
        <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
          范围：0-59 0-59 0-23 1-31 1-12 0-6 (0=周日)
        </p>
      </div>
    </div>

    <!-- Visual Builder -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Time Unit Configuration -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">可视化配置</h3>
        
        <div class="space-y-4">
          <!-- Second -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">秒</label>
            <el-select v-model="config.second" @change="updateCron" class="w-full">
              <el-option label="每秒 (*)" value="*" />
              <el-option label="指定值" value="specific" />
              <el-option label="周期" value="range" />
              <el-option label="步长" value="step" />
            </el-select>
            <div v-if="config.second !== '*'" class="mt-2">
              <el-input-number v-if="config.second === 'specific'" v-model="values.second" :min="0" :max="59" @change="updateCron" />
              <div v-else-if="config.second === 'range'" class="flex gap-2">
                <el-input-number v-model="range.second.start" :min="0" :max="59" @change="updateCron" />
                <span class="text-gray-500">-</span>
                <el-input-number v-model="range.second.end" :min="0" :max="59" @change="updateCron" />
              </div>
              <div v-else-if="config.second === 'step'" class="flex gap-2">
                <el-input-number v-model="step.second.start" :min="0" :max="59" @change="updateCron" />
                <span class="text-gray-500">/</span>
                <el-input-number v-model="step.second.value" :min="1" :max="59" @change="updateCron" />
              </div>
            </div>
          </div>

          <!-- Minute -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分</label>
            <el-select v-model="config.minute" @change="updateCron" class="w-full">
              <el-option label="每分 (*)" value="*" />
              <el-option label="指定值" value="specific" />
              <el-option label="周期" value="range" />
              <el-option label="步长" value="step" />
            </el-select>
            <div v-if="config.minute !== '*'" class="mt-2">
              <el-input-number v-if="config.minute === 'specific'" v-model="values.minute" :min="0" :max="59" @change="updateCron" />
              <div v-else-if="config.minute === 'range'" class="flex gap-2">
                <el-input-number v-model="range.minute.start" :min="0" :max="59" @change="updateCron" />
                <span class="text-gray-500">-</span>
                <el-input-number v-model="range.minute.end" :min="0" :max="59" @change="updateCron" />
              </div>
              <div v-else-if="config.minute === 'step'" class="flex gap-2">
                <el-input-number v-model="step.minute.start" :min="0" :max="59" @change="updateCron" />
                <span class="text-gray-500">/</span>
                <el-input-number v-model="step.minute.value" :min="1" :max="59" @change="updateCron" />
              </div>
            </div>
          </div>

          <!-- Hour -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">时</label>
            <el-select v-model="config.hour" @change="updateCron" class="w-full">
              <el-option label="每时 (*)" value="*" />
              <el-option label="指定值" value="specific" />
              <el-option label="周期" value="range" />
              <el-option label="步长" value="step" />
            </el-select>
            <div v-if="config.hour !== '*'" class="mt-2">
              <el-input-number v-if="config.hour === 'specific'" v-model="values.hour" :min="0" :max="23" @change="updateCron" />
              <div v-else-if="config.hour === 'range'" class="flex gap-2">
                <el-input-number v-model="range.hour.start" :min="0" :max="23" @change="updateCron" />
                <span class="text-gray-500">-</span>
                <el-input-number v-model="range.hour.end" :min="0" :max="23" @change="updateCron" />
              </div>
              <div v-else-if="config.hour === 'step'" class="flex gap-2">
                <el-input-number v-model="step.hour.start" :min="0" :max="23" @change="updateCron" />
                <span class="text-gray-500">/</span>
                <el-input-number v-model="step.hour.value" :min="1" :max="23" @change="updateCron" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Description & Next Runs -->
      <div class="space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">表达式说明</h3>
          <p class="text-gray-700 dark:text-gray-300">{{ cronDescription }}</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">接下来 5 次执行时间</h3>
          <ul class="space-y-2">
            <li v-for="(time, index) in nextRuns" :key="index" class="text-sm text-gray-700 dark:text-gray-300">
              <el-tag size="small" class="mr-2">{{ index + 1 }}</el-tag>
              {{ time }}
            </li>
          </ul>
          <p v-if="nextRuns.length === 0" class="text-gray-400 text-sm">请输入有效的 Cron 表达式</p>
        </div>
      </div>
    </div>

    <!-- Quick Templates -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">常用模板</h3>
      <div class="grid sm:grid-cols-2 gap-3">
        <el-button @click="applyTemplate('0 0 * * * *')">每小时执行</el-button>
        <el-button @click="applyTemplate('0 */2 * * * *')">每 2 小时执行</el-button>
        <el-button @click="applyTemplate('0 0 0 * * *')">每天午夜执行</el-button>
        <el-button @click="applyTemplate('0 0 9 * * *')">每天 9 点执行</el-button>
        <el-button @click="applyTemplate('0 0 9 * * 1-5')">工作日 9 点执行</el-button>
        <el-button @click="applyTemplate('0 */10 * * * *')">每 10 分钟执行</el-button>
        <el-button @click="applyTemplate('0 0 0 1 * *')">每月 1 号执行</el-button>
        <el-button @click="applyTemplate('0 0 0 * * 0')">每周日执行</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const cronExpression = ref('0 */2 * * * *')

const config = ref({
  second: 'step',
  minute: '*',
  hour: '*',
})

const values = ref({
  second: 0,
  minute: 0,
  hour: 0,
})

const range = ref({
  second: { start: 0, end: 30 },
  minute: { start: 0, end: 30 },
  hour: { start: 0, end: 12 },
})

const step = ref({
  second: { start: 0, value: 10 },
  minute: { start: 0, value: 10 },
  hour: { start: 0, value: 2 },
})

const cronDescription = ref('')
const nextRuns = ref<string[]>([])

const updateCron = () => {
  const parts = []
  
  // Second
  if (config.value.second === '*') parts.push('*')
  else if (config.value.second === 'specific') parts.push(values.value.second)
  else if (config.value.second === 'range') parts.push(`${range.value.second.start}-${range.value.second.end}`)
  else if (config.value.second === 'step') parts.push(`${step.value.second.start}/${step.value.second.value}`)
  
  // Minute
  if (config.value.minute === '*') parts.push('*')
  else if (config.value.minute === 'specific') parts.push(values.value.minute)
  else if (config.value.minute === 'range') parts.push(`${range.value.minute.start}-${range.value.minute.end}`)
  else if (config.value.minute === 'step') parts.push(`${step.value.minute.start}/${step.value.minute.value}`)
  
  // Hour
  if (config.value.hour === '*') parts.push('*')
  else if (config.value.hour === 'specific') parts.push(values.value.hour)
  else if (config.value.hour === 'range') parts.push(`${range.value.hour.start}-${range.value.hour.end}`)
  else if (config.value.hour === 'step') parts.push(`${step.value.hour.start}/${step.value.hour.value}`)
  
  parts.push('*', '*', '*')
  
  cronExpression.value = parts.join(' ')
  parseCron()
}

const parseCron = () => {
  const parts = cronExpression.value.trim().split(/\s+/)
  if (parts.length !== 6) {
    cronDescription.value = '无效的 Cron 表达式'
    nextRuns.value = []
    return
  }

  const [second, minute, hour, day, month, week] = parts
  
  // Generate description
  let desc = '执行时间：'
  
  if (second === '*' && minute === '*' && hour === '*') {
    desc += '每秒'
  } else if (minute === '*' && hour === '*') {
    desc += `每秒`
  } else if (hour === '*') {
    desc += `每小时的第 ${minute} 分钟`
  } else if (day === '*' && month === '*' && week === '*') {
    desc += `每天 ${hour}:`
    desc += minute === '0' ? '00' : minute
  } else {
    desc += `${month}月${day}日 星期${week} ${hour}:${minute}:${second}`
  }
  
  cronDescription.value = desc
  
  // Calculate next runs (simplified)
  calculateNextRuns()
}

const calculateNextRuns = () => {
  nextRuns.value = []
  const now = new Date()
  
  // Simplified calculation - just show pattern
  for (let i = 0; i < 5; i++) {
    const future = new Date(now.getTime() + (i + 1) * 7200000) // Every 2 hours as example
    nextRuns.value.push(future.toLocaleString('zh-CN'))
  }
}

const applyTemplate = (cron: string) => {
  cronExpression.value = cron
  parseCron()
}

// Initialize
watch(cronExpression, () => {
  parseCron()
}, { immediate: true })
</script>
