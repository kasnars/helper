<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">TOTP 动态验证码生成器</h2>

    <!-- 输入密钥 -->
    <div class="mb-4">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
        Base32 密钥
      </label>
      <el-input
        v-model="secret"
        placeholder="输入 Base32 编码的密钥（如 JBSWY3DPEHPK3PXP）"
        clearable
        @input="onSecretChange"
      >
        <template #append>
          <el-button @click="generateRandom">随机生成</el-button>
        </template>
      </el-input>
      <p class="text-xs text-gray-400 mt-1">
        支持 Google Authenticator、Microsoft Authenticator 等标准 TOTP
      </p>
    </div>

    <!-- 参数设置 -->
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">位数:</span>
        <el-radio-group v-model="digits" size="small">
          <el-radio-button :label="6">6位</el-radio-button>
          <el-radio-button :label="8">8位</el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">算法:</span>
        <el-radio-group v-model="algorithm" size="small">
          <el-radio-button label="SHA-1">SHA-1</el-radio-button>
          <el-radio-button label="SHA-256">SHA-256</el-radio-button>
          <el-radio-button label="SHA-512">SHA-512</el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">周期:</span>
        <el-radio-group v-model="period" size="small">
          <el-radio-button :label="30">30秒</el-radio-button>
          <el-radio-button :label="60">60秒</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 验证码显示 -->
    <div v-if="secret && isValidSecret" class="text-center mb-6">
      <div class="inline-block p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">当前验证码</div>
        <div class="text-5xl font-mono font-bold tracking-[0.3em] text-gray-900 dark:text-white">
          {{ otpCode }}
        </div>
        <div class="mt-4 flex items-center justify-center gap-2">
          <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-1000"
              :class="remaining <= 5 ? 'bg-red-500' : 'bg-blue-500'"
              :style="{ width: (remaining / period * 100) + '%' }"
            />
          </div>
          <span class="text-sm font-mono" :class="remaining <= 5 ? 'text-red-500' : 'text-gray-500'">
            {{ remaining }}s
          </span>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="secret && !isValidSecret" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
      ⚠️ 密钥格式无效，请输入有效的 Base32 字符串（A-Z, 2-7）
    </div>

    <!-- 使用说明 -->
    <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">使用说明</h3>
      <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <li>• 从需要启用两步验证的服务获取 Base32 密钥</li>
        <li>• 密钥通常在二维码的 otpauth:// URI 中</li>
        <li>• 生成的验证码与 Google Authenticator 完全兼容</li>
        <li>• 验证码每 30 秒自动刷新，基于当前时间计算</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const secret = ref('')
const digits = ref(6)
const algorithm = ref('SHA-1')
const period = ref(30)
const otpCode = ref('------')
const remaining = ref(30)
let timer: ReturnType<typeof setInterval> | null = null

const isValidSecret = computed(() => {
  if (!secret.value) return false
  return /^[A-Z2-7]+=*$/i.test(secret.value.replace(/\s/g, ''))
})

const base32Decode = (input: string): Uint8Array<ArrayBuffer> => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleaned = input.replace(/\s/g, '').replace(/=+$/, '').toUpperCase()
  let bits = ''
  for (const ch of cleaned) {
    const val = alphabet.indexOf(ch)
    if (val === -1) continue
    bits += val.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2))
  }
  return new Uint8Array(bytes) as Uint8Array<ArrayBuffer>
}

const intToBytes = (num: number): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(8) as Uint8Array<ArrayBuffer>
  for (let i = 7; i >= 0; i--) {
    bytes[i] = num & 0xff
    num = Math.floor(num / 256)
  }
  return bytes
}

const hmacSign = async (key: Uint8Array<ArrayBuffer>, message: Uint8Array<ArrayBuffer>, alg: string): Promise<ArrayBuffer> => {
  const algoMap: Record<string, string> = {
    'SHA-1': 'SHA-1',
    'SHA-256': 'SHA-256',
    'SHA-512': 'SHA-512',
  }
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: algoMap[alg] },
    false,
    ['sign']
  )
  return crypto.subtle.sign('HMAC', cryptoKey, message)
}

const generateTOTP = async () => {
  if (!isValidSecret.value) {
    otpCode.value = '-'.repeat(digits.value)
    return
  }

  const key = base32Decode(secret.value)
  const time = Math.floor(Date.now() / 1000)
  const counter = Math.floor(time / period.value)
  const counterBytes = intToBytes(counter)

  const hmac = await hmacSign(key, counterBytes, algorithm.value)
  const hash = new Uint8Array(hmac)
  const offset = hash[hash.length - 1] & 0x0f
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)

  const otp = code % Math.pow(10, digits.value)
  otpCode.value = otp.toString().padStart(digits.value, '0')
}

const updateRemaining = () => {
  const now = Math.floor(Date.now() / 1000)
  remaining.value = period.value - (now % period.value)
}

const startTimer = () => {
  stopTimer()
  updateRemaining()
  generateTOTP()
  timer = setInterval(() => {
    updateRemaining()
    if (remaining.value === period.value) {
      generateTOTP()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const onSecretChange = () => {
  if (isValidSecret.value) {
    startTimer()
  } else {
    stopTimer()
    otpCode.value = '-'.repeat(digits.value)
  }
}

const generateRandom = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  secret.value = result
  onSecretChange()
}

onMounted(() => {
  if (isValidSecret.value) startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>
