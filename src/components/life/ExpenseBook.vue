<template>
  <div class="space-y-5" data-testid="expense-tool">
    <div class="grid gap-3 md:grid-cols-4">
      <el-input-number v-model="draft.amount" :min="0.01" :precision="2" class="w-full" data-testid="expense-amount" />
      <el-select v-model="draft.category">
        <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
      </el-select>
      <el-date-picker v-model="draft.date" type="date" value-format="YYYY-MM-DD" class="w-full" />
      <el-input v-model="draft.note" placeholder="备注" />
    </div>
    <div class="flex flex-wrap gap-2">
      <el-button type="primary" data-testid="expense-add" @click="add">记一笔</el-button>
      <el-button @click="download">导出 CSV</el-button>
      <el-upload :auto-upload="false" :show-file-list="false" accept=".csv,text/csv" :on-change="importCsv">
        <el-button>导入 CSV</el-button>
      </el-upload>
    </div>
    <p v-if="message" class="text-sm text-red-500">{{ message }}</p>
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">分类汇总 · {{ total.toFixed(2) }}</h3>
        <div v-for="item in summary" :key="item.category" class="mb-2">
          <div class="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>{{ item.category }}</span><span>{{ item.amount.toFixed(2) }}</span></div>
          <div class="h-2 rounded bg-gray-100 dark:bg-gray-900"><div class="h-2 rounded bg-emerald-500" :style="{ width: `${item.ratio}%` }" /></div>
        </div>
      </div>
      <el-table :data="rows" size="small" max-height="320">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="category" label="分类" width="90" />
        <el-table-column prop="amount" label="金额" width="90" />
        <el-table-column prop="note" label="备注" />
        <el-table-column label="" width="70">
          <template #default="{ row }"><el-button link type="danger" @click="remove(row.id)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Expense { id: string; amount: number; category: string; note: string; date: string }
const KEY = 'helper_expenses'
const categories = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '其他']
const rows = ref<Expense[]>([])
const message = ref('')
const draft = reactive({ amount: 20, category: '餐饮', note: '', date: new Date().toISOString().slice(0, 10) })

const total = computed(() => rows.value.reduce((sum, row) => sum + row.amount, 0))
const summary = computed(() => categories.map((category) => {
  const amount = rows.value.filter((row) => row.category === category).reduce((sum, row) => sum + row.amount, 0)
  return { category, amount, ratio: total.value ? (amount / total.value) * 100 : 0 }
}).filter((item) => item.amount > 0))

const save = () => localStorage.setItem(KEY, JSON.stringify(rows.value))
const add = () => {
  if (draft.amount <= 0) {
    message.value = '金额必须大于 0'
    return
  }
  rows.value.unshift({ id: crypto.randomUUID(), amount: draft.amount, category: draft.category, note: draft.note, date: draft.date })
  draft.note = ''
  message.value = ''
  save()
}
const remove = (id: string) => {
  rows.value = rows.value.filter((row) => row.id !== id)
  save()
}
const download = () => {
  const lines = ['date,category,amount,note', ...rows.value.map((row) => `${row.date},${row.category},${row.amount},"${row.note.replace(/"/g, '""')}"`)]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'expenses.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
const importCsv = (file: { raw?: File }) => {
  const raw = file.raw
  if (!raw) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '')
    const next: Expense[] = []
    for (const line of text.split(/\r?\n/).slice(1)) {
      if (!line.trim()) continue
      const [date, category, amount, ...note] = line.split(',')
      const value = Number(amount)
      if (!date || !category || !Number.isFinite(value)) {
        message.value = 'CSV 需要 date,category,amount,note'
        return
      }
      next.push({ id: crypto.randomUUID(), date, category, amount: value, note: note.join(',').replace(/^"|"$/g, '') })
    }
    rows.value = next
    message.value = ''
    save()
    ElMessage.success(`已导入 ${next.length} 条`)
  }
  reader.readAsText(raw)
}
onMounted(() => {
  try { rows.value = JSON.parse(localStorage.getItem(KEY) || '[]') } catch { rows.value = [] }
})
</script>
