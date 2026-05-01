<template>
  <div class="space-y-6">
    <!-- Number Base Converter -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">进制转换器</h3>
      <div class="space-y-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">输入数值</label>
          <el-input
            v-model="inputValue"
            placeholder="输入数值..."
            @input="convert"
            @keyup.enter="convert"
          />
        </div>
        
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">输入进制</label>
          <el-select v-model="inputBase" @change="convert" class="w-full">
            <el-option label="二进制 (Base 2)" :value="2" />
            <el-option label="八进制 (Base 8)" :value="8" />
            <el-option label="十进制 (Base 10)" :value="10" />
            <el-option label="十六进制 (Base 16)" :value="16" />
            <el-option label="三十二进制 (Base 32)" :value="32" />
            <el-option label="六十四进制 (Base 64)" :value="64" />
          </el-select>
        </div>

        <div v-if="results" class="space-y-3 mt-6">
          <div
            v-for="(result, baseKey) in results"
            :key="baseKey"
            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-sm text-gray-700 dark:text-gray-300">{{ getBaseLabel(Number(baseKey)) }}</span>
              <el-button size="small" @click="copyToClipboard(result)">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
            <p class="font-mono text-lg break-all text-gray-900 dark:text-white">{{ result }}</p>
          </div>
        </div>
        
        <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
      </div>
    </div>

    <!-- Quick Reference -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">常用数值对照表</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="py-2 px-4 text-left">十进制</th>
              <th class="py-2 px-4 text-left">二进制</th>
              <th class="py-2 px-4 text-left">八进制</th>
              <th class="py-2 px-4 text-left">十六进制</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="i in 256"
              :key="i - 1"
              class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30"
            >
              <td class="py-2 px-4 font-mono">{{ i - 1 }}</td>
              <td class="py-2 px-4 font-mono">{{ (i - 1).toString(2) }}</td>
              <td class="py-2 px-4 font-mono">{{ (i - 1).toString(8) }}</td>
              <td class="py-2 px-4 font-mono">{{ (i - 1).toString(16).toUpperCase() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputValue = ref('')
const inputBase = ref(10)
const results = ref<any>(null)
const error = ref('')

const convert = () => {
  error.value = ''
  results.value = null
  
  if (!inputValue.value) return
  
  try {
    // Convert input to decimal first
    const decimal = parseInt(inputValue.value, inputBase.value)
    
    if (isNaN(decimal)) {
      error.value = `无效的 ${inputBase.value} 进制数值`
      return
    }
    
    results.value = {
      2: decimal.toString(2),
      8: decimal.toString(8),
      10: decimal.toString(10),
      16: decimal.toString(16).toUpperCase(),
      32: decimal.toString(32).toUpperCase(),
      64: toBase64(decimal)
    }
  } catch (e) {
    error.value = '转换失败'
  }
}

const toBase64 = (num: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  if (num === 0) return 'A'
  
  let result = ''
  while (num > 0) {
    result = chars[num % 64] + result
    num = Math.floor(num / 64)
  }
  return result
}

const getBaseLabel = (base: number): string => {
  const labels: { [key: number]: string } = {
    2: '二进制 (Base 2)',
    8: '八进制 (Base 8)',
    10: '十进制 (Base 10)',
    16: '十六进制 (Base 16)',
    32: '三十二进制 (Base 32)',
    64: '六十四进制 (Base 64)'
  }
  return labels[base] || `Base ${base}`
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}
</script>
