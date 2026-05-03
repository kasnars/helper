<template>
  <div class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Input -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">JWT Token</h3>
        
        <el-input
          v-model="jwtToken"
          type="textarea"
          :rows="8"
          placeholder="输入 JWT Token..."
          @input="decodeJWT"
        />

        <div class="mt-4">
          <el-button type="primary" class="w-full" @click="decodeJWT" :disabled="!jwtToken">
            解码 Token
          </el-button>
        </div>

        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <strong>提示：</strong>JWT (JSON Web Token) 是一种开放标准，用于在各方之间安全地传输信息。
          </p>
        </div>
      </div>

      <!-- Result -->
      <div class="space-y-4">
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Header（头部）</h3>
            <el-tag v-if="decoded.header" size="small" type="info">Base64</el-tag>
          </div>
          <pre v-if="decoded.header" class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm overflow-x-auto">{{ decoded.header }}</pre>
          <p v-else class="text-gray-400 text-sm">等待输入...</p>
        </div>

        <!-- Payload -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Payload（载荷）</h3>
            <el-tag v-if="decoded.payload" size="small" type="success">Base64</el-tag>
          </div>
          <pre v-if="decoded.payload" class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm overflow-x-auto">{{ decoded.payload }}</pre>
          <p v-else class="text-gray-400 text-sm">等待输入...</p>
          
          <!-- Registered Claims -->
          <div v-if="decoded.claims.length > 0" class="mt-4 space-y-2">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">标准声明：</h4>
            <div v-for="claim in decoded.claims" :key="claim.name" class="flex items-start gap-2 text-sm">
              <el-tag size="small">{{ claim.name }}</el-tag>
              <span class="text-gray-600 dark:text-gray-400">{{ claim.value }}</span>
            </div>
          </div>
        </div>

        <!-- Signature -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Signature（签名）</h3>
            <el-tag v-if="decoded.signature" size="small" type="warning">HMAC/RSASSA</el-tag>
          </div>
          <p v-if="decoded.signature" class="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
            {{ decoded.signature }}
          </p>
          <p v-else class="text-gray-400 text-sm">等待输入...</p>
        </div>
      </div>
    </div>

    <!-- Token Info -->
    <div v-if="decoded.isValid !== null" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Token 信息</h3>
      
      <div class="grid sm:grid-cols-3 gap-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-sm text-gray-500 dark:text-gray-400">是否有效</p>
          <el-tag :type="decoded.isValid ? 'success' : 'danger'" class="mt-2">
            {{ decoded.isValid ? '有效' : '无效' }}
          </el-tag>
        </div>
        
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-sm text-gray-500 dark:text-gray-400">签名算法</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white mt-2">{{ decoded.algorithm || '-' }}</p>
        </div>
        
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-sm text-gray-500 dark:text-gray-400">令牌类型</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white mt-2">{{ decoded.tokenType || '-' }}</p>
        </div>
      </div>

      <!-- Expiration Info -->
      <div v-if="decoded.expiration" class="mt-4 p-4" :class="decoded.isExpired ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'">
        <p class="text-sm" :class="decoded.isExpired ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'">
          <strong>{{ decoded.isExpired ? '已过期' : '未过期' }}</strong>
          <span class="ml-2">过期时间：{{ decoded.expiration }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const jwtToken = ref('')
const decoded = ref<{
  header: string
  payload: string
  signature: string
  isValid: boolean | null
  algorithm: string
  tokenType: string
  claims: Array<{ name: string; value: string }>
  expiration: string
  isExpired: boolean
}>({
  header: '',
  payload: '',
  signature: '',
  isValid: null,
  algorithm: '',
  tokenType: '',
  claims: [],
  expiration: '',
  isExpired: false,
})

const decodeBase64 = (str: string): string => {
  try {
    // Add padding if necessary
    const padding = '='.repeat((4 - (str.length % 4)) % 4)
    const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/')
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    return ''
  }
}

const formatJSON = (str: string): string => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

const decodeJWT = () => {
  if (!jwtToken.value) {
    decoded.value = {
      header: '',
      payload: '',
      signature: '',
      isValid: null,
      algorithm: '',
      tokenType: '',
      claims: [],
      expiration: '',
      isExpired: false,
    }
    return
  }

  const parts = jwtToken.value.trim().split('.')
  
  if (parts.length !== 3) {
    decoded.value = {
      header: '',
      payload: '',
      signature: '',
      isValid: false,
      algorithm: '',
      tokenType: '',
      claims: [],
      expiration: '',
      isExpired: false,
    }
    return
  }

  try {
    const header = formatJSON(decodeBase64(parts[0]))
    const payload = formatJSON(decodeBase64(parts[1]))
    const signature = parts[2]

    const headerObj = JSON.parse(decodeBase64(parts[0]))
    const payloadObj = JSON.parse(decodeBase64(parts[1]))

    // Extract claims
    const claims: Array<{ name: string; value: string }> = []
    const claimNames: Record<string, string> = {
      iss: '签发者',
      sub: '主题',
      aud: '受众',
      exp: '过期时间',
      nbf: '生效时间',
      iat: '签发时间',
      jti: 'JWT ID',
    }

    for (const [key, label] of Object.entries(claimNames)) {
      if (payloadObj[key]) {
        let value = payloadObj[key]
        if (key === 'exp' || key === 'nbf' || key === 'iat') {
          value = new Date(value * 1000).toLocaleString('zh-CN')
        }
        claims.push({ name: `${key} (${label})`, value })
      }
    }

    // Check expiration
    let expiration = ''
    let isExpired = false
    if (payloadObj.exp) {
      const expDate = new Date(payloadObj.exp * 1000)
      expiration = expDate.toLocaleString('zh-CN')
      isExpired = Date.now() > payloadObj.exp * 1000
    }

    decoded.value = {
      header,
      payload,
      signature,
      isValid: true,
      algorithm: headerObj.alg || '-',
      tokenType: headerObj.typ || '-',
      claims,
      expiration,
      isExpired,
    }
  } catch {
    decoded.value = {
      header: '',
      payload: '',
      signature: '',
      isValid: false,
      algorithm: '',
      tokenType: '',
      claims: [],
      expiration: '',
      isExpired: false,
    }
  }
}
</script>
