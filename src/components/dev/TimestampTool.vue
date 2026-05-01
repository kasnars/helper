<template>
  <div class="space-y-6">
    <!-- Current Time -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">当前时间</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">Unix 时间戳 (秒)</p>
          <p class="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">{{ currentTimestamp }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">Unix 时间戳 (毫秒)</p>
          <p class="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">{{ currentTimestampMs }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">本地时间</p>
          <p class="font-mono text-sm font-semibold">{{ currentTime }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">UTC 时间</p>
          <p class="font-mono text-sm font-semibold">{{ currentUTCTime }}</p>
        </div>
      </div>
    </div>

    <!-- Timestamp to Date -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">时间戳转日期</h3>
      <div class="space-y-4">
        <div class="flex gap-4">
          <el-input
            v-model="timestampInput"
            placeholder="输入时间戳 (秒或毫秒)"
            class="flex-1"
            @keyup.enter="timestampToDate"
          />
          <el-button type="primary" @click="timestampToDate" :disabled="!timestampInput">
            转换
          </el-button>
          <el-button @click="fillCurrentTimestamp">
            <el-icon><Refresh /></el-icon>
            当前时间戳
          </el-button>
        </div>
        
        <div v-if="timestampResult" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">本地时间:</span>
            <span class="font-mono font-semibold">{{ timestampResult.local }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">UTC 时间:</span>
            <span class="font-mono font-semibold">{{ timestampResult.utc }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">ISO 格式:</span>
            <span class="font-mono font-semibold text-xs">{{ timestampResult.iso }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">相对时间:</span>
            <span class="font-semibold">{{ timestampResult.relative }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Date to Timestamp -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">日期转时间戳</h3>
      <div class="space-y-4">
        <div class="flex gap-4">
          <el-date-picker
            v-model="dateInput"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="flex-1"
          />
          <el-button type="primary" @click="dateToTimestamp" :disabled="!dateInput">
            转换
          </el-button>
          <el-button @click="fillCurrentDate">
            <el-icon><Refresh /></el-icon>
            当前时间
          </el-button>
        </div>
        
        <div v-if="dateResult" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">时间戳 (秒):</span>
            <span class="font-mono font-semibold text-blue-600 dark:text-blue-400">{{ dateResult.seconds }}</span>
            <el-button size="small" link @click="copyToClipboard(dateResult.seconds)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">时间戳 (毫秒):</span>
            <span class="font-mono font-semibold text-blue-600 dark:text-blue-400">{{ dateResult.milliseconds }}</span>
            <el-button size="small" link @click="copyToClipboard(dateResult.milliseconds)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const currentTimestamp = ref('')
const currentTimestampMs = ref('')
const currentTime = ref('')
const currentUTCTime = ref('')

const timestampInput = ref('')
const timestampResult = ref<any>(null)

const dateInput = ref('')
const dateResult = ref<any>(null)

let timer: number | null = null

const updateCurrentTime = () => {
  const now = new Date()
  currentTimestamp.value = Math.floor(now.getTime() / 1000).toString()
  currentTimestampMs.value = now.getTime().toString()
  currentTime.value = now.toLocaleString('zh-CN')
  currentUTCTime.value = now.toUTCString()
}

const timestampToDate = () => {
  const ts = parseInt(timestampInput.value)
  if (isNaN(ts)) {
    ElMessage.error('请输入有效的时间戳')
    return
  }
  
  // Auto detect if milliseconds or seconds
  const isMilliseconds = ts.toString().length > 12
  const date = new Date(isMilliseconds ? ts : ts * 1000)
  
  timestampResult.value = {
    local: date.toLocaleString('zh-CN'),
    utc: date.toUTCString(),
    iso: date.toISOString(),
    relative: getRelativeTime(date)
  }
}

const dateToTimestamp = () => {
  const date = new Date(dateInput.value)
  if (isNaN(date.getTime())) {
    ElMessage.error('请选择有效的日期时间')
    return
  }
  
  dateResult.value = {
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime()
  }
}

const fillCurrentTimestamp = () => {
  timestampInput.value = currentTimestamp.value
  timestampToDate()
}

const fillCurrentDate = () => {
  const now = new Date()
  dateInput.value = now.toISOString().slice(0, 19).replace('T', ' ')
  dateToTimestamp()
}

const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.abs(Math.floor(diff / 1000))
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (diff > 0) {
    if (days > 365) return `${Math.floor(days / 365)} 年前`
    if (days > 30) return `${Math.floor(days / 30)} 个月前`
    if (days > 0) return `${days} 天前`
    if (hours > 0) return `${hours} 小时前`
    if (minutes > 0) return `${minutes} 分钟前`
    return `${seconds} 秒前`
  } else {
    if (days > 365) return `${Math.floor(days / 365)} 年后`
    if (days > 30) return `${Math.floor(days / 30)} 个月后`
    if (days > 0) return `${days} 天后`
    if (hours > 0) return `${hours} 小时后`
    if (minutes > 0) return `${minutes} 分钟后`
    return `${seconds} 秒后`
  }
}

const copyToClipboard = (text: string | number) => {
  navigator.clipboard.writeText(text.toString())
  ElMessage.success('已复制')
}

onMounted(() => {
  updateCurrentTime()
  timer = window.setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
