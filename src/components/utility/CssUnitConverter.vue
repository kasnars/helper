<template>
  <div class="space-y-6">
    <!-- 标题 -->
    <div>
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📐 CSS 单位转换器</h3>
      <p class="text-sm text-gray-500">输入数值和单位，实时转换 px / rem / vw / em</p>
    </div>

    <!-- 配置区域 -->
    <div class="flex flex-wrap gap-4 items-end p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Root Font Size</label>
        <el-input-number v-model="rootFontSize" :min="1" :max="100" :step="1" class="w-28" />
        <span class="text-sm text-gray-500">px</span>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Viewport Width</label>
        <el-input-number v-model="viewportWidth" :min="1" :max="2560" :step="1" class="w-28" />
        <span class="text-sm text-gray-500">px</span>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Em 基准值</label>
        <el-input-number v-model="emBase" :min="1" :max="100" :step="1" class="w-28" />
        <span class="text-sm text-gray-500">px</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 数值输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入数值</label>
        <div class="flex gap-2">
          <el-input-number v-model="inputValue" :min="0" :step="1" :precision="4" class="flex-1" />
          <el-select v-model="inputUnit" class="w-32">
            <el-option v-for="u in units" :key="u.value" :label="u.label" :value="u.value" />
          </el-select>
        </div>
      </div>

      <!-- 快捷输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">快捷输入</label>
        <el-input
          v-model="quickInput"
          placeholder="例如: 16px, 2rem, 50vw, 1.5em"
          @keyup.enter="parseQuickInput"
        />
      </div>
    </div>

    <!-- 转换结果表格 -->
    <div v-if="results.length > 0">
      <h4 class="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">🔄 转换结果</h4>
      <div class="overflow-auto border rounded-xl">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-b">单位</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-b">换算值</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-b">说明</th>
              <th class="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in results"
              :key="i"
              class="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': item.isSource }"
            >
              <td class="px-4 py-3 font-mono font-medium text-gray-800 dark:text-gray-200">
                {{ item.unit }}
                <el-tag v-if="item.isSource" size="small" type="primary" class="ml-2">源</el-tag>
              </td>
              <td class="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                {{ item.value }}
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">
                {{ item.description }}
              </td>
              <td class="px-4 py-3 text-center">
                <el-button size="small" text type="primary" @click="copyValue(item.value)">
                  <el-icon><DocumentCopy /></el-icon> 复制
                </el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex items-center justify-center h-32 text-gray-400 border-2 border-dashed rounded-xl">
      输入数值开始转换
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const rootFontSize = ref(16)
const viewportWidth = ref(375)
const emBase = ref(16)
const inputValue = ref(0)
const inputUnit = ref('px')
const quickInput = ref('')

interface UnitOption {
  label: string
  value: string
}

const units: UnitOption[] = [
  { label: 'px (像素)', value: 'px' },
  { label: 'rem', value: 'rem' },
  { label: 'vw (视口宽)', value: 'vw' },
  { label: 'em', value: 'em' },
]

interface ResultItem {
  unit: string
  value: string
  description: string
  isSource: boolean
}

// 转换核心逻辑
function convert(value: number, fromUnit: string, rootFs: number, vpWidth: number, emBaseVal: number): Record<string, string> {
  // 先转成 px
  let px = 0
  switch (fromUnit) {
    case 'px':
      px = value
      break
    case 'rem':
      px = value * rootFs
      break
    case 'vw':
      px = (value / 100) * vpWidth
      break
    case 'em':
      px = value * emBaseVal
      break
  }

  // 再转到各个目标单位
  const results: Record<string, string> = {
    px: px.toFixed(2) + 'px',
    rem: (px / rootFs).toFixed(4) + 'rem',
    vw: ((px / vpWidth) * 100).toFixed(4) + 'vw',
    em: (px / emBaseVal).toFixed(4) + 'em',
  }
  return results
}

const results = computed<ResultItem[]>(() => {
  if (inputValue.value === 0 && inputUnit.value === 'px' && !quickInput.value) return []

  const converted = convert(inputValue.value, inputUnit.value, rootFontSize.value, viewportWidth.value, emBase.value)

  const descriptions: Record<string, string> = {
    px: `基准: ${rootFontSize.value}px`,
    rem: `1rem = ${rootFontSize.value}px`,
    vw: `1vw = ${viewportWidth.value / 100}px (视口${viewportWidth.value}px)`,
    em: `1em = ${emBase.value}px`,
  }

  return units.map(u => ({
    unit: u.value,
    value: converted[u.value],
    description: descriptions[u.value],
    isSource: u.value === inputUnit.value,
  }))
})

function parseQuickInput() {
  const match = quickInput.value.trim().match(/^([\d.]+)\s*(px|rem|vw|em)$/i)
  if (!match) {
    ElMessage.warning('格式错误，请输入如 16px, 2rem, 50vw, 1.5em')
    return
  }
  inputValue.value = parseFloat(match[1])
  inputUnit.value = match[2].toLowerCase()
}

async function copyValue(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success(`已复制: ${value}`)
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>
