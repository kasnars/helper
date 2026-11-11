<template>
  <div class="space-y-4" data-testid="currency-tool">
    <div class="grid gap-3 md:grid-cols-4">
      <el-input-number v-model="amount" :min="0" class="w-full" data-testid="currency-amount" />
      <el-select v-model="from" filterable><el-option v-for="code in codes" :key="code" :label="code" :value="code" /></el-select>
      <el-select v-model="to" filterable><el-option v-for="code in codes" :key="code" :label="code" :value="code" /></el-select>
      <el-button type="primary" data-testid="currency-refresh" @click="refresh">刷新汇率</el-button>
    </div>
    <div class="rounded-2xl bg-gray-950 p-6 text-white">
      <p class="text-sm text-gray-400">{{ amount }} {{ from }}</p>
      <p class="mt-2 text-4xl font-semibold" data-testid="currency-result">{{ resultText }} {{ to }}</p>
      <p class="mt-3 text-sm" :class="source === 'live' ? 'text-emerald-300' : 'text-amber-300'">{{ sourceLabel }} <span v-if="updatedAt">· {{ updatedAt }}</span></p>
    </div>
    <p class="text-sm text-gray-500">汇率来自欧洲央行公开接口。离线时先用上次成功的缓存，没有缓存就用内置估算，界面会标明来源。</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { convertCurrency, loadRates, type RateTable } from '@/lib/currency'

const amount = ref(100)
const from = ref('CNY')
const to = ref('USD')
const table = ref<RateTable | null>(null)

const codes = computed(() => Object.keys(table.value?.rates || { CNY: 1, USD: 1 }).sort())
const source = computed(() => table.value?.source || 'fallback')
const updatedAt = computed(() => table.value?.updatedAt || '')
const sourceLabel = computed(() => ({ live: '实时汇率', cache: '使用本地缓存', fallback: '离线估算，不是实时牌价' }[source.value]))
const resultText = computed(() => {
  if (!table.value) return '—'
  try { return convertCurrency(amount.value, from.value, to.value, table.value.rates).toFixed(4) } catch { return '—' }
})

const refresh = async () => {
  table.value = await loadRates(fetch, localStorage)
}
onMounted(refresh)
</script>
