<template>
  <div class="space-y-6">
    <!-- Base Color -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">基础颜色</h3>
      <div class="flex items-center gap-4">
        <el-color-picker v-model="baseColor" show-alpha @change="generateAll" />
        <el-input v-model="baseColor" style="width: 140px" @change="generateAll" />
        <el-button @click="randomColor">
          <el-icon><Refresh /></el-icon> 随机颜色
        </el-button>
      </div>
    </div>

    <!-- Harmony Palettes -->
    <div class="space-y-4">
      <div v-for="harmony in harmonies" :key="harmony.name"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ harmony.name }}</h3>
          <el-button size="small" @click="copyPaletteCSS(harmony.colors, harmony.name)">
            <el-icon><CopyDocument /></el-icon> 复制 CSS
          </el-button>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ harmony.description }}</p>
        <div class="flex gap-2">
          <div v-for="(color, i) in harmony.colors" :key="i" class="flex-1 group cursor-pointer" @click="copyColor(color)">
            <div
              class="h-20 rounded-lg border-2 border-gray-200 dark:border-gray-600 transition-transform group-hover:scale-105"
              :style="{ backgroundColor: color }"
            />
            <p class="text-center text-xs font-mono mt-2 text-gray-600 dark:text-gray-400">{{ color }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Export -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">导出</h3>
      <div class="flex flex-wrap gap-2">
        <el-button @click="exportCSS">
          <el-icon><CopyDocument /></el-icon> 导出 CSS 变量
        </el-button>
        <el-button @click="exportTailwind">
          <el-icon><CopyDocument /></el-icon> 导出 Tailwind 配置
        </el-button>
        <el-button @click="exportJSON">
          <el-icon><CopyDocument /></el-icon> 导出 JSON
        </el-button>
      </div>
      <div v-if="exportOutput" class="mt-4">
        <pre class="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-auto max-h-60 text-gray-800 dark:text-gray-200">{{ exportOutput }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const baseColor = ref('#409EFF')
const exportOutput = ref('')

interface Harmony {
  name: string
  description: string
  colors: string[]
}

const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

const normalizeHex = (hex: string): string => {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  return '#' + hex.slice(0, 6).toUpperCase()
}

const generateHarmonies = (hex: string): Harmony[] => {
  const [h, s, l] = hexToHsl(normalizeHex(hex))
  return [
    {
      name: '互补色',
      description: '色轮上对立的两种颜色，对比强烈',
      colors: [hex, hslToHex((h + 180) % 360, s, l)],
    },
    {
      name: '类似色',
      description: '色轮上相邻的颜色，和谐自然',
      colors: [
        hslToHex((h - 30 + 360) % 360, s, l),
        hex,
        hslToHex((h + 30) % 360, s, l),
      ],
    },
    {
      name: '三角色',
      description: '色轮上均匀分布的三种颜色',
      colors: [
        hex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ],
    },
    {
      name: '分裂互补色',
      description: '互补色两侧的颜色，对比柔和',
      colors: [
        hex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ],
    },
    {
      name: '四角色',
      description: '色轮上形成矩形的四种颜色',
      colors: [
        hex,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
      ],
    },
    {
      name: '明度渐变',
      description: '同一色相的不同明度变化',
      colors: [
        hslToHex(h, s, Math.max(10, l - 30)),
        hslToHex(h, s, Math.max(10, l - 15)),
        hex,
        hslToHex(h, s, Math.min(90, l + 15)),
        hslToHex(h, s, Math.min(90, l + 30)),
      ],
    },
  ]
}

const harmonies = computed(() => generateHarmonies(baseColor.value))

const generateAll = () => {
  exportOutput.value = ''
}

const randomColor = () => {
  const h = Math.floor(Math.random() * 360)
  const s = 50 + Math.floor(Math.random() * 40)
  const l = 40 + Math.floor(Math.random() * 30)
  baseColor.value = hslToHex(h, s, l)
  generateAll()
}

const copyColor = async (color: string) => {
  try {
    await navigator.clipboard.writeText(normalizeHex(color))
    ElMessage.success(`已复制 ${normalizeHex(color)}`)
  } catch {
    ElMessage.error('复制失败')
  }
}

const copyPaletteCSS = async (colors: string[], name: string) => {
  const css = colors.map((c, i) => `  --color-${name}-${(i + 1) * 100}: ${normalizeHex(c)};`).join('\n')
  try {
    await navigator.clipboard.writeText(`:root {\n${css}\n}`)
    ElMessage.success('已复制 CSS 变量')
  } catch {
    ElMessage.error('复制失败')
  }
}

const exportCSS = () => {
  let css = ':root {\n'
  harmonies.value.forEach(h => {
    h.colors.forEach((c, i) => {
      css += `  --palette-${h.name}-${(i + 1) * 100}: ${normalizeHex(c)};\n`
    })
  })
  css += '}'
  exportOutput.value = css
}

const exportTailwind = () => {
  const config: Record<string, string> = {}
  harmonies.value.forEach(h => {
    h.colors.forEach((c, i) => {
      config[`${h.name}-${(i + 1) * 100}`] = normalizeHex(c)
    })
  })
  exportOutput.value = `// tailwind.config.js\ncolors: ${JSON.stringify(config, null, 2)}`
}

const exportJSON = () => {
  const data: Record<string, string[]> = {}
  harmonies.value.forEach(h => {
    data[h.name] = h.colors.map(c => normalizeHex(c))
  })
  exportOutput.value = JSON.stringify(data, null, 2)
}

onMounted(() => generateAll())
</script>
