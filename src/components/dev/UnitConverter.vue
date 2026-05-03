<template>
  <div class="space-y-6">
    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-2 justify-center">
      <el-radio-group v-model="category" size="large">
        <el-radio-button label="length">📏 长度</el-radio-button>
        <el-radio-button label="weight">⚖️ 重量</el-radio-button>
        <el-radio-button label="temperature">🌡️ 温度</el-radio-button>
        <el-radio-button label="area">📐 面积</el-radio-button>
        <el-radio-button label="volume">🧊 体积</el-radio-button>
        <el-radio-button label="speed">🚀 速度</el-radio-button>
        <el-radio-button label="time">⏱️ 时间</el-radio-button>
        <el-radio-button label="data">💾 数据</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Converter -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- From -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">从</h3>
        
        <el-form label-position="top">
          <el-form-item label="单位">
            <el-select v-model="fromUnit" class="w-full" @change="convert">
              <el-option
                v-for="unit in currentUnits"
                :key="unit.value"
                :label="unit.label"
                :value="unit.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="数值">
            <el-input-number
              v-model="fromValue"
              class="w-full"
              :precision="6"
              :controls="false"
              @change="convert"
            />
          </el-form-item>
        </el-form>

        <!-- Quick Values -->
        <div class="mt-4 flex flex-wrap gap-2">
          <el-button size="small" v-for="val in quickValues" :key="val" @click="fromValue = val; convert()">
            {{ val }}
          </el-button>
        </div>
      </div>

      <!-- To -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">到</h3>
        
        <el-form label-position="top">
          <el-form-item label="单位">
            <el-select v-model="toUnit" class="w-full" @change="convert">
              <el-option
                v-for="unit in currentUnits"
                :key="unit.value"
                :label="unit.label"
                :value="unit.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="结果">
            <el-input
              v-model="toValue"
              readonly
              class="w-full"
            />
          </el-form-item>
        </el-form>

        <div class="flex gap-2 mt-4">
          <el-button type="primary" @click="copyResult">
            <el-icon><CopyDocument /></el-icon>
            复制结果
          </el-button>
          <el-button @click="swapUnits">
            <el-icon><Switch /></el-icon>
            交换
          </el-button>
        </div>
      </div>
    </div>

    <!-- All Conversions Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">所有换算结果</h3>
      
      <el-table :data="allConversions" stripe border class="w-full">
        <el-table-column prop="unit" label="单位" width="150" />
        <el-table-column prop="value" label="换算值">
          <template #default="{ row }">
            <span class="font-mono">{{ row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="copyValue(row.value)">
              复制
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CopyDocument, Switch } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const category = ref('length')
const fromUnit = ref('m')
const toUnit = ref('km')
const fromValue = ref(1)
const toValue = ref('')

interface Unit {
  label: string
  value: string
  toBase: (val: number) => number
  fromBase: (val: number) => string
}

interface CategoryUnits {
  [key: string]: {
    units: Unit[]
    quickValues: number[]
  }
}

const unitCategories: CategoryUnits = {
  length: {
    units: [
      { label: '毫米 (mm)', value: 'mm', toBase: v => v / 1000, fromBase: v => (v * 1000).toFixed(4) },
      { label: '厘米 (cm)', value: 'cm', toBase: v => v / 100, fromBase: v => (v * 100).toFixed(4) },
      { label: '米 (m)', value: 'm', toBase: v => v, fromBase: v => v.toFixed(6) },
      { label: '千米 (km)', value: 'km', toBase: v => v * 1000, fromBase: v => (v / 1000).toFixed(6) },
      { label: '英寸 (in)', value: 'in', toBase: v => v * 0.0254, fromBase: v => (v / 0.0254).toFixed(4) },
      { label: '英尺 (ft)', value: 'ft', toBase: v => v * 0.3048, fromBase: v => (v / 0.3048).toFixed(4) },
      { label: '码 (yd)', value: 'yd', toBase: v => v * 0.9144, fromBase: v => (v / 0.9144).toFixed(4) },
      { label: '英里 (mi)', value: 'mi', toBase: v => v * 1609.344, fromBase: v => (v / 1609.344).toFixed(6) },
    ],
    quickValues: [1, 10, 100, 1000],
  },
  weight: {
    units: [
      { label: '毫克 (mg)', value: 'mg', toBase: v => v / 1000000, fromBase: v => (v * 1000000).toFixed(2) },
      { label: '克 (g)', value: 'g', toBase: v => v / 1000, fromBase: v => (v * 1000).toFixed(4) },
      { label: '千克 (kg)', value: 'kg', toBase: v => v, fromBase: v => v.toFixed(6) },
      { label: '吨 (t)', value: 't', toBase: v => v * 1000, fromBase: v => (v / 1000).toFixed(6) },
      { label: '盎司 (oz)', value: 'oz', toBase: v => v * 0.0283495, fromBase: v => (v / 0.0283495).toFixed(4) },
      { label: '磅 (lb)', value: 'lb', toBase: v => v * 0.453592, fromBase: v => (v / 0.453592).toFixed(4) },
    ],
    quickValues: [1, 10, 100, 1000],
  },
  temperature: {
    units: [
      { label: '摄氏度 (°C)', value: 'c', toBase: v => v, fromBase: v => v.toFixed(2) },
      { label: '华氏度 (°F)', value: 'f', toBase: v => (v - 32) * 5 / 9, fromBase: v => (v * 9 / 5 + 32).toFixed(2) },
      { label: '开尔文 (K)', value: 'k', toBase: v => v - 273.15, fromBase: v => (v + 273.15).toFixed(2) },
    ],
    quickValues: [0, 25, 37, 100],
  },
  area: {
    units: [
      { label: '平方毫米 (mm²)', value: 'mm2', toBase: v => v / 1000000, fromBase: v => (v * 1000000).toFixed(2) },
      { label: '平方厘米 (cm²)', value: 'cm2', toBase: v => v / 10000, fromBase: v => (v * 10000).toFixed(4) },
      { label: '平方米 (m²)', value: 'm2', toBase: v => v, fromBase: v => v.toFixed(6) },
      { label: '公顷 (ha)', value: 'ha', toBase: v => v * 10000, fromBase: v => (v / 10000).toFixed(6) },
      { label: '平方千米 (km²)', value: 'km2', toBase: v => v * 1000000, fromBase: v => (v / 1000000).toFixed(6) },
      { label: '英亩 (ac)', value: 'ac', toBase: v => v * 4046.86, fromBase: v => (v / 4046.86).toFixed(6) },
    ],
    quickValues: [1, 100, 1000, 10000],
  },
  volume: {
    units: [
      { label: '毫升 (ml)', value: 'ml', toBase: v => v / 1000, fromBase: v => (v * 1000).toFixed(2) },
      { label: '升 (L)', value: 'l', toBase: v => v, fromBase: v => v.toFixed(6) },
      { label: '立方米 (m³)', value: 'm3', toBase: v => v * 1000, fromBase: v => (v / 1000).toFixed(6) },
      { label: '加仑 (gal)', value: 'gal', toBase: v => v * 3.78541, fromBase: v => (v / 3.78541).toFixed(4) },
    ],
    quickValues: [1, 10, 100, 1000],
  },
  speed: {
    units: [
      { label: '米/秒 (m/s)', value: 'ms', toBase: v => v, fromBase: v => v.toFixed(4) },
      { label: '千米/时 (km/h)', value: 'kmh', toBase: v => v / 3.6, fromBase: v => (v * 3.6).toFixed(2) },
      { label: '英里/时 (mph)', value: 'mph', toBase: v => v * 0.44704, fromBase: v => (v / 0.44704).toFixed(4) },
      { label: '节 (kn)', value: 'kn', toBase: v => v * 0.514444, fromBase: v => (v / 0.514444).toFixed(4) },
    ],
    quickValues: [1, 10, 60, 100],
  },
  time: {
    units: [
      { label: '毫秒 (ms)', value: 'ms', toBase: v => v / 1000, fromBase: v => (v * 1000).toFixed(2) },
      { label: '秒 (s)', value: 's', toBase: v => v, fromBase: v => v.toFixed(4) },
      { label: '分钟 (min)', value: 'min', toBase: v => v * 60, fromBase: v => (v / 60).toFixed(4) },
      { label: '小时 (h)', value: 'h', toBase: v => v * 3600, fromBase: v => (v / 3600).toFixed(4) },
      { label: '天 (d)', value: 'd', toBase: v => v * 86400, fromBase: v => (v / 86400).toFixed(4) },
      { label: '周', value: 'w', toBase: v => v * 604800, fromBase: v => (v / 604800).toFixed(4) },
    ],
    quickValues: [1, 60, 3600, 86400],
  },
  data: {
    units: [
      { label: '字节 (B)', value: 'b', toBase: v => v, fromBase: v => v.toFixed(2) },
      { label: '千字节 (KB)', value: 'kb', toBase: v => v * 1024, fromBase: v => (v / 1024).toFixed(4) },
      { label: '兆字节 (MB)', value: 'mb', toBase: v => v * 1048576, fromBase: v => (v / 1048576).toFixed(4) },
      { label: '吉字节 (GB)', value: 'gb', toBase: v => v * 1073741824, fromBase: v => (v / 1073741824).toFixed(6) },
      { label: '太字节 (TB)', value: 'tb', toBase: v => v * 1099511627776, fromBase: v => (v / 1099511627776).toFixed(6) },
    ],
    quickValues: [1, 1024, 1048576],
  },
}

const currentUnits = computed(() => unitCategories[category.value]?.units || [])
const quickValues = computed(() => unitCategories[category.value]?.quickValues || [])

const allConversions = computed(() => {
  if (!fromValue.value || !currentUnits.value.length) return []
  
  const baseValue = currentUnits.value.find(u => u.value === fromUnit.value)?.toBase(fromValue.value) || 0
  
  return currentUnits.value.map(unit => ({
    unit: unit.label,
    value: unit.fromBase(baseValue),
  }))
})

const convert = () => {
  if (!fromValue.value) {
    toValue.value = ''
    return
  }

  const from = currentUnits.value.find(u => u.value === fromUnit.value)
  const to = currentUnits.value.find(u => u.value === toUnit.value)

  if (!from || !to) return

  const baseValue = from.toBase(fromValue.value)
  toValue.value = to.fromBase(baseValue)
}

const swapUnits = () => {
  const tempUnit = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = tempUnit
  
  if (toValue.value) {
    fromValue.value = parseFloat(toValue.value)
  }
  
  convert()
}

const copyResult = async () => {
  await copyValue(toValue.value)
}

const copyValue = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// Watch category change
watch(category, (newCategory) => {
  const units = unitCategories[newCategory]?.units
  if (units && units.length >= 2) {
    fromUnit.value = units[0].value
    toUnit.value = units[1].value
    fromValue.value = 1
    convert()
  }
}, { immediate: true })

// Initialize
convert()
</script>
