<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">密码强度检测</h2>

    <!-- 输入 -->
    <div class="mb-4">
      <el-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="输入要检测的密码"
        size="large"
        clearable
      >
        <template #append>
          <el-button @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 强度条 -->
    <div v-if="password" class="mb-4">
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm font-medium" :class="strengthColor">{{ strengthLabel }}</span>
        <span class="text-sm text-gray-500">{{ score }}/100</span>
      </div>
      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="strengthBarClass"
          :style="{ width: score + '%' }"
        />
      </div>
    </div>

    <!-- 详细分析 -->
    <div v-if="password" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">密码长度</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ password.length }} <span class="text-sm font-normal text-gray-500">位</span></div>
      </div>
      <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">信息熵</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ entropy.toFixed(1) }} <span class="text-sm font-normal text-gray-500">bits</span></div>
      </div>
      <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">字符空间</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ charsetSize }} <span class="text-sm font-normal text-gray-500">种</span></div>
      </div>
      <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">暴力破解时间</div>
        <div class="text-lg font-bold" :class="strengthColor">{{ crackTime }}</div>
      </div>
    </div>

    <!-- 字符组成 -->
    <div v-if="password" class="mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">字符组成</h3>
      <div class="flex flex-wrap gap-2">
        <el-tag v-for="item in charsetBreakdown" :key="item.label" :type="item.active ? 'primary' : 'info'" size="small">
          {{ item.icon }} {{ item.label }}: {{ item.count }}个
        </el-tag>
      </div>
    </div>

    <!-- 改进建议 -->
    <div v-if="password && suggestions.length" class="mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">改进建议</h3>
      <ul class="space-y-1">
        <li
          v-for="(s, i) in suggestions"
          :key="i"
          class="text-sm flex items-start gap-2"
          :class="s.ok ? 'text-green-600 dark:text-green-400' : 'text-orange-500'"
        >
          <span>{{ s.ok ? '✅' : '⚠️' }}</span>
          <span>{{ s.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const password = ref('')
const showPassword = ref(false)

const charsetSize = computed(() => {
  let size = 0
  if (/[a-z]/.test(password.value)) size += 26
  if (/[A-Z]/.test(password.value)) size += 26
  if (/[0-9]/.test(password.value)) size += 10
  if (/[^a-zA-Z0-9]/.test(password.value)) size += 33
  return size
})

const entropy = computed(() => {
  if (!password.value) return 0
  return password.value.length * Math.log2(charsetSize.value || 1)
})

const score = computed(() => {
  if (!password.value) return 0
  let s = 0
  const len = password.value.length

  // 长度分 (max 30)
  s += Math.min(len * 3, 30)

  // 字符种类分 (max 30)
  const hasLower = /[a-z]/.test(password.value)
  const hasUpper = /[A-Z]/.test(password.value)
  const hasDigit = /[0-9]/.test(password.value)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password.value)
  const kinds = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
  s += kinds * 7.5

  // 熵分 (max 30)
  s += Math.min(entropy.value / 4, 30)

  // 多样性奖励 (max 10)
  if (len >= 12 && kinds >= 3) s += 10
  else if (len >= 8 && kinds >= 2) s += 5

  // 惩罚
  // 连续字符
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password.value)) {
    s -= 10
  }
  // 重复字符
  if (/(.)\1{2,}/.test(password.value)) {
    s -= 10
  }

  return Math.max(0, Math.min(100, Math.round(s)))
})

const strengthLabel = computed(() => {
  if (score.value < 20) return '非常弱'
  if (score.value < 40) return '弱'
  if (score.value < 60) return '一般'
  if (score.value < 80) return '强'
  return '非常强'
})

const strengthColor = computed(() => {
  if (score.value < 20) return 'text-red-600'
  if (score.value < 40) return 'text-orange-500'
  if (score.value < 60) return 'text-yellow-500'
  if (score.value < 80) return 'text-green-500'
  return 'text-green-600'
})

const strengthBarClass = computed(() => {
  if (score.value < 20) return 'bg-red-500'
  if (score.value < 40) return 'bg-orange-500'
  if (score.value < 60) return 'bg-yellow-500'
  if (score.value < 80) return 'bg-green-500'
  return 'bg-green-600'
})

// 假设 10 亿次/秒的破解速度
const crackTime = computed(() => {
  if (!password.value) return '-'
  const combinations = Math.pow(charsetSize.value, password.value.length)
  const seconds = combinations / 1e9

  if (seconds < 1) return '瞬间破解'
  if (seconds < 60) return `${Math.round(seconds)} 秒`
  if (seconds < 3600) return `${Math.round(seconds / 60)} 分钟`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} 小时`
  if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} 天`
  if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} 年`
  if (seconds < 86400 * 365 * 1e6) return `${Math.round(seconds / (86400 * 365 * 1000))} 千年`
  if (seconds < 86400 * 365 * 1e9) return `${Math.round(seconds / (86400 * 365 * 1e6))} 百万年`
  return `${(seconds / (86400 * 365 * 1e9)).toFixed(0)} 十亿年+`
})

const charsetBreakdown = computed(() => {
  const p = password.value
  return [
    { label: '小写字母', icon: 'a-z', active: /[a-z]/.test(p), count: (p.match(/[a-z]/g) || []).length },
    { label: '大写字母', icon: 'A-Z', active: /[A-Z]/.test(p), count: (p.match(/[A-Z]/g) || []).length },
    { label: '数字', icon: '0-9', active: /[0-9]/.test(p), count: (p.match(/[0-9]/g) || []).length },
    { label: '特殊字符', icon: '!@#', active: /[^a-zA-Z0-9]/.test(p), count: (p.match(/[^a-zA-Z0-9]/g) || []).length },
  ]
})

const suggestions = computed(() => {
  const p = password.value
  const list = [
    { ok: p.length >= 8, text: '密码长度至少 8 位' },
    { ok: p.length >= 12, text: '建议密码长度 12 位以上' },
    { ok: /[a-z]/.test(p), text: '包含小写字母' },
    { ok: /[A-Z]/.test(p), text: '包含大写字母' },
    { ok: /[0-9]/.test(p), text: '包含数字' },
    { ok: /[^a-zA-Z0-9]/.test(p), text: '包含特殊字符（如 !@#$%）' },
    { ok: !/(.)\1{2,}/.test(p), text: '避免连续重复字符（如 aaa、111）' },
    { ok: !/(?:abc|bcd|cde|123|234|345|qwe|wer)/i.test(p), text: '避免连续或常见键盘序列' },
  ]
  return list
})
</script>
