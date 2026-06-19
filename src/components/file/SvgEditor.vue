<template>
  <div class="space-y-6">
    <!-- 工具栏 -->
    <div class="flex flex-wrap items-center gap-2">
      <el-button-group>
        <el-button @click="insertTemplate('rect')" size="small">矩形</el-button>
        <el-button @click="insertTemplate('circle')" size="small">圆形</el-button>
        <el-button @click="insertTemplate('ellipse')" size="small">椭圆</el-button>
        <el-button @click="insertTemplate('line')" size="small">线条</el-button>
        <el-button @click="insertTemplate('text')" size="small">文字</el-button>
        <el-button @click="insertTemplate('path')" size="small">路径</el-button>
      </el-button-group>
      <el-divider direction="vertical" />
      <el-button @click="insertTemplate('star')" size="small">⭐ 五角星</el-button>
      <el-button @click="insertTemplate('heart')" size="small">❤️ 爱心</el-button>
      <el-button @click="insertTemplate('arrow')" size="small">➡️ 箭头</el-button>
      <el-divider direction="vertical" />
      <el-button @click="loadSample" size="small" type="primary" plain>加载示例</el-button>
      <el-button @click="clearSvg" size="small" danger plain>清空</el-button>
    </div>

    <!-- 编辑器区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 代码编辑 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">SVG 代码</span>
          <div class="flex gap-2">
            <el-button size="small" @click="formatCode">格式化</el-button>
            <el-button size="small" @click="copyCode">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </div>
        <textarea
          v-model="svgCode"
          class="w-full h-[400px] p-4 font-mono text-sm bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none"
          spellcheck="false"
          placeholder="在此输入 SVG 代码..."
          @input="updatePreview"
        />
      </div>

      <!-- 预览 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">实时预览</span>
          <div class="flex gap-2">
            <el-select v-model="previewBg" size="small" class="w-24">
              <el-option label="白色" value="#ffffff" />
              <el-option label="灰色" value="#f0f0f0" />
              <el-option label="深色" value="#1a1a1a" />
              <el-option label="透明" value="transparent" />
            </el-select>
            <el-button size="small" @click="downloadSvg">
              <el-icon><Download /></el-icon>
              SVG
            </el-button>
            <el-button size="small" @click="downloadPng">
              <el-icon><Download /></el-icon>
              PNG
            </el-button>
          </div>
        </div>
        <div
          class="h-[400px] flex items-center justify-center overflow-auto p-4"
          :style="{ backgroundColor: previewBg === 'transparent' ? 'transparent' : previewBg, backgroundImage: previewBg === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none', backgroundSize: previewBg === 'transparent' ? '16px 16px' : 'auto', backgroundPosition: previewBg === 'transparent' ? '0 0, 0 8px, 8px -8px, -8px 0px' : 'auto' }"
        >
          <div v-if="previewError" class="text-red-500 text-sm text-center">
            <el-icon :size="24" class="mb-2"><Warning /></el-icon>
            <p>SVG 代码有误</p>
            <p class="text-xs mt-1">{{ previewError }}</p>
          </div>
          <div v-else ref="previewContainer" class="max-w-full max-h-full" v-html="sanitizedSvg" />
        </div>
      </div>
    </div>

    <!-- SVG 信息 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">快捷操作</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span class="text-gray-500">代码行数</span>
          <div class="font-medium text-gray-900 dark:text-white">{{ lineCount }}</div>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span class="text-gray-500">字符数</span>
          <div class="font-medium text-gray-900 dark:text-white">{{ svgCode.length }}</div>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span class="text-gray-500">文件大小</span>
          <div class="font-medium text-gray-900 dark:text-white">{{ fileSize }}</div>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span class="text-gray-500">状态</span>
          <div class="font-medium" :class="previewError ? 'text-red-500' : 'text-green-500'">
            {{ previewError ? '有误' : '正常' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CopyDocument, Download, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const svgCode = ref('')
const previewBg = ref('#ffffff')
const previewError = ref('')
const previewContainer = ref<HTMLDivElement>()

const lineCount = computed(() => svgCode.value.split('\n').length)
const fileSize = computed(() => {
  const bytes = new Blob([svgCode.value]).size
  if (bytes < 1024) return bytes + ' B'
  return (bytes / 1024).toFixed(1) + ' KB'
})

// 简单的 SVG 净化（防止 XSS）
const sanitizedSvg = computed(() => {
  const code = svgCode.value.trim()
  if (!code) return ''
  // 去除 script 标签
  return code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
})

const updatePreview = () => {
  previewError.value = ''
  if (!svgCode.value.trim()) return
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgCode.value, 'image/svg+xml')
    const errorNode = doc.querySelector('parsererror')
    if (errorNode) {
      previewError.value = 'SVG 语法错误'
    }
  } catch (e: any) {
    previewError.value = e.message
  }
}

