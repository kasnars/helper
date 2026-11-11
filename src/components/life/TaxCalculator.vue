<template>
  <div class="space-y-4" data-testid="tax-tool">
    <div class="grid gap-3 md:grid-cols-2">
      <label class="text-sm text-gray-500">月收入（税前）<el-input-number v-model="form.monthlySalary" :min="0" class="w-full" data-testid="tax-salary" /></label>
      <label class="text-sm text-gray-500">发放到第几个月<el-input-number v-model="form.months" :min="1" :max="12" /></label>
      <label class="text-sm text-gray-500">月社保公积金个人部分<el-input-number v-model="form.monthlyInsurance" :min="0" class="w-full" /></label>
      <label class="text-sm text-gray-500">月专项附加扣除<el-input-number v-model="form.monthlySpecial" :min="0" class="w-full" /></label>
      <label class="text-sm text-gray-500">月其他扣除<el-input-number v-model="form.monthlyOther" :min="0" class="w-full" /></label>
    </div>
    <el-button type="primary" data-testid="tax-calc" @click="calculate">计算</el-button>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <div v-if="current" class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/30"><div class="text-xs text-gray-500">当月应预扣</div><div class="text-2xl font-semibold text-blue-600">{{ current.taxThisMonth.toFixed(2) }}</div></div>
      <div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"><div class="text-xs text-gray-500">累计应纳税所得额</div><div class="text-2xl font-semibold">{{ current.taxable.toFixed(2) }}</div></div>
      <div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"><div class="text-xs text-gray-500">适用税率</div><div class="text-2xl font-semibold">{{ (current.rate * 100).toFixed(0) }}%</div></div>
    </div>
    <p class="text-sm text-gray-500">按工资薪金累计预扣法估算：每月减除 5000 元，假设各月收入和扣除相同。结果仅供对照工资条，不构成纳税建议。</p>
    <el-table v-if="rows.length" :data="rows" size="small" max-height="360">
      <el-table-column prop="month" label="月" width="60" />
      <el-table-column prop="taxable" label="累计应纳税所得额" />
      <el-table-column label="税率"><template #default="{ row }">{{ (row.rate * 100).toFixed(0) }}%</template></el-table-column>
      <el-table-column prop="cumulativeTax" label="累计税额" />
      <el-table-column prop="taxThisMonth" label="本月应扣" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { withholdingSchedule, type TaxMonth } from '@/lib/tax'

const form = reactive({ monthlySalary: 15000, months: 1, monthlyInsurance: 2000, monthlySpecial: 0, monthlyOther: 0 })
const rows = ref<TaxMonth[]>([])
const current = ref<TaxMonth | null>(null)
const error = ref('')

const calculate = () => {
  try {
    const result = withholdingSchedule(form)
    rows.value = result.rows
    current.value = result.current
    error.value = ''
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '计算失败'
  }
}
calculate()
</script>
