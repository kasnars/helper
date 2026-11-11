<template>
  <div class="space-y-6" data-testid="pomodoro-tool">
    <div class="flex flex-wrap gap-2">
      <el-radio-group v-model="mode">
        <el-radio-button value="focus">专注</el-radio-button>
        <el-radio-button value="short">短休</el-radio-button>
        <el-radio-button value="long">长休</el-radio-button>
      </el-radio-group>
      <el-input-number v-model="minutes.focus" :min="1" :max="90" /> 
      <span class="self-center text-sm text-gray-500">专注分钟，短休</span>
      <el-input-number v-model="minutes.short" :min="1" :max="30" />
      <span class="self-center text-sm text-gray-500">长休</span>
      <el-input-number v-model="minutes.long" :min="1" :max="60" />
    </div>
    <div class="rounded-2xl bg-gray-950 px-6 py-10 text-center text-white">
      <p class="text-sm text-gray-400">{{ modeLabel }}</p>
      <p class="mt-2 font-mono text-6xl" data-testid="pomodoro-clock">{{ clock }}</p>
      <div class="mt-6 flex justify-center gap-2">
        <el-button type="primary" data-testid="pomodoro-toggle" @click="toggle">{{ running ? '暂停' : '开始' }}</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>
    <div>
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">今日复盘</h3>
      <el-input v-model="note" type="textarea" :rows="4" placeholder="这轮专注做了什么，下次要改什么" @change="save" />
    </div>
    <div>
      <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">本周专注</h3>
      <div class="grid grid-cols-7 gap-2">
        <div v-for="day in week" :key="day.label" class="text-center">
          <div class="flex h-28 items-end justify-center rounded-lg bg-gray-100 dark:bg-gray-900">
            <div class="w-6 rounded-t bg-blue-500" :style="{ height: barHeight(day.minutes) }" />
          </div>
          <div class="mt-1 text-xs text-gray-500">{{ day.label }}</div>
          <div class="text-xs text-gray-400">{{ day.minutes }} 分</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { getDB, type PomodoroDay } from '@/db'

interface Log { date: string; minutes: number }
interface State { note: string; noteDate: string; logs: Log[] }

const KEY = 'helper_pomodoro'
const mode = ref<'focus' | 'short' | 'long'>('focus')
const minutes = reactive({ focus: 25, short: 5, long: 15 })
const left = ref(25 * 60)
const running = ref(false)
const note = ref('')
const logs = ref<Log[]>([])
let timer = 0

const localDate = (date = new Date()) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
const today = () => localDate()
const modeLabel = computed(() => ({ focus: '专注', short: '短休息', long: '长休息' }[mode.value]))
const clock = computed(() => `${String(Math.floor(left.value / 60)).padStart(2, '0')}:${String(left.value % 60).padStart(2, '0')}`)

const week = computed(() => {
  const start = new Date()
  const day = start.getDay() || 7
  start.setDate(start.getDate() - day + 1)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const key = localDate(date)
    const found = logs.value.find((item) => item.date === key)
    return { label: '一二三四五六日'[index], minutes: found?.minutes || 0 }
  })
})

const barHeight = (value: number) => `${Math.max(4, Math.min(100, value))}%`

const persist = async () => {
  const db = getDB()
  const key = today()
  for (const item of logs.value) {
    const existing = await db.pomodoroDays.get(item.date)
    await db.pomodoroDays.put({
      date: item.date,
      minutes: item.minutes,
      note: item.date === key ? note.value : existing?.note || '',
    })
  }
  if (!logs.value.some((item) => item.date === key)) {
    await db.pomodoroDays.put({ date: key, minutes: 0, note: note.value })
  }
}

const save = () => { void persist() }

const finish = () => {
  running.value = false
  window.clearInterval(timer)
  if (mode.value === 'focus') {
    const key = today()
    const found = logs.value.find((item) => item.date === key)
    if (found) found.minutes += minutes.focus
    else logs.value.push({ date: key, minutes: minutes.focus })
    save()
  }
}

const toggle = () => {
  running.value = !running.value
  window.clearInterval(timer)
  if (!running.value) return
  timer = window.setInterval(() => {
    left.value -= 1
    if (left.value <= 0) finish()
  }, 1000)
}

const reset = () => {
  running.value = false
  window.clearInterval(timer)
  left.value = minutes[mode.value] * 60
}

watch(mode, reset)
watch(minutes, reset)

onMounted(async () => {
  try {
    const rows = await getDB().pomodoroDays.toArray()
    if (rows.length) {
      logs.value = rows.map((row: PomodoroDay) => ({ date: row.date, minutes: row.minutes }))
      note.value = rows.find((row) => row.date === today())?.note || ''
    } else {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const state = JSON.parse(raw) as State
        logs.value = state.logs || []
        if (state.noteDate === today()) note.value = state.note || ''
        await persist()
        localStorage.removeItem(KEY)
      }
    }
  } catch {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const state = JSON.parse(raw) as State
      logs.value = state.logs || []
      if (state.noteDate === today()) note.value = state.note || ''
    }
  }
  reset()
})
onUnmounted(() => window.clearInterval(timer))
</script>
