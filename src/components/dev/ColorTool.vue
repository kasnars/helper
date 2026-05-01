<template>
  <div class="space-y-6">
    <!-- Color Picker -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">颜色选择器</h3>
      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-shrink-0">
          <el-color-picker v-model="color" size="large" show-alpha />
        </div>
        <div class="flex-1 space-y-3">
          <div class="flex items-center gap-4">
            <div
              class="w-24 h-24 rounded-lg border-2 border-gray-300 dark:border-gray-600"
              :style="{ backgroundColor: color }"
            />
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400 w-12">HEX:</span>
                <el-input v-model="hexValue" @change="handleHexChange" class="flex-1" />
                <el-button size="small" @click="copyToClipboard(hexValue)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400 w-12">RGB:</span>
                <el-input v-model="rgbValue" @change="handleRgbChange" class="flex-1" />
                <el-button size="small" @click="copyToClipboard(rgbValue)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400 w-12">HSL:</span>
                <el-input v-model="hslValue" @change="handleHslChange" class="flex-1" />
                <el-button size="small" @click="copyToClipboard(hslValue)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Converter -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">颜色格式转换</h3>
      <div class="space-y-4">
        <el-input
          v-model="colorInput"
          placeholder="输入颜色值 (HEX/RGB/HSL)，如: #FF5722 或 rgb(255, 87, 34) 或 hsl(14, 100%, 57%)"
          @keyup.enter="convertColor"
        />
        <el-button type="primary" @click="convertColor" :disabled="!colorInput">
          转换
        </el-button>
        
        <div v-if="convertedColor" class="space-y-3 mt-4">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
              :style="{ backgroundColor: convertedColor.preview }"
            />
            <div class="flex-1 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">HEX:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-semibold">{{ convertedColor.hex }}</span>
                  <el-button size="small" link @click="copyToClipboard(convertedColor.hex)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">RGB:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-semibold">{{ convertedColor.rgb }}</span>
                  <el-button size="small" link @click="copyToClipboard(convertedColor.rgb)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">HSL:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-semibold">{{ convertedColor.hsl }}</span>
                  <el-button size="small" link @click="copyToClipboard(convertedColor.hsl)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Palette -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">常用颜色</h3>
      <div class="grid grid-cols-8 md:grid-cols-12 gap-2">
        <div
          v-for="colorItem in commonColors"
          :key="colorItem.hex"
          class="group relative"
          @click="copyToClipboard(colorItem.hex)"
        >
          <div
            class="w-full aspect-square rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
            :style="{ backgroundColor: colorItem.hex }"
            :title="colorItem.name"
          />
          <div
            class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
          >
            {{ colorItem.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Contrast Checker -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">对比度检查器</h3>
      <div class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">前景色</label>
            <el-color-picker v-model="fgColor" show-alpha />
          </div>
          <div class="flex-1">
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">背景色</label>
            <el-color-picker v-model="bgColor" show-alpha />
          </div>
        </div>
        
        <div
          v-if="contrastRatio"
          class="p-4 rounded-lg border-2"
          :style="{ backgroundColor: bgColor, color: fgColor, borderColor: fgColor }"
        >
          <p class="text-lg font-semibold">预览文本</p>
          <p class="text-sm mt-2">对比度: {{ contrastRatio }}:1</p>
          <div class="mt-2 space-y-1">
            <div class="flex items-center gap-2">
              <el-tag :type="contrastRatio >= 4.5 ? 'success' : 'danger'" size="small">
                AA 正常文本: {{ contrastRatio >= 4.5 ? '通过' : '不通过' }}
              </el-tag>
            </div>
            <div class="flex items-center gap-2">
              <el-tag :type="contrastRatio >= 3 ? 'success' : 'danger'" size="small">
                AA 大文本: {{ contrastRatio >= 3 ? '通过' : '不通过' }}
              </el-tag>
            </div>
            <div class="flex items-center gap-2">
              <el-tag :type="contrastRatio >= 7 ? 'success' : 'warning'" size="small">
                AAA 正常文本: {{ contrastRatio >= 7 ? '通过' : '不通过' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const color = ref('#409EFF')
const colorInput = ref('')
const convertedColor = ref<any>(null)
const fgColor = ref('#000000')
const bgColor = ref('#FFFFFF')

const hexValue = computed({
  get: () => color.value,
  set: (val: string) => {
    color.value = val
  }
})

const rgbValue = computed({
  get: () => {
    const rgb = hexToRgb(color.value)
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  },
  set: (val: string) => {
    const rgb = parseRgb(val)
    if (rgb) {
      color.value = rgbToHex(rgb.r, rgb.g, rgb.b)
    }
  }
})

const hslValue = computed({
  get: () => {
    const rgb = hexToRgb(color.value)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  },
  set: (val: string) => {
    const hsl = parseHsl(val)
    if (hsl) {
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
      color.value = rgbToHex(rgb.r, rgb.g, rgb.b)
    }
  }
})

const contrastRatio = computed(() => {
  const rgb1 = hexToRgb(fgColor.value)
  const rgb2 = hexToRgb(bgColor.value)
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2))
})

const commonColors = [
  { hex: '#FF0000', name: '红色' },
  { hex: '#00FF00', name: '绿色' },
  { hex: '#0000FF', name: '蓝色' },
  { hex: '#FFFF00', name: '黄色' },
  { hex: '#FF00FF', name: '品红' },
  { hex: '#00FFFF', name: '青色' },
  { hex: '#FF5722', name: '橙红' },
  { hex: '#4CAF50', name: '翠绿' },
  { hex: '#2196F3', name: '天蓝' },
  { hex: '#FFC107', name: '琥珀' },
  { hex: '#9C27B0', name: '紫色' },
  { hex: '#00BCD4', name: '蓝绿' },
  { hex: '#FFFFFF', name: '白色' },
  { hex: '#000000', name: '黑色' },
  { hex: '#9E9E9E', name: '灰色' },
  { hex: '#795548', name: '棕色' },
  { hex: '#E91E63', name: '粉红' },
  { hex: '#3F51B5', name: '靛蓝' },
  { hex: '#009688', name: '青绿' },
  { hex: '#FF9800', name: '橙色' },
  { hex: '#8BC34A', name: '浅绿' },
  { hex: '#CDDC39', name: '黄绿' },
  { hex: '#FFEB3B', name: '明黄' },
  { hex: '#607D8B', name: '蓝灰' },
]

const convertColor = () => {
  try {
    let hex = ''
    
    if (colorInput.value.startsWith('#')) {
      hex = colorInput.value
    } else if (colorInput.value.startsWith('rgb')) {
      const rgb = parseRgb(colorInput.value)
      if (rgb) {
        hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      }
    } else if (colorInput.value.startsWith('hsl')) {
      const hsl = parseHsl(colorInput.value)
      if (hsl) {
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
        hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      }
    }
    
    if (hex) {
      const rgb = hexToRgb(hex)
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      convertedColor.value = {
        preview: hex,
        hex: hex.toUpperCase(),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      }
    }
  } catch (e) {
    ElMessage.error('无效的颜色值')
  }
}

const handleHexChange = (val: string) => {
  if (val.startsWith('#') && (val.length === 7 || val.length === 4)) {
    color.value = val
  }
}

const handleRgbChange = (val: string) => {
  const rgb = parseRgb(val)
  if (rgb) {
    color.value = rgbToHex(rgb.r, rgb.g, rgb.b)
  }
}

const handleHslChange = (val: string) => {
  const hsl = parseHsl(val)
  if (hsl) {
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
    color.value = rgbToHex(rgb.r, rgb.g, rgb.b)
  }
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360
  s /= 100
  l /= 100
  
  let r, g, b
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

const parseRgb = (rgb: string) => {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    }
  }
  return null
}

const parseHsl = (hsl: string) => {
  const match = hsl.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/)
  if (match) {
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3])
    }
  }
  return null
}

const getLuminance = (r: number, g: number, b: number) => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}
</script>
