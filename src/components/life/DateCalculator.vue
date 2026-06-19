<template>
  <div class="space-y-6">
    <!-- 模式切换 -->
    <div class="flex gap-2">
      <el-button :type="mode === 'diff' ? 'primary' : ''" @click="mode = 'diff'">日期间隔</el-button>
      <el-button :type="mode === 'add' ? 'primary' : ''" @click="mode = 'add'">日期加减</el-button>
    </div>

    <!-- 日期间隔计算 -->
    <div v-if="mode === 'diff'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">计算两个日期之间的间隔</h3>
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">开始日期</label>
            <el-date-picker
              v-model="diffStart"
              type="date"
              placeholder="选择开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">结束日期</label>
            <el-date-picker
              v-model="diffEnd"
              type="date"
              placeholder="选择结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <el-button type="primary" @click="calculateDiff" :disabled="!diffStart || !diffEnd">计算间隔</el-button>
          <el-button @click="swapDates">交换日期</el-button>
          <el-button @click="setToday('start')">今天作开始</el-button>
          <el-button @click="setToday('end')">今天作结束</el-button>
        </div>
      </div>

      <!-- 间隔结果 -->
      <div v-if="diffResult" class="mt-6 space-y-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-blue-500">{{ diffResult.years }}</div>
            <div class="text-xs text-gray-500 mt-1">年</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-green-500">{{ diffResult.months }}</div>
            <div class="text-xs text-gray-500 mt-1">月</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-purple-500">{{ diffResult.days }}</div>
            <div class="text-xs text-gray-500 mt-1">天</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-orange-500">{{ diffResult.weeks }}</div>
            <div class="text-xs text-gray-500 mt-1">周（余{{ diffResult.weekDays }}天）</div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div class="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span class="text-gray-500">总天数</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ diffResult.totalDays.toLocaleString() }} 天</span>
          </div>
          <div class="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span class="text-gray-500">总小时</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ diffResult.totalHours.toLocaleString() }} 小时</span>
          </div>
          <div class="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span class="text-gray-500">总分钟</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ diffResult.totalMinutes.toLocaleString() }} 分钟</span>
          </div>
        </div>

        <div class="text-sm text-gray-500 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          📅 {{ diffStart }}（{{ diffResult.startDayOfWeek }}）→ {{ diffEnd }}（{{ diffResult.endDayOfWeek }}）
        </div>
      </div>
    </div>

    <!-- 日期加减计算 -->
    <div v-if="mode === 'add'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">日期加减计算</h3>
      <div class="space-y-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">基准日期</label>
          <el-date-picker
            v-model="addBaseDate"
            type="date"
            placeholder="选择基准日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full sm:w-auto"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">年</label>
            <el-input-number v-model="addYears" :min="-100" :max="100" class="w-full" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">月</label>
            <el-input-number v-model="addMonths" :min="-1200" :max="1200" class="w-full" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">天</label>
            <el-input-number v-model="addDays" :min="-36500" :max="36500" class="w-full" />
          </div>
        </div>
        <div class="flex gap-2">
          <el-button type="primary" @click="calculateAdd" :disabled="!addBaseDate">计算结果</el-button>
          <el-button @click="resetAdd">重置</el-button>
        </div>
      </div>

      <!-- 加减结果 -->
      <div v-if="addResult" class="mt-6">
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
          <div class="text-sm text-gray-500 mb-2">
            {{ addBaseDate }} {{ addYears ? (addYears > 0 ? '+' : '') + addYears + '年' : '' }}{{ addMonths ? (addMonths > 0 ? ' +' : ' ') + addMonths + '月' : '' }}{{ addDays ? (addDays > 0 ? ' +' : ' ') + addDays + '天' : '' }}
          </div>
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ addResult.date }}</div>
          <div class="text-sm text-gray-500 mt-2">{{ addResult.dayOfWeek }}</div>
          <div v-if="addResult.daysFromNow !== 0" class="text-sm mt-2" :class="addResult.daysFromNow > 0 ? 'text-green-500' : 'text-red-500'">
            距今{{ addResult.daysFromNow > 0 ? '还有' : '已过' }} {{ Math.abs(addResult.daysFromNow) }} 天
          </div>
          <div v-else class="text-sm mt-2 text-blue-500">就是今天</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mode = ref<'diff' | 'add'>('diff')

// 日期间隔
const diffStart = ref('')
const diffEnd = ref('')
const diffResult = ref<any>(null)

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const calculateDiff = () => {
  if (!diffStart.value || !diffEnd.value) return

  const start = new Date(diffStart.value)
  const end = new Date(diffEnd.value)

  // 确保 start <= end
  const [earlier, later] = start <= end ? [start, end] : [end, start]

  // 计算年月日
  let years = later.getFullYear() - earlier.getFullYear()
  let months = later.getMonth() - earlier.getMonth()
  let days = later.getDate() - earlier.getDate()

  if (days < 0) {
    months--
    const lastMonth = new Date(later.getFullYear(), later.getMonth(), 0)
    days += lastMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  // 总天数
  const totalDays = Math.abs(Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24)))
  const totalHours = totalDays * 24
  const totalMinutes = totalHours * 60
  const weeks = Math.floor(totalDays / 7)
  const weekDaysRemain = totalDays % 7

  diffResult.value = {
    years,
    months,
    days,
    totalDays,
    totalHours,
    totalMinutes,
    weeks,
    weekDays: weekDaysRemain,
    startDayOfWeek: weekDays[start.getDay()],
    endDayOfWeek: weekDays[end.getDay()],
  }
}

const swapDates = () => {
  const temp = diffStart.value
  diffStart.value = diffEnd.value
  diffEnd.value = temp
}

const setToday = (target: 'start' | 'end') => {
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (target === 'start') {
    diffStart.value = dateStr
  } else {
    diffEnd.value = dateStr
  }
}

// 日期加减
const addBaseDate = ref('')
const addYears = ref(0)
const addMonths = ref(0)
const addDays = ref(0)
const addResult = ref<any>(null)

const calculateAdd = () => {
  if (!addBaseDate.value) return

  const base = new Date(addBaseDate.value)
  const result = new Date(base)

  result.setFullYear(result.getFullYear() + addYears.value)
  result.setMonth(result.getMonth() + addMonths.value)
  result.setDate(result.getDate() + addDays.value)

  const dateStr = `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  result.setHours(0, 0, 0, 0)
  const daysFromNow = Math.floor((result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  addResult.value = {
    date: dateStr,
    dayOfWeek: weekDays[result.getDay()],
    daysFromNow,
  }
}

const resetAdd = () => {
  addYears.value = 0
  addMonths.value = 0
  addDays.value = 0
  addResult.value = null
}
</script>
