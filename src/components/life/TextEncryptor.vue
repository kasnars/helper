<template>
  <div class="space-y-6">
    <!-- 加密 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">文本加密</h3>
      <div class="space-y-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">待加密文本</label>
          <el-input
            v-model="encryptInput.text"
            type="textarea"
            :rows="4"
            placeholder="输入要加密的文本..."
          />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">加密密码</label>
          <el-input
            v-model="encryptInput.password"
            type="password"
            show-password
            placeholder="输入加密密码..."
          />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">输出格式</label>
          <el-radio-group v-model="encryptInput.format">
            <el-radio value="base64">Base64</el-radio>
            <el-radio value="hex">Hex</el-radio>
          </el-radio-group>
        </div>
        <el-button type="primary" @click="handleEncrypt" :disabled="!encryptInput.text || !encryptInput.password">
          <el-icon><Lock /></el-icon>
          加密
        </el-button>
        <div v-if="encryptResult" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">加密结果</span>
            <el-button size="small" @click="copyToClipboard(encryptResult)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
          <p class="font-mono text-xs break-all text-gray-900 dark:text-white">{{ encryptResult }}</p>
        </div>
      </div>
    </div>

    <!-- 解密 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">文本解密</h3>
      <div class="space-y-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">待解密文本</label>
          <el-input
            v-model="decryptInput.text"
            type="textarea"
            :rows="4"
            placeholder="输入要解密的文本..."
          />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">解密密码</label>
          <el-input
            v-model="decryptInput.password"
            type="password"
            show-password
            placeholder="输入解密密码..."
          />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">输入格式</label>
          <el-radio-group v-model="decryptInput.format">
            <el-radio value="base64">Base64</el-radio>
            <el-radio value="hex">Hex</el-radio>
          </el-radio-group>
        </div>
        <el-button type="primary" @click="handleDecrypt" :disabled="!decryptInput.text || !decryptInput.password">
          <el-icon><Unlock /></el-icon>
          解密
        </el-button>
        <div v-if="decryptResult" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">解密结果</span>
            <el-button size="small" @click="copyToClipboard(decryptResult)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
          <p class="text-sm break-all text-gray-900 dark:text-white">{{ decryptResult }}</p>
        </div>
      </div>
    </div>

    <!-- 说明 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">加密算法说明</h3>
      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>• 使用 <strong>AES-GCM</strong> 算法进行加密，这是一种安全的对称加密算法</p>
        <p>• 每次加密会生成随机的 IV（初始化向量），因此相同文本加密结果不同</p>
        <p>• 加密和解密必须使用相同的密码</p>
        <p>• 所有操作在浏览器本地完成，数据不会上传到服务器</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Unlock, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface EncryptInput {
  text: string
  password: string
  format: 'base64' | 'hex'
}

const encryptInput = ref<EncryptInput>({
  text: '',
  password: '',
  format: 'base64',
})

const decryptInput = ref<EncryptInput>({
  text: '',
  password: '',
  format: 'base64',
})

const encryptResult = ref('')
const decryptResult = ref('')

const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

const handleEncrypt = async () => {
  try {
    const encoder = new TextEncoder()
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const key = await deriveKey(encryptInput.value.password, salt)
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(encryptInput.value.text)
    )

    // 合并 salt + iv + encrypted
    const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(encrypted).length)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encrypted), salt.length + iv.length)

    if (encryptInput.value.format === 'base64') {
      encryptResult.value = btoa(String.fromCharCode(...combined))
    } else {
      encryptResult.value = Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join('')
    }

    ElMessage.success('加密成功')
  } catch (e) {
    ElMessage.error('加密失败: ' + (e as Error).message)
  }
}

const handleDecrypt = async () => {
  try {
    let combined: Uint8Array

    if (decryptInput.value.format === 'base64') {
      const binary = atob(decryptInput.value.text)
      combined = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        combined[i] = binary.charCodeAt(i)
      }
    } else {
      const hex = decryptInput.value.text
      combined = new Uint8Array(hex.length / 2)
      for (let i = 0; i < hex.length; i += 2) {
        combined[i / 2] = parseInt(hex.substring(i, i + 2), 16)
      }
    }

    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 28)
    const data = combined.slice(28)

    const key = await deriveKey(decryptInput.value.password, salt)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    decryptResult.value = new TextDecoder().decode(decrypted)
    ElMessage.success('解密成功')
  } catch (e) {
    ElMessage.error('解密失败，请检查密码和密文是否正确')
    decryptResult.value = ''
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}
</script>
