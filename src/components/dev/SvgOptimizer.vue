<template>
  <div class="space-y-6">
    <!-- Input -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">输入 SVG</h3>
      <div class="flex gap-2 mb-4">
        <el-button @click="triggerFileInput">
          <el-icon><Upload /></el-icon> 上传 SVG 文件
        </el-button>
        <el-button @click="loadSample">加载示例</el-button>
      </div>
      <input ref="fileInput" type="file" accept=".svg,image/svg+xml" class="hidden" @change="handleFileSelect" />
      <el-input
        v-model="inputSvg"
        type="textarea"
        :rows="10"
        placeholder="粘贴 SVG 代码，或上传 SVG 文件..."
        @input="onInputChange"
      />
    </div>

    <!-- Options -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">优化选项</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <el-checkbox v-model="options.removeComments" @change="optimize">移除注释</el-checkbox>
        <el-checkbox v-model="options.removeMetadata" @change="optimize">移除 metadata</el-checkbox>
        <el-checkbox v-model="options.removeEmptyAttrs" @change="optimize">移除空属性</el-checkbox>
        <el-checkbox v-model="options.removeUselessDefs" @change="optimize">移除无用 defs</el-checkbox>
        <el-checkbox v-model="options.removeHiddenElems" @change="optimize">移除隐藏元素</el-checkbox>
        <el-checkbox v-model="options.minifyStyles" @change="optimize">压缩样式</el-checkbox>
        <el-checkbox v-model="options.convertColors" @change="optimize">缩短颜色值</el-checkbox>
        <el-checkbox v-model="options.removeViewBox" @change="optimize">移除多余 viewBox</el-checkbox>
        <el-checkbox v-model="options.collapseGroups" @change="optimize">合并无用分组</el-checkbox>
        <el-checkbox v-model="options.cleanIds" @change="optimize">清理无用 ID</el-checkbox>
        <el-checkbox v-model="options.decimalPrecision" @change="optimize">压缩小数位</el-checkbox>
        <el-checkbox v-model="options.removeXmlns" @change="optimize">移除冗余命名空间</el-checkbox>
      </div>
      <div class="mt-4">
        <el-button type="primary" @click="optimize" :disabled="!inputSvg.trim()">
          <el-icon><MagicStick /></el-icon> 优化 SVG
        </el-button>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="optimizedSvg" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">优化结果</h3>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatSize(originalSize) }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">原始大小</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatSize(optimizedSize) }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">优化后大小</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ savings }}%</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">减少</p>
        </div>
      </div>
      <div class="flex gap-2">
        <el-button type="primary" @click="copyOptimized">
          <el-icon><CopyDocument /></el-icon> 复制优化代码
        </el-button>
        <el-button @click="downloadSvg">
          <el-icon><Download /></el-icon> 下载 SVG
        </el-button>
      </div>
    </div>

    <!-- Side by side preview -->
    <div v-if="optimizedSvg" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">原始 SVG</h3>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[200px] flex items-center justify-center" v-html="inputSvg" />
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">优化后 SVG</h3>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[200px] flex items-center justify-center" v-html="optimizedSvg" />
      </div>
    </div>

    <!-- Code diff -->
    <div v-if="optimizedSvg" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">优化后代码</h3>
      <pre class="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-auto max-h-60 text-gray-800 dark:text-gray-200">{{ optimizedSvg }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, CopyDocument, Download, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const fileInput = ref<HTMLInputElement>()
const inputSvg = ref('')
const optimizedSvg = ref('')
const originalSize = ref(0)
const optimizedSize = ref(0)

const options = ref({
  removeComments: true,
  removeMetadata: true,
  removeEmptyAttrs: true,
  removeUselessDefs: true,
  removeHiddenElems: true,
  minifyStyles: true,
  convertColors: true,
  removeViewBox: false,
  collapseGroups: true,
  cleanIds: true,
  decimalPrecision: true,
  removeXmlns: true,
})

const savings = computed(() => {
  if (originalSize.value === 0) return 0
  return Math.round((1 - optimizedSize.value / originalSize.value) * 100)
})

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      inputSvg.value = ev.target?.result as string
      optimize()
    }
    reader.readAsText(file)
  }
}

const onInputChange = () => {
  optimizedSvg.value = ''
}

