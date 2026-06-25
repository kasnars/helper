<template>
  <div class="space-y-6">
    <!-- 密码配置 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">密码生成器</h3>
      <div class="space-y-4">
        <!-- 密码长度 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
            密码长度: <span class="font-semibold text-blue-600">{{ config.length }}</span>
          </label>
          <el-slider v-model="config.length" :min="8" :max="128" :step="1" show-input />
        </div>

        <!-- 字符类型 -->
        <div class="grid grid-cols-2 gap-4">
          <el-checkbox v-model="config.uppercase" label="大写字母 (A-Z)" />
          <el-checkbox v-model="config.lowercase" label="小写字母 (a-z)" />
          <el-checkbox v-model="config.numbers" label="数字 (0-9)" />
          <el-checkbox v-model="config.symbols" label="特殊符号 (!@#$...)" />
        </div>

        <!-- 排除易混淆字符 -->
        <el-checkbox v-model="config.excludeAmbiguous" label="排除易混淆字符 (0Ol1I)" />

        <!-- 生成数量 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">生成数量</label>
          <el-input-number v-model="config.count" :min="1" :max="20" />
        </div>

        <el-button type="primary" @click="generatePasswords" :disabled="!hasSelectedType">
          <el-icon><Refresh /></el-icon>
          生成密码
        </el-button>
      </div>
    </div>

    <!-- 生成结果 -->
    <div v-if="passwords.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">生成结果</h3>
        <el-button size="small" @click="copyAll">
          <el-icon><CopyDocument /></el-icon>
          复制全部
        </el-button>
      </div>
      <div class="space-y-3">
        <div
          v-for="(pwd, index) in passwords"
          :key="index"
          class="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
        >
          <span class="flex-1 font-mono text-sm break-all text-gray-900 dark:text-white">{{ pwd }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">{{ getStrength(pwd).label }}</span>
            <el-tag :type="getStrength(pwd).type" size="small">{{ getStrength(pwd).score }}%</el-tag>
            <el-button size="small" @click="copyToClipboard(pwd)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 密码强度说明 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">密码强度说明</h3>
      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p><span class="text-red-500">弱</span> - 少于 12 位，仅包含一种字符类型</p>
        <p><span class="text-orange-500">中</span> - 12-16 位，包含两种字符类型</p>
        <p><span class="text-green-500">强</span> - 16 位以上，包含三种以上字符类型</p>
        <p class="mt-3 text-gray-500">建议使用 16 位以上，包含大小写字母、数字和特殊符号的密码</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Refresh, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface PasswordConfig {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
  count: number
}

const config = ref<PasswordConfig>({
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
  count: 5,
})

const passwords = ref<string[]>([])

const hasSelectedType = computed(() => {
  return config.value.uppercase || config.value.lowercase || config.value.numbers || config.value.symbols
})

const generatePasswords = () => {
  const chars = getCharSet()
  if (chars.length === 0) return

  passwords.value = Array.from({ length: config.value.count }, () => generateOnePassword(chars))
}

const getCharSet = (): string => {
  let chars = ''
  const ambiguous = '0Ol1I'

  if (config.value.uppercase) {
    chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }
  if (config.value.lowercase) {
    chars += 'abcdefghijklmnopqrstuvwxyz'
  }
  if (config.value.numbers) {
    chars += '0123456789'
  }
  if (config.value.symbols) {
    chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  }

  if (config.value.excludeAmbiguous) {
    chars = chars.split('').filter(c => !ambiguous.includes(c)).join('')
  }

  return chars
}

const generateOnePassword = (chars: string): string => {
  const array = new Uint32Array(config.value.length)
  crypto.getRandomValues(array)
  return Array.from(array, (num) => chars[num % chars.length]).join('')
}

const getStrength = (password: string): { score: number; label: string; type: 'danger' | 'warning' | 'success' } => {
  let score = 0
  const len = password.length

  // 长度得分
  if (len >= 8) score += 20
  if (len >= 12) score += 20
  if (len >= 16) score += 10
  if (len >= 20) score += 10

  // 字符类型得分
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^a-zA-Z0-9]/.test(password)) score += 10

  if (score < 40) return { score, label: '弱', type: 'danger' }
  if (score < 70) return { score, label: '中', type: 'warning' }
  return { score: Math.min(score, 100), label: '强', type: 'success' }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

const copyAll = () => {
  copyToClipboard(passwords.value.join('\n'))
  ElMessage.success('已复制全部密码')
}
</script>
