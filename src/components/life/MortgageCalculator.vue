<template>
  <div class="space-y-4" data-testid="mortgage-tool">
    <div class="grid gap-3 md:grid-cols-2">
      <label class="text-sm text-gray-500">贷款本金（元）<el-input-number v-model="principal" :min="1" :step="10000" class="w-full" data-testid="mortgage-principal" /></label>
      <label class="text-sm text-gray-500">年利率（%）<el-input-number v-model="rate" :min="0" :step="0.1" :precision="3" class="w-full" /></label>
      <label class="text-sm text-gray-500">期数（月）<el-input-number v-model="months" :min="1" :max="360" class="w-full" /></label>
      <el-radio-group v-model="type" class="self-end">
        <el-radio-button value="installment">等额本息</el-radio-button>
        <el-radio-button value="principal">等额本金</el-radio-button>
      </el-radio-group>
    </div>
    <el-button type="primary" data-testid="mortgage-calc" @click="calculate">计算还款计划</el-button>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <div v-if="result" class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"><div class="text-xs text-gray-500">首月月供</div><div class="text-2xl font-semibold">{{ result.rows[0].payment.toFixed(2) }}</div></div>
      <div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"><div class="text-xs text-gray-500">支付利息</div><div class="text-2xl font-semibold">{{ result.totalInterest.toFixed(2) }}</div></div>
      <div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"><div class="text-xs text-gray-500">还款总额</div><div class="text-2xl font-semibold">{{ result.totalPayment.toFixed(2) }}</div></div>
    </div>
    <el-table v-if="result" :data="result.rows" size="small" max-height="420">
      <el-table-column prop="period" label="期数" width="70" />
      <el-table-column prop="payment" label="月供" />
      <el-table-column prop="principal" label="本金" />
      <el-table-column prop="interest" label="利息" />
      <el-table-column prop="remaining" label="剩余本金" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mortgageSchedule, type MortgageResult, type MortgageType } from '@/lib/mortgage'

const principal = ref(1000000)
const rate = ref(3.6)
const months = ref(360)
const type = ref<MortgageType>('installment')
const result = ref<MortgageResult | null>(null)
const error = ref('')

const calculate = () => {
  try {
    result.value = mortgageSchedule(principal.value, rate.value, months.value, type.value)
    error.value = ''
  } catch (reason) {
    result.value = null
    error.value = reason instanceof Error ? reason.message : '计算失败'
  }
}
calculate()
</script>
