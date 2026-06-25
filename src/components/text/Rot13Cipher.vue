<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">ROT13 / 凯撒密码</h2>

    <!-- 偏移量控制 -->
    <div class="flex items-center gap-4 mb-4">
      <span class="text-sm text-gray-600 dark:text-gray-400">偏移量:</span>
      <el-slider v-model="shift" :min="1" :max="25" :step="1" class="w-64" />
      <span class="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
        {{ shift }}
      </span>
      <el-button size="small" @click="shift = 13" plain>ROT13</el-button>
    </div>

    <!-- 输入输出 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">原文</span>
          <el-button size="small" text @click="copyText(inputText)">复制</el-button>
        </div>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="8"
          placeholder="输入要加密/解密的文本"
        />
      </div>
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">密文</span>
          <div class="flex gap-1">
            <el-button size="small" text @click="copyText(outputText)">复制</el-button>
            <el-button size="small" text @click="swap">交换</el-button>
          </div>
        </div>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="8"
          placeholder="密文结果"
          readonly
        />
      </div>
    </div>

    <!-- 字母映射表 -->
    <div class="mt-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">字母映射</h3>
      <div class="flex flex-wrap gap-1">
        <div
          v-for="item in mappingTable"
          :key="item.from"
          class="w-10 h-10 flex flex-col items-center justify-center rounded text-xs font-mono"
          :class="item.from === item.to
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'"
        >
          <span class="font-bold">{{ item.from }}</span>
          <span class="text-[10px]">↓</span>
          <span>{{ item.to }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard } from '@/utils/clipboard'
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const shift = ref(13)
const inputText = ref('')

const caesarEncrypt = (text: string, s: number): string => {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97
    return String.fromCharCode(((char.charCodeAt(0) - base + s) % 26) + base)
  })
}

const outputText = computed(() => {
  if (!inputText.value) return ''
  return caesarEncrypt(inputText.value, shift.value)
})

const mappingTable = computed(() => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  return alphabet.map((ch) => ({
    from: ch,
    to: String.fromCharCode(((ch.charCodeAt(0) - 65 + shift.value) % 26) + 65),
  }))
})

const swap = () => {
  inputText.value = outputText.value
}

const copyText = async (text: string) => {
  if (!text) return
  try {
    await copyToClipboard(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>
