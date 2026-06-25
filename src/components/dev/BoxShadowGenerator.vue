<template>
  <div class="space-y-6">
    <!-- 阴影配置 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Box Shadow 生成器</h3>
      <div class="space-y-4">
        <!-- 阴影类型 -->
        <div class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">阴影类型:</label>
          <el-radio-group v-model="isInset">
            <el-radio-button :value="false">外阴影</el-radio-button>
            <el-radio-button :value="true">内阴影</el-radio-button>
          </el-radio-group>
        </div>

        <!-- X 偏移 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
            X 偏移: <span class="font-mono">{{ offsetX }}px</span>
          </label>
          <el-slider v-model="offsetX" :min="-50" :max="50" :step="1" />
        </div>

        <!-- Y 偏移 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
            Y 偏移: <span class="font-mono">{{ offsetY }}px</span>
          </label>
          <el-slider v-model="offsetY" :min="-50" :max="50" :step="1" />
        </div>

        <!-- 模糊半径 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
            模糊半径: <span class="font-mono">{{ blur }}px</span>
          </label>
          <el-slider v-model="blur" :min="0" :max="100" :step="1" />
        </div>

        <!-- 扩展半径 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
            扩展半径: <span class="font-mono">{{ spread }}px</span>
          </label>
          <el-slider v-model="spread" :min="-50" :max="50" :step="1" />
        </div>

        <!-- 阴影颜色 -->
        <div class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">阴影颜色:</label>
          <el-color-picker v-model="shadowColor" show-alpha />
          <el-input v-model="shadowColor" class="w-40" />
        </div>

        <!-- 透明度 -->
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
            透明度: <span class="font-mono">{{ opacity }}%</span>
          </label>
          <el-slider v-model="opacity" :min="0" :max="100" :step="1" />
        </div>
      </div>
    </div>

    <!-- 多层阴影 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">多层阴影</h3>
        <el-button size="small" @click="addShadowLayer">
          <el-icon><Plus /></el-icon>
          添加层
        </el-button>
      </div>
      <div class="space-y-3">
        <div
          v-for="(layer, index) in shadowLayers"
          :key="index"
          class="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
        >
          <span class="text-sm text-gray-600 dark:text-gray-400 w-12">层 {{ index + 1 }}</span>
          <el-color-picker v-model="layer.color" size="small" />
          <el-input-number v-model="layer.offsetX" :min="-50" :max="50" size="small" controls-position="right" />
          <el-input-number v-model="layer.offsetY" :min="-50" :max="50" size="small" controls-position="right" />
          <el-input-number v-model="layer.blur" :min="0" :max="100" size="small" controls-position="right" />
          <el-button
            size="small"
            type="danger"
            :icon="Delete"
            circle
            @click="removeShadowLayer(index)"
            :disabled="shadowLayers.length <= 1"
          />
        </div>
      </div>
    </div>

    <!-- 预览 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">预览</h3>
      <div class="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div
          class="w-32 h-32 bg-white dark:bg-gray-600 rounded-lg"
          :style="{ boxShadow: boxShadowCSS }"
        />
      </div>
    </div>

    <!-- 预设阴影 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">预设阴影</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="(preset, index) in presets"
          :key="index"
          class="cursor-pointer"
          @click="applyPreset(preset)"
        >
          <div class="flex items-center justify-center h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
            <div
              class="w-16 h-16 bg-white dark:bg-gray-600 rounded-lg"
              :style="{ boxShadow: preset.shadow }"
            />
          </div>
          <p class="text-xs text-center text-gray-600 dark:text-gray-400">{{ preset.name }}</p>
        </div>
      </div>
    </div>

    <!-- CSS 代码 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">CSS 代码</h3>
        <el-button size="small" @click="copyCSS">
          <el-icon><CopyDocument /></el-icon>
          复制代码
        </el-button>
      </div>
      <pre class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm font-mono overflow-x-auto"><code>{{ cssCode }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard } from '@/utils/clipboard'
import { ref, computed } from 'vue'
import { Plus, Delete, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface ShadowLayer {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

const isInset = ref(false)
const offsetX = ref(4)
const offsetY = ref(4)
const blur = ref(10)
const spread = ref(0)
const shadowColor = ref('#000000')
const opacity = ref(25)

const shadowLayers = ref<ShadowLayer[]>([
  { offsetX: 4, offsetY: 4, blur: 10, spread: 0, color: '#000000', inset: false },
])

const presets = [
  {
    name: '柔和',
    shadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
  },
  {
    name: '中等',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  {
    name: '强烈',
    shadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
  },
  {
    name: '内阴影',
    shadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.2)',
  },
  {
    name: '双层',
    shadow: '0 2px 10px rgba(0, 0, 0, 0.1), 0 10px 40px rgba(0, 0, 0, 0.15)',
  },
  {
    name: '彩色',
    shadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
  },
  {
    name: '霓虹',
    shadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
  },
  {
    name: '浮起',
    shadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
]

const boxShadowCSS = computed(() => {
  const layers = shadowLayers.value.map(layer => {
    const inset = layer.inset ? 'inset ' : ''
    return `${inset}${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${layer.color}`
  })
  return layers.join(', ')
})

const cssCode = computed(() => {
  return `box-shadow: ${boxShadowCSS.value};`
})

const addShadowLayer = () => {
  shadowLayers.value.push({
    offsetX: 0,
    offsetY: 4,
    blur: 10,
    spread: 0,
    color: '#000000',
    inset: false,
  })
}

const removeShadowLayer = (index: number) => {
  if (shadowLayers.value.length > 1) {
    shadowLayers.value.splice(index, 1)
  }
}

const applyPreset = (preset: { shadow: string }) => {
  // 解析预设阴影字符串并应用到当前层
  const shadow = preset.shadow
  const presetIsInset = shadow.includes('inset')
  
  // 提取数值：offsetX offsetY blur spread
  const matches = shadow.match(/-?\d+(\.\d+)?/g)
  if (matches && matches.length >= 3) {
    isInset.value = presetIsInset
    offsetX.value = parseFloat(matches[0]) || 0
    offsetY.value = parseFloat(matches[1]) || 0
    blur.value = parseFloat(matches[2]) || 0
    spread.value = parseFloat(matches[3]) || 0
    
    // 提取颜色（rgba或hex）
    const rgbaMatch = shadow.match(/rgba?\([^)]+\)/)
    const hexMatch = shadow.match(/#[0-9a-fA-F]{3,8}/)
    if (rgbaMatch) {
      shadowColor.value = rgbaMatch[0]
      // 从rgba提取透明度
      const alphaMatch = rgbaMatch[0].match(/,\s*([\d.]+)\s*\)/)
      if (alphaMatch) {
        opacity.value = Math.round(parseFloat(alphaMatch[1]) * 100)
      }
    } else if (hexMatch) {
      shadowColor.value = hexMatch[0]
      opacity.value = 100
    }
    
    // 更新第一层的值
    if (shadowLayers.value.length > 0) {
      shadowLayers.value[0] = {
        offsetX: offsetX.value,
        offsetY: offsetY.value,
        blur: blur.value,
        spread: spread.value,
        color: shadowColor.value,
        inset: presetIsInset,
      }
    }
  }
  
  ElMessage.success('已应用预设')
}

const copyCSS = () => {
  copyToClipboard(cssCode.value)
  ElMessage.success('已复制 CSS 代码')
}
</script>
