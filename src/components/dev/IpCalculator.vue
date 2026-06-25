<template>
  <div class="space-y-6">
    <!-- Input -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">IP 地址计算器</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">IP 地址</label>
          <el-input v-model="ipInput" placeholder="如: 192.168.1.100" @input="calculate" />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">CIDR 前缀 / 子网掩码</label>
          <div class="flex gap-2">
            <el-select v-model="cidrMode" style="width: 120px">
              <el-option label="CIDR" value="cidr" />
              <el-option label="子网掩码" value="mask" />
            </el-select>
            <el-input v-if="cidrMode === 'cidr'" v-model="cidrInput" placeholder="如: 24" @input="calculate" />
            <el-input v-else v-model="maskInput" placeholder="如: 255.255.255.0" @input="calculate" />
          </div>
        </div>
      </div>
      <!-- Quick presets -->
      <div class="mt-4 flex flex-wrap gap-2">
        <el-button size="small" @click="applyPreset('192.168.1.0/24')">192.168.1.0/24</el-button>
        <el-button size="small" @click="applyPreset('10.0.0.0/8')">10.0.0.0/8</el-button>
        <el-button size="small" @click="applyPreset('172.16.0.0/12')">172.16.0.0/12</el-button>
        <el-button size="small" @click="applyPreset('192.168.0.0/16')">192.168.0.0/16</el-button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="space-y-4">
      <!-- Network Info -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">网络信息</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">网络地址:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono font-semibold text-gray-900 dark:text-white">{{ result.network }}</span>
                <el-button size="small" link @click="copy(result.network)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">广播地址:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono font-semibold text-gray-900 dark:text-white">{{ result.broadcast }}</span>
                <el-button size="small" link @click="copy(result.broadcast)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">子网掩码:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono font-semibold text-gray-900 dark:text-white">{{ result.mask }}</span>
                <el-button size="small" link @click="copy(result.mask)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">CIDR:</span>
              <span class="font-mono font-semibold text-gray-900 dark:text-white">/{{ result.cidr }}</span>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">可用主机范围:</span>
              <span class="font-mono text-sm text-gray-900 dark:text-white">{{ result.firstHost }} - {{ result.lastHost }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">可用主机数:</span>
              <span class="font-mono font-semibold text-gray-900 dark:text-white">{{ result.hostCount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">IP 类型:</span>
              <el-tag :type="result.isPrivate ? 'success' : 'info'" size="small">
                {{ result.isPrivate ? '私有地址' : '公有地址' }}
              </el-tag>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">地址类别:</span>
              <span class="font-mono text-gray-900 dark:text-white">{{ result.ipClass }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Binary Representation -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">二进制表示</h3>
        <div class="space-y-2 font-mono text-sm">
          <div class="flex items-center gap-2">
            <span class="text-gray-500 dark:text-gray-400 w-20">IP:</span>
            <span class="text-gray-900 dark:text-white">{{ result.ipBinary }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500 dark:text-gray-400 w-20">掩码:</span>
            <span class="text-gray-900 dark:text-white">{{ result.maskBinary }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500 dark:text-gray-400 w-20">网络:</span>
            <span class="text-green-600 dark:text-green-400">{{ result.networkBinary }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500 dark:text-gray-400 w-20">主机:</span>
            <span class="text-blue-600 dark:text-blue-400">{{ result.hostBinary }}</span>
          </div>
        </div>
      </div>

      <!-- Subnet Calculator -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">子网划分</h3>
        <div class="flex items-center gap-4 mb-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">需要子网数:</label>
          <el-input-number v-model="subnetCount" :min="2" :max="1024" @change="calculateSubnets" />
        </div>
        <div v-if="subnets.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50">
                <th class="px-3 py-2 text-left text-gray-500 dark:text-gray-400">子网</th>
                <th class="px-3 py-2 text-left text-gray-500 dark:text-gray-400">网络地址</th>
                <th class="px-3 py-2 text-left text-gray-500 dark:text-gray-400">可用范围</th>
                <th class="px-3 py-2 text-left text-gray-500 dark:text-gray-400">广播地址</th>
                <th class="px-3 py-2 text-right text-gray-500 dark:text-gray-400">主机数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(subnet, i) in subnets" :key="i" class="border-t border-gray-100 dark:border-gray-700">
                <td class="px-3 py-2 font-mono text-gray-900 dark:text-white">{{ i + 1 }}</td>
                <td class="px-3 py-2 font-mono text-gray-900 dark:text-white">{{ subnet.network }}</td>
                <td class="px-3 py-2 font-mono text-xs text-gray-900 dark:text-white">{{ subnet.firstHost }} - {{ subnet.lastHost }}</td>
                <td class="px-3 py-2 font-mono text-gray-900 dark:text-white">{{ subnet.broadcast }}</td>
                <td class="px-3 py-2 font-mono text-right text-gray-900 dark:text-white">{{ subnet.hostCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
      <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface CalcResult {
  network: string
  broadcast: string
  mask: string
  cidr: number
  firstHost: string
  lastHost: string
  hostCount: number
  isPrivate: boolean
  ipClass: string
  ipBinary: string
  maskBinary: string
  networkBinary: string
  hostBinary: string
}

interface SubnetInfo {
  network: string
  broadcast: string
  firstHost: string
  lastHost: string
  hostCount: number
}

const ipInput = ref('192.168.1.100')
const cidrMode = ref<'cidr' | 'mask'>('cidr')
const cidrInput = ref('24')
const maskInput = ref('255.255.255.0')
const result = ref<CalcResult | null>(null)
const error = ref('')
const subnetCount = ref(4)
const subnets = ref<SubnetInfo[]>([])

const ipToLong = (ip: string): number => {
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

const longToIp = (long: number): string => {
  return [(long >>> 24) & 0xFF, (long >>> 16) & 0xFF, (long >>> 8) & 0xFF, long & 0xFF].join('.')
}

const toBinary = (long: number): string => {
  return long.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1)
}

const isValidIp = (ip: string): boolean => {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = Number(p)
    return !isNaN(n) && n >= 0 && n <= 255 && p === String(n)
  })
}

const isPrivateIp = (ip: string): boolean => {
  const parts = ip.split('.').map(Number)
  if (parts[0] === 10) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  return false
}

const getIpClass = (ip: string): string => {
  const first = Number(ip.split('.')[0])
  if (first < 128) return 'A 类'
  if (first < 192) return 'B 类'
  if (first < 224) return 'C 类'
  if (first < 240) return 'D 类 (组播)'
  return 'E 类 (保留)'
}

const calculate = () => {
  error.value = ''
  result.value = null
  subnets.value = []

  if (!isValidIp(ipInput.value)) {
    error.value = '请输入有效的 IPv4 地址'
    return
  }

  let cidr: number
  if (cidrMode.value === 'cidr') {
    cidr = Number(cidrInput.value)
    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      error.value = 'CIDR 前缀必须在 0-32 之间'
      return
    }
    maskInput.value = longToIp((0xFFFFFFFF << (32 - cidr)) >>> 0)
  } else {
    if (!isValidIp(maskInput.value)) {
      error.value = '请输入有效的子网掩码'
      return
    }
    const maskLong = ipToLong(maskInput.value)
    // validate mask is contiguous
    const maskBinary = maskLong.toString(2).padStart(32, '0')
    if (maskBinary.includes('01')) {
      error.value = '子网掩码必须是连续的 1'
      return
    }
    cidr = maskBinary.split('1').length - 1
    cidrInput.value = String(cidr)
  }

  const ipLong = ipToLong(ipInput.value)
  const maskLong = (0xFFFFFFFF << (32 - cidr)) >>> 0
  const networkLong = (ipLong & maskLong) >>> 0
  const broadcastLong = (networkLong | ~maskLong) >>> 0
  const hostCount = cidr >= 31 ? (cidr === 31 ? 2 : 1) : broadcastLong - networkLong - 1
  const firstHost = cidr >= 31 ? longToIp(networkLong) : longToIp(networkLong + 1)
  const lastHost = cidr >= 31 ? longToIp(broadcastLong) : longToIp(broadcastLong - 1)

  result.value = {
    network: longToIp(networkLong),
    broadcast: longToIp(broadcastLong),
    mask: maskInput.value,
    cidr,
    firstHost,
    lastHost,
    hostCount,
    isPrivate: isPrivateIp(ipInput.value),
    ipClass: getIpClass(ipInput.value),
    ipBinary: toBinary(ipLong),
    maskBinary: toBinary(maskLong),
    networkBinary: toBinary(networkLong),
    hostBinary: toBinary(ipLong & ~maskLong),
  }

  calculateSubnets()
}

const calculateSubnets = () => {
  if (!result.value) return
  const newCidr = result.value.cidr + Math.ceil(Math.log2(subnetCount.value))
  if (newCidr > 30) {
    subnets.value = []
    return
  }
  const networkLong = ipToLong(result.value.network)
  const subnetSize = Math.pow(2, 32 - newCidr)
  const newMask = longToIp((0xFFFFFFFF << (32 - newCidr)) >>> 0)

  subnets.value = []
  for (let i = 0; i < subnetCount.value; i++) {
    const subnetNetwork = (networkLong + i * subnetSize) >>> 0
    const subnetBroadcast = (subnetNetwork + subnetSize - 1) >>> 0
    const hostCount = subnetSize >= 4 ? subnetSize - 2 : subnetSize
    subnets.value.push({
      network: `${longToIp(subnetNetwork)} /${newCidr}`,
      broadcast: longToIp(subnetBroadcast),
      firstHost: subnetSize >= 4 ? longToIp(subnetNetwork + 1) : longToIp(subnetNetwork),
      lastHost: subnetSize >= 4 ? longToIp(subnetBroadcast - 1) : longToIp(subnetBroadcast),
      hostCount,
    })
  }
}

const applyPreset = (preset: string) => {
  const [ip, cidr] = preset.split('/')
  ipInput.value = ip
  cidrMode.value = 'cidr'
  cidrInput.value = cidr
  calculate()
}

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

// Initial calculation
calculate()
</script>