const insertTemplate = (shape: string) => {
  const templates: Record<string, string> = {
    rect: `\n  <rect x="50" y="50" width="100" height="80" fill="#438edb" rx="8" />`,
    circle: `\n  <circle cx="100" cy="100" r="50" fill="#d93532" />`,
    ellipse: `\n  <ellipse cx="100" cy="100" rx="80" ry="50" fill="#a0d468" />`,
    line: `\n  <line x1="20" y1="20" x2="180" y2="180" stroke="#333" stroke-width="2" />`,
    text: `\n  <text x="50" y="50" font-size="20" fill="#333" font-family="Arial">Hello SVG</text>`,
    path: `\n  <path d="M10,80 Q95,10 180,80" stroke="#666" stroke-width="2" fill="none" />`,
    star: `\n  <polygon points="100,10 120,75 190,75 135,110 155,175 100,140 45,175 65,110 10,75 80,75" fill="#ffd700" />`,
    heart: `\n  <path d="M100,180 C60,140 0,100 0,60 A50,50,0,0,1,100,40 A50,50,0,0,1,200,60 C200,100 140,140 100,180Z" fill="#ff4757" />`,
    arrow: `\n  <path d="M10,50 L150,50 L150,30 L190,55 L150,80 L150,60 L10,60Z" fill="#2ed573" />`,
  }

  if (!svgCode.value.trim()) {
    svgCode.value = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  ${templates[shape].trim()}
</svg>`
  } else {
    // 在 </svg> 前插入
    const idx = svgCode.value.lastIndexOf('</svg>')
    if (idx !== -1) {
      svgCode.value = svgCode.value.slice(0, idx) + templates[shape] + '\n' + svgCode.value.slice(idx)
    }
  }
  updatePreview()
}

const loadSample = () => {
  svgCode.value = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
  <!-- 背景 -->
  <rect width="300" height="200" fill="#f0f4f8" rx="12" />

  <!-- 太阳 -->
  <circle cx="250" cy="40" r="25" fill="#ffd700" />
  <g stroke="#ffd700" stroke-width="2">
    <line x1="250" y1="5" x2="250" y2="15" />
    <line x1="250" y1="65" x2="250" y2="75" />
    <line x1="215" y1="40" x2="225" y2="40" />
    <line x1="275" y1="40" x2="285" y2="40" />
  </g>

  <!-- 山 -->
  <polygon points="0,200 80,80 160,200" fill="#7bed9f" />
  <polygon points="100,200 180,100 260,200" fill="#2ed573" />

  <!-- 树 -->
  <rect x="60" y="140" width="8" height="30" fill="#8B4513" />
  <circle cx="64" cy="130" r="18" fill="#26a65b" />

  <!-- 文字 -->
  <text x="20" y="35" font-size="18" fill="#333" font-family="Arial" font-weight="bold">Hello SVG!</text>
  <text x="20" y="55" font-size="12" fill="#666" font-family="Arial">在线 SVG 编辑器</text>
</svg>`
  updatePreview()
}

const clearSvg = () => {
  svgCode.value = ''
  previewError.value = ''
}

const formatCode = () => {
  // 简单格式化
  let code = svgCode.value
  let indent = 0
  const lines = code.replace(/>\s*</g, '>\n<').split('\n')
  const formatted = lines.map(line => {
    line = line.trim()
    if (!line) return ''
    if (line.startsWith('</')) indent = Math.max(0, indent - 1)
    const result = '  '.repeat(indent) + line
    if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>') && !line.includes('</')) {
      indent++
    }
    return result
  })
  svgCode.value = formatted.filter(l => l !== '').join('\n')
  updatePreview()
}

const copyCode = () => {
  navigator.clipboard.writeText(svgCode.value)
  ElMessage.success('已复制 SVG 代码')
}

const downloadSvg = () => {
  const blob = new Blob([svgCode.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `svg_${Date.now()}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

const downloadPng = () => {
  if (!previewContainer.value) return
  const svgEl = previewContainer.value.querySelector('svg')
  if (!svgEl) return

  const canvas = document.createElement('canvas')
  const w = parseInt(svgEl.getAttribute('width') || '300')
  const h = parseInt(svgEl.getAttribute('height') || '200')
  canvas.width = w * 2
  canvas.height = h * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  const svgData = new XMLSerializer().serializeToString(svgEl)
  const img = new Image()
  img.onload = () => {
    ctx.fillStyle = previewBg.value === 'transparent' ? '#ffffff' : previewBg.value
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `svg_${Date.now()}.png`
    a.click()
  }
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}

onMounted(() => {
  // 默认加载一个简单示例
  svgCode.value = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="20" y="20" width="160" height="160" rx="16" fill="#438edb" />
  <text x="100" y="110" text-anchor="middle" font-size="24" fill="white" font-family="Arial">SVG</text>
</svg>`
})
</script>
