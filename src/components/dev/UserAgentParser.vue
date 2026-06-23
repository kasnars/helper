<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">User-Agent 解析</h2>

    <!-- 输入 -->
    <div class="mb-4">
      <div class="flex gap-2 mb-2">
        <el-input
          v-model="uaString"
          type="textarea"
          :rows="3"
          placeholder="粘贴 User-Agent 字符串，或点击下方按钮获取当前浏览器的 UA"
          @input="parseUA"
        />
      </div>
      <el-button @click="useCurrentUA" type="primary" plain size="small">
        使用当前浏览器 UA
      </el-button>
    </div>

    <!-- 解析结果 -->
    <div v-if="result" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="item in resultItems"
        :key="item.label"
        class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
      >
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ item.label }}</div>
        <div class="flex items-center gap-2">
          <span class="text-xl">{{ item.icon }}</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <!-- 原始字段 -->
    <div v-if="result" class="mt-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">详细字段</h3>
      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm font-mono space-y-1">
        <div v-for="(val, key) in detailFields" :key="key" class="flex">
          <span class="text-gray-500 dark:text-gray-400 w-28 shrink-0">{{ key }}:</span>
          <span class="text-gray-900 dark:text-white break-all">{{ val }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const uaString = ref('')

interface UAResult {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  device: string
  engine: string
  engineVersion: string
  architecture: string
}

const result = ref<UAResult | null>(null)

const useCurrentUA = () => {
  uaString.value = navigator.userAgent
  parseUA()
}

const parseUA = () => {
  const ua = uaString.value.trim()
  if (!ua) {
    result.value = null
    return
  }

  result.value = {
    browser: detectBrowser(ua),
    browserVersion: detectBrowserVersion(ua),
    os: detectOS(ua),
    osVersion: detectOSVersion(ua),
    device: detectDevice(ua),
    engine: detectEngine(ua),
    engineVersion: detectEngineVersion(ua),
    architecture: detectArch(ua),
  }
}

const detectBrowser = (ua: string): string => {
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return 'Opera'
  if (/Vivaldi/.test(ua)) return 'Vivaldi'
  if (/YaBrowser/.test(ua)) return 'Yandex'
  if (/Brave/.test(ua)) return 'Brave'
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari'
  if (/MSIE|Trident/.test(ua)) return 'Internet Explorer'
  if (/Chromium/.test(ua)) return 'Chromium'
  return '未知'
}

const detectBrowserVersion = (ua: string): string => {
  const patterns = [
    /Edg\/([\d.]+)/,
    /OPR\/([\d.]+)/,
    /Vivaldi\/([\d.]+)/,
    /YaBrowser\/([\d.]+)/,
    /Chrome\/([\d.]+)/,
    /Firefox\/([\d.]+)/,
    /Version\/([\d.]+).*Safari/,
    /MSIE ([\d.]+)/,
    /rv:([\d.]+).*Trident/,
  ]
  for (const p of patterns) {
    const m = ua.match(p)
    if (m) return m[1]
  }
  return '-'
}

const detectOS = (ua: string): string => {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11'
  if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1'
  if (/Windows NT 6\.2/.test(ua)) return 'Windows 8'
  if (/Windows NT 6\.1/.test(ua)) return 'Windows 7'
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  if (/CrOS/.test(ua)) return 'Chrome OS'
  if (/Linux/.test(ua)) return 'Linux'
  if (/FreeBSD/.test(ua)) return 'FreeBSD'
  return '未知'
}

const detectOSVersion = (ua: string): string => {
  const macMatch = ua.match(/Mac OS X ([\d_]+)/)
  if (macMatch) return macMatch[1].replace(/_/g, '.')

  const androidMatch = ua.match(/Android ([\d.]+)/)
  if (androidMatch) return androidMatch[1]

  const iosMatch = ua.match(/OS ([\d_]+)/)
  if (iosMatch) return iosMatch[1].replace(/_/g, '.')

  const winMatch = ua.match(/Windows NT ([\d.]+)/)
  if (winMatch) return winMatch[1]

  return '-'
}

const detectDevice = (ua: string): string => {
  if (/iPad/.test(ua)) return 'iPad'
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/Android.*Mobile/.test(ua)) return 'Android 手机'
  if (/Android/.test(ua)) return 'Android 平板'
  if (/Mobile/.test(ua)) return '移动设备'
  return '桌面设备'
}

const detectEngine = (ua: string): string => {
  if (/Gecko\//.test(ua) && /Firefox/.test(ua)) return 'Gecko'
  if (/AppleWebKit/.test(ua)) return 'WebKit'
  if (/Trident/.test(ua)) return 'Trident'
  if (/Presto/.test(ua)) return 'Presto'
  return '未知'
}

const detectEngineVersion = (ua: string): string => {
  const m = ua.match(/AppleWebKit\/([\d.]+)/)
  if (m) return m[1]
  const m2 = ua.match(/Gecko\/([\d]+)/)
  if (m2) return m2[1]
  return '-'
}

const detectArch = (ua: string): string => {
  if (/x86_64|Win64|x64|AMD64/.test(ua)) return 'x86_64'
  if (/arm|aarch64/i.test(ua)) return 'ARM'
  if (/i686|i386|x86/.test(ua)) return 'x86'
  return '-'
}

const resultItems = computed(() => {
  if (!result.value) return []
  const r = result.value
  return [
    { label: '浏览器', icon: '🌐', value: `${r.browser} ${r.browserVersion}` },
    { label: '操作系统', icon: '💻', value: `${r.os} ${r.osVersion}` },
    { label: '设备类型', icon: '📱', value: r.device },
    { label: '渲染引擎', icon: '⚙️', value: `${r.engine} ${r.engineVersion}` },
    { label: '架构', icon: '🏗️', value: r.architecture },
  ]
})

const detailFields = computed(() => {
  if (!result.value) return {}
  const r = result.value
  return {
    浏览器: r.browser,
    浏览器版本: r.browserVersion,
    操作系统: r.os,
    系统版本: r.osVersion,
    设备类型: r.device,
    渲染引擎: r.engine,
    引擎版本: r.engineVersion,
    架构: r.architecture,
  }
})
</script>
