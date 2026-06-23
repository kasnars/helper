<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 输入 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">💰 输入金额</h3>
        <el-input
          v-model="amountInput"
          placeholder="输入数字金额，例如：12345.67"
          size="large"
          @input="convert"
        >
          <template #prepend>¥</template>
        </el-input>
        <div class="mt-4 flex gap-2 flex-wrap">
          <el-button size="small" @click="setAmount(100)">100</el-button>
          <el-button size="small" @click="setAmount(1000)">1,000</el-button>
          <el-button size="small" @click="setAmount(12345.67)">12,345.67</el-button>
          <el-button size="small" @click="setAmount(100000000)">1亿</el-button>
          <el-button size="small" @click="setAmount(-5000)">负数</el-button>
        </div>
      </div>

      <!-- 结果 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📋 中文大写</h3>
        <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed min-h-[120px] flex items-center justify-center">
          <span v-if="result" class="text-xl font-medium text-gray-800 dark:text-gray-200 tracking-wider">
            {{ result }}
          </span>
          <span v-else class="text-gray-400">输入金额后自动转换</span>
        </div>
        <el-button v-if="result" type="primary" class="mt-3" @click="copyResult">
          <el-icon><DocumentCopy /></el-icon> 复制结果
        </el-button>
      </div>
    </div>

    <!-- 参考表 -->
    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
      <h4 class="font-medium mb-2 text-gray-700 dark:text-gray-300">📖 大写数字对照</h4>
      <div class="grid grid-cols-10 gap-2 text-sm">
        <span v-for="(item, i) in digitMap" :key="i" class="text-center p-1 bg-white dark:bg-gray-800 rounded">
          <span class="text-gray-500">{{ item.num }}</span>
          <span class="text-gray-800 dark:text-gray-200 font-medium">{{ item.zh }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const amountInput = ref('')
const result = ref('')

const digitMap = [
  { num: '0', zh: '零' },
  { num: '1', zh: '壹' },
  { num: '2', zh: '贰' },
  { num: '3', zh: '叁' },
  { num: '4', zh: '肆' },
  { num: '5', zh: '伍' },
  { num: '6', zh: '陆' },
  { num: '7', zh: '柒' },
  { num: '8', zh: '捌' },
  { num: '9', zh: '玖' },
]

const setAmount = (n: number) => {
  amountInput.value = String(n)
  convert()
}

const convert = () => {
  const input = amountInput.value.replace(/,/g, '').trim()
  if (!input || isNaN(Number(input))) {
    result.value = ''
    return
  }
  result.value = amountToChinese(Number(input))
}

const amountToChinese = (num: number): string => {
  if (num === 0) return '零元整'

  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const cnIntRadice = ['', '拾', '佰', '仟']
  const cnIntUnits = ['', '万', '亿', '兆']
  const cnDecUnits = ['角', '分']
  const cnInteger = '整'
  const cnIntLast = '元'

  let isNegative = false
  if (num < 0) {
    isNegative = true
    num = Math.abs(num)
  }

  let parts: string[] = []

  // 整数部分
  let integerNum = Math.floor(num)
  let decimalNum = Math.round((num - integerNum) * 100)

  if (integerNum > 0) {
    let zeroCount = 0
    let intLen = String(integerNum).length
    for (let i = 0; i < intLen; i++) {
      let n = String(integerNum).substring(i, i + 1)
      let p = intLen - i - 1
      let q = Math.floor(p / 4)
      let m = p % 4

      if (n === '0') {
        zeroCount++
      } else {
        if (zeroCount > 0) parts.push(cnNums[0])
        zeroCount = 0
        parts.push(cnNums[Number(n)] + cnIntRadice[m])
      }

      if (m === 0 && zeroCount < 4) {
        parts.push(cnIntUnits[q])
      }
    }
    parts.push(cnIntLast)
  }

  // 小数部分
  if (decimalNum > 0) {
    let decStr = String(decimalNum).padStart(2, '0')
    for (let i = 0; i < decStr.length; i++) {
      let n = decStr.substring(i, i + 1)
      if (n !== '0') {
        parts.push(cnNums[Number(n)] + cnDecUnits[i])
      }
    }
  } else {
    parts.push(cnInteger)
  }

  return (isNegative ? '负' : '') + parts.join('')
}

const copyResult = () => {
  navigator.clipboard.writeText(result.value)
  ElMessage.success('已复制')
}
</script>
