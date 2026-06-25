<template>
  <div class="space-y-6">
    <!-- 渐变类型选择 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">CSS 渐变生成器</h3>
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">渐变类型:</label>
          <el-radio-group v-model="gradientType">
            <el-radio-button value="linear">线性渐变</el-radio-button>
            <el-radio-button value="radial">径向渐变</el-radio-button>
            <el-radio-button value="conic">锥形渐变</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 线性渐变角度 -->
        <div v-if="gradientType === 'linear'" class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">角度:</label>
          <el-slider v-model="angle" :min="0" :max="360" :step="1" class="flex-1" />
          <span class="text-sm font-mono text-gray-900 dark:text-white w-12">{{ angle }}°</span>
        </div>

        <!-- 径向渐变形状 -->
        <div v-if="gradientType === 'radial'" class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">形状:</label>
          <el-radio-group v-model="radialShape">
            <el-radio-button value="ellipse">椭圆</el-radio-button>
            <el-radio-button value="circle">圆形</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <!-- 颜色节点 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">颜色节点</h3>
        <el-button size="small" @click="addColorStop">
          <el-icon><Plus /></el-icon>
          添加节点
        </el-button>
      </div>
      <div class="space-y-3">
        <div
          v-for="(stop, index) in colorStops"
          :key="index"
          class="flex items-center gap-3"
        >
          <el-color-picker v-model="stop.color" />
          <el-slider v-model="stop.position" :min="0" :max="100" :step="1" class="flex-1" />
          <span class="text-sm font-mono text-gray-900 dark:text-white w-12">{{ stop.position }}%</span>
          <el-button
            size="small"
            type="danger"
            :icon="Delete"
            circle
            @click="removeColorStop(index)"
            :disabled="colorStops.length <= 2"
          />
        </div>
      </div>
    </div>

    <!-- 预览 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">预览</h3>
      <div
        class="w-full h-48 rounded-lg border border-gray-200 dark:border-gray-700"
        :style="{ background: gradientCSS }"
      />
    </div>

    <!-- 预设渐变 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">预设渐变</h3>
      <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        <div
          v-for="(preset, index) in presets"
          :key="index"
          class="w-full h-12 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
          :style="{ background: preset.gradient }"
          @click="applyPreset(preset)"
        />
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

interface ColorStop {
  color: string
  position: number
}

interface Preset {
  name: string
  gradient: string
  stops: ColorStop[]
  type: string
  angle?: number
}

const gradientType = ref('linear')
const angle = ref(90)
const radialShape = ref('ellipse')

const colorStops = ref<ColorStop[]>([
  { color: '#3b82f6', position: 0 },
  { color: '#8b5cf6', position: 100 },
])

const presets: Preset[] = [
  {
    name: 'Sunset',
    gradient: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)',
    stops: [
      { color: '#f97316', position: 0 },
      { color: '#ec4899', position: 50 },
      { color: '#8b5cf6', position: 100 },
    ],
    type: 'linear',
    angle: 135,
  },
  {
    name: 'Ocean',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
    stops: [
      { color: '#06b6d4', position: 0 },
      { color: '#3b82f6', position: 50 },
      { color: '#8b5cf6', position: 100 },
    ],
    type: 'linear',
    angle: 135,
  },
  {
    name: 'Forest',
    gradient: 'linear-gradient(135deg, #10b981, #059669, #047857)',
    stops: [
      { color: '#10b981', position: 0 },
      { color: '#059669', position: 50 },
      { color: '#047857', position: 100 },
    ],
    type: 'linear',
    angle: 135,
  },
  {
    name: 'Fire',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316, #eab308)',
    stops: [
      { color: '#ef4444', position: 0 },
      { color: '#f97316', position: 50 },
      { color: '#eab308', position: 100 },
    ],
    type: 'linear',
    angle: 135,
  },
  {
    name: 'Purple',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc)',
    stops: [
      { color: '#8b5cf6', position: 0 },
      { color: '#a855f7', position: 50 },
      { color: '#c084fc', position: 100 },
    ],
    type: 'linear',
    angle: 135,
  },
  {
    name: 'Rainbow',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316, #eab308, #10b981, #3b82f6, #8b5cf6)',
    stops: [
      { color: '#ef4444', position: 0 },
      { color: '#f97316', position: 20 },
      { color: '#eab308', position: 40 },
      { color: '#10b981', position: 60 },
      { color: '#3b82f6', position: 80 },
      { color: '#8b5cf6', position: 100 },
    ],
    type: 'linear',
    angle: 135,
  },
]

const gradientCSS = computed(() => {
  const sortedStops = [...colorStops.value].sort((a, b) => a.position - b.position)
  const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')

  switch (gradientType.value) {
    case 'linear':
      return `linear-gradient(${angle.value}deg, ${stopsStr})`
    case 'radial':
      return `radial-gradient(${radialShape.value}, ${stopsStr})`
    case 'conic':
      return `conic-gradient(from ${angle.value}deg, ${stopsStr})`
    default:
      return ''
  }
})

const cssCode = computed(() => {
  return `background: ${gradientCSS.value};`
})

const addColorStop = () => {
  const lastStop = colorStops.value[colorStops.value.length - 1]
  colorStops.value.push({
    color: '#ffffff',
    position: Math.min(lastStop.position + 10, 100),
  })
}

const removeColorStop = (index: number) => {
  if (colorStops.value.length > 2) {
    colorStops.value.splice(index, 1)
  }
}

const applyPreset = (preset: Preset) => {
  colorStops.value = [...preset.stops]
  gradientType.value = preset.type
  if (preset.angle !== undefined) {
    angle.value = preset.angle
  }
}

const copyCSS = () => {
  copyToClipboard(cssCode.value)
  ElMessage.success('已复制 CSS 代码')
}
</script>