const loadSample = () => {
  inputSvg.value = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" width="200" height="200">
  <!-- This is a sample SVG -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
    <g id="unused-group">
      <circle cx="0" cy="0" r="5" fill="#999999"/>
    </g>
  </defs>
  <g transform="translate(10, 10)">
    <g>
      <rect x="0.000000" y="0.000000" width="180.000000" height="180.000000" rx="20.000000" ry="20.000000" fill="url(#grad1)" stroke="#333333" stroke-width="2.000000"/>
      <circle cx="90.000000" cy="90.000000" r="50.000000" fill="#ffffff" opacity="0.800000"/>
      <text x="90.000000" y="95.000000" text-anchor="middle" font-size="16.000000" fill="#333333">Hello</text>
    </g>
  </g>
  <metadata>Created with test</metadata>
</svg>`
  optimize()
}

const optimize = () => {
  if (!inputSvg.value.trim()) return

  originalSize.value = new Blob([inputSvg.value]).size
  let svg = inputSvg.value

  if (options.value.removeComments) {
    svg = svg.replace(/<!--[\s\S]*?-->/g, '')
  }

  if (options.value.removeMetadata) {
    svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
    svg = svg.replace(/<rdf:RDF[\s\S]*?<\/rdf:RDF>/gi, '')
    svg = svg.replace(/<cc:work[\s\S]*?<\/cc:work>/gi, '')
  }

  if (options.value.removeXmlns) {
    svg = svg.replace(/xmlns:xlink="[^"]*"/g, '')
    svg = svg.replace(/xmlns:dc="[^"]*"/g, '')
    svg = svg.replace(/xmlns:cc="[^"]*"/g, '')
    svg = svg.replace(/xmlns:rdf="[^"]*"/g, '')
    svg = svg.replace(/xmlns:svg="[^"]*"/g, '')
  }

  if (options.value.removeEmptyAttrs) {
    svg = svg.replace(/\s+[a-z-]+=""\s*/gi, ' ')
  }

  if (options.value.removeHiddenElems) {
    svg = svg.replace(/<[^>]*\sdisplay:\s*none[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    svg = svg.replace(/<[^>]*\svisibility:\s*hidden[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    svg = svg.replace(/<[^>]*\sopacity:\s*0[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
  }

  if (options.value.minifyStyles) {
    svg = svg.replace(/style="([^"]*)"/g, (_match, styles: string) => {
      const minified = styles.replace(/\s*:\s*/g, ':').replace(/\s*;\s*/g, ';').replace(/;+$/, '')
      return `style="${minified}"`
    })
  }

  if (options.value.convertColors) {
    const colorMap: Record<string, string> = {
      '#000000': '#000', '#000': '#000',
      '#ffffff': '#fff', '#fff': '#fff',
      '#ff0000': 'red', '#00ff00': 'lime', '#0000ff': 'blue',
      '#ffff00': 'yellow', '#ff00ff': 'fuchsia', '#00ffff': 'aqua',
    }
    svg = svg.replace(/"#([0-9a-fA-F]{6})"/g, (_match, hex: string) => {
      const lower = '#' + hex.toLowerCase()
      return colorMap[lower] ? `"${colorMap[lower]}"` : `"#${hex}"`
    })
    // rgb to hex
    svg = svg.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, (_m, r: string, g: string, b: string) => {
      const hex = '#' + [r, g, b].map(c => parseInt(c).toString(16).padStart(2, '0')).join('')
      const lower = hex.toLowerCase()
      return colorMap[lower] || lower
    })
  }

  if (options.value.collapseGroups) {
    // Remove empty groups
    svg = svg.replace(/<g>\s*<\/g>/g, '')
    // Unwrap single-child groups with no attributes
    svg = svg.replace(/<g>(\s*<[^>]+\/?>[\s\S]*?<\/[^>]+>\s*)<\/g>/g, '$1')
  }

  if (options.value.decimalPrecision) {
    svg = svg.replace(/(\d+\.\d{3})\d+/g, '$1')
    svg = svg.replace(/0\.000/g, '0')
  }

  if (options.value.removeUselessDefs) {
    // Remove defs content that's not referenced
    const ids: string[] = []
    const idRegex = /id="([^"]+)"/g
    let match
    while ((match = idRegex.exec(svg)) !== null) {
      ids.push(match[1])
    }
    ids.forEach(id => {
      const usageRegex = new RegExp(`url\\(#${id}\\)|href="#${id}"|#${id}`, 'g')
      const usages = svg.match(usageRegex)
      if (!usages || usages.length <= 1) {
        svg = svg.replace(new RegExp(`<[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/[^>]+>`, 'g'), '')
        svg = svg.replace(new RegExp(`<[^>]*id="${id}"[^>]*\\/>`, 'g'), '')
      }
    })
  }

  if (options.value.cleanIds) {
    // Shorten long IDs
    const idMap = new Map<string, string>()
    let counter = 0
    svg = svg.replace(/id="([^"]+)"/g, (_match, id: string) => {
      if (id.length <= 3) return _match
      if (!idMap.has(id)) {
        idMap.set(id, `a${counter++}`)
      }
      return `id="${idMap.get(id)}"`
    })
    idMap.forEach((newId, oldId) => {
      svg = svg.replace(new RegExp(`#${oldId}`, 'g'), `#${newId}`)
      svg = svg.replace(new RegExp(`url\\(#${oldId}\\)`, 'g'), `url(#${newId})`)
    })
  }

  // Clean up whitespace
  svg = svg.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()

  optimizedSvg.value = svg
  optimizedSize.value = new Blob([svg]).size
}

const copyOptimized = async () => {
  try {
    await navigator.clipboard.writeText(optimizedSvg.value)
    ElMessage.success('已复制优化后的 SVG 代码')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadSvg = () => {
  const blob = new Blob([optimizedSvg.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `optimized_${Date.now()}.svg`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
