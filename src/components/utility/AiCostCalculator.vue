<template>
  <div class="space-y-4" data-testid="aicost-tool">
    <div class="grid gap-3 md:grid-cols-2">
      <label class="text-sm text-gray-500">输入 token<el-input-number v-model="inputTokens" :min="0" :step="1000" class="w-full" data-testid="aicost-input" /></label>
      <label class="text-sm text-gray-500">输出 token<el-input-number v-model="outputTokens" :min="0" :step="1000" class="w-full" /></label>
    </div>
    <el-table :data="ranked" size="small">
      <el-table-column prop="name" label="模型" />
      <el-table-column label="输入 / 百万">
        <template #default="{ row }"><el-input-number v-model="row.inputPerMillion" :min="0" :step="0.1" size="small" @change="persist" /></template>
      </el-table-column>
      <el-table-column label="输出 / 百万">
        <template #default="{ row }"><el-input-number v-model="row.outputPerMillion" :min="0" :step="0.1" size="small" @change="persist" /></template>
      </el-table-column>
      <el-table-column label="本次费用">
        <template #default="{ row }">{{ row.cost.toFixed(4) }}</template>
      </el-table-column>
      <el-table-column width="70">
        <template #default="{ row }"><el-button link type="danger" @click="remove(row.id)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <div class="flex flex-wrap gap-2">
      <el-input v-model="draftName" placeholder="新模型名称" class="max-w-xs" />
      <el-button data-testid="aicost-add" @click="add">添加模型</el-button>
      <el-button @click="reset">恢复默认价格</el-button>
    </div>
    <p class="text-sm text-gray-500">价格是每 100 万 token 的输入价和输出价，单位与你填写的币种一致。改完会记在这台浏览器里。</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { compareModels, DEFAULT_MODELS, type ModelPrice } from '@/lib/cost'

const KEY = 'helper_ai_prices'
const inputTokens = ref(1_000_000)
const outputTokens = ref(200_000)
const models = ref<ModelPrice[]>(DEFAULT_MODELS.map((item) => ({ ...item })))
const draftName = ref('')
const ranked = computed(() => compareModels(models.value, inputTokens.value, outputTokens.value))

const persist = () => localStorage.setItem(KEY, JSON.stringify(models.value))
const add = () => {
  if (!draftName.value.trim()) return
  models.value.push({ id: crypto.randomUUID(), name: draftName.value.trim(), inputPerMillion: 1, outputPerMillion: 1 })
  draftName.value = ''
  persist()
}
const remove = (id: string) => {
  models.value = models.value.filter((item) => item.id !== id)
  persist()
}
const reset = () => {
  models.value = DEFAULT_MODELS.map((item) => ({ ...item }))
  persist()
}
onMounted(() => {
  const raw = localStorage.getItem(KEY)
  if (!raw) return
  try {
    const parsed = JSON.parse(raw) as ModelPrice[]
    if (Array.isArray(parsed) && parsed.length) models.value = parsed
  } catch { /* 使用默认表 */ }
})
</script>
