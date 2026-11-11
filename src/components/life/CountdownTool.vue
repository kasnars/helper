<template>
  <div class="space-y-4" data-testid="countdown-tool">
    <div class="grid gap-3 md:grid-cols-[1fr_160px_140px_auto]">
      <el-input v-model="title" placeholder="名称，例如 生日" data-testid="event-title" />
      <input v-model="date" type="date" data-testid="event-date" class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100" />
      <el-select v-model="kind">
        <el-option label="倒计时" value="countdown" />
        <el-option label="纪念日" value="anniversary" />
      </el-select>
      <el-button type="primary" data-testid="event-add" @click="add">添加</el-button>
    </div>
    <div v-if="nearest" class="rounded-2xl bg-gray-950 p-6 text-center text-white">
      <p class="text-sm text-gray-400">距离「{{ nearest.title }}」</p>
      <p class="mt-2 font-mono text-4xl">{{ clock }}</p>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <article v-for="item in events" :key="item.id" class="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.title }}</h3>
            <p class="text-sm text-gray-500">{{ item.date }} · {{ item.kind === 'countdown' ? '倒计时' : '纪念日' }}</p>
          </div>
          <el-button link type="danger" @click="remove(item.id)">删除</el-button>
        </div>
        <p class="mt-3 text-2xl font-semibold text-blue-600 dark:text-blue-300">{{ describe(item) }}</p>
      </article>
    </div>
    <p v-if="events.length === 0" class="text-sm text-gray-500">还没有日期。倒计时看还剩几天，纪念日看已经过了几天。</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface DayEvent { id: string; title: string; date: string; kind: 'countdown' | 'anniversary' }
const KEY = 'helper_events'
const title = ref('')
const date = ref('')
const kind = ref<'countdown' | 'anniversary'>('countdown')
const events = ref<DayEvent[]>([])
const now = ref(Date.now())
let timer = 0

const dayStart = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).getTime()
}
const daysBetween = (value: string) => Math.round((dayStart(value) - new Date().setHours(0, 0, 0, 0)) / 86400000)
const describe = (item: DayEvent) => {
  const days = daysBetween(item.date)
  if (item.kind === 'anniversary' || days < 0) return `已经 ${Math.abs(days)} 天`
  if (days === 0) return '就是今天'
  return `还有 ${days} 天`
}
const nearest = computed(() => events.value
  .filter((item) => item.kind === 'countdown' && daysBetween(item.date) >= 0)
  .sort((a, b) => daysBetween(a.date) - daysBetween(b.date))[0])
const clock = computed(() => {
  if (!nearest.value) return ''
  const target = dayStart(nearest.value.date)
  const left = Math.max(0, target - now.value)
  const total = Math.floor(left / 1000)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${days} 天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
const save = () => localStorage.setItem(KEY, JSON.stringify(events.value))
const add = () => {
  if (!title.value.trim() || !date.value) return
  events.value.push({ id: crypto.randomUUID(), title: title.value.trim(), date: date.value, kind: kind.value })
  title.value = ''
  save()
}
const remove = (id: string) => {
  events.value = events.value.filter((item) => item.id !== id)
  save()
}
onMounted(() => {
  try { events.value = JSON.parse(localStorage.getItem(KEY) || '[]') } catch { events.value = [] }
  timer = window.setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => window.clearInterval(timer))
</script>
