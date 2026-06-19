<template>
  <div class="space-y-6">
    <!-- Flexbox 配置 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Flexbox 练习场</h3>
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 容器属性 -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">容器属性</h4>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">flex-direction</label>
            <el-select v-model="containerProps.flexDirection" class="w-full">
              <el-option label="row" value="row" />
              <el-option label="row-reverse" value="row-reverse" />
              <el-option label="column" value="column" />
              <el-option label="column-reverse" value="column-reverse" />
            </el-select>
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">justify-content</label>
            <el-select v-model="containerProps.justifyContent" class="w-full">
              <el-option label="flex-start" value="flex-start" />
              <el-option label="flex-end" value="flex-end" />
              <el-option label="center" value="center" />
              <el-option label="space-between" value="space-between" />
              <el-option label="space-around" value="space-around" />
              <el-option label="space-evenly" value="space-evenly" />
            </el-select>
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">align-items</label>
            <el-select v-model="containerProps.alignItems" class="w-full">
              <el-option label="flex-start" value="flex-start" />
              <el-option label="flex-end" value="flex-end" />
              <el-option label="center" value="center" />
              <el-option label="stretch" value="stretch" />
              <el-option label="baseline" value="baseline" />
            </el-select>
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">flex-wrap</label>
            <el-select v-model="containerProps.flexWrap" class="w-full">
              <el-option label="nowrap" value="nowrap" />
              <el-option label="wrap" value="wrap" />
              <el-option label="wrap-reverse" value="wrap-reverse" />
            </el-select>
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">gap: {{ containerProps.gap }}px</label>
            <el-slider v-model="containerProps.gap" :min="0" :max="50" />
          </div>
        </div>

        <!-- 子元素属性 -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">子元素属性</h4>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">align-self</label>
            <el-select v-model="childProps.alignSelf" class="w-full">
              <el-option label="auto" value="auto" />
              <el-option label="flex-start" value="flex-start" />
              <el-option label="flex-end" value="flex-end" />
              <el-option label="center" value="center" />
              <el-option label="stretch" value="stretch" />
            </el-select>
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">flex-grow: {{ childProps.flexGrow }}</label>
            <el-slider v-model="childProps.flexGrow" :min="0" :max="10" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">flex-shrink: {{ childProps.flexShrink }}</label>
            <el-slider v-model="childProps.flexShrink" :min="0" :max="10" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">flex-basis</label>
            <el-input v-model="childProps.flexBasis" placeholder="auto, 100px, 50%" />
          </div>
        </div>
      </div>
    </div>

    <!-- 子元素管理 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">子元素 ({{ items.length }})</h3>
        <div class="flex gap-2">
          <el-button size="small" @click="addItem">
            <el-icon><Plus /></el-icon>
            添加元素
          </el-button>
          <el-button size="small" @click="removeItem" :disabled="items.length <= 1">
            <el-icon><Minus /></el-icon>
            移除元素
          </el-button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <el-tag
          v-for="(item, index) in items"
          :key="index"
          :type="selectedIndex === index ? '' : 'info'"
          class="cursor-pointer"
          @click="selectedIndex = index"
        >
          {{ item.label }}
        </el-tag>
      </div>
    </div>

    <!-- 预览 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">预览</h3>
      <div
        class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[200px]"
        :style="containerStyle"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all"
          :class="item.color"
          :style="getChildStyle(index)"
        >
          {{ item.label }}
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
import { ref, computed } from 'vue'
import { Plus, Minus, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface ContainerProps {
  flexDirection: string
  justifyContent: string
  alignItems: string
  flexWrap: string
  gap: number
}

interface ChildProps {
  alignSelf: string
  flexGrow: number
  flexShrink: number
  flexBasis: string
}

interface FlexItem {
  label: string
  color: string
  width: number
  height: number
}

const containerProps = ref<ContainerProps>({
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  flexWrap: 'nowrap',
  gap: 10,
})

const childProps = ref<ChildProps>({
  alignSelf: 'auto',
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
})

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-red-500',
  'bg-yellow-500',
]

const items = ref<FlexItem[]>([
  { label: '1', color: 'bg-blue-500', width: 80, height: 60 },
  { label: '2', color: 'bg-green-500', width: 80, height: 80 },
  { label: '3', color: 'bg-purple-500', width: 80, height: 50 },
])

const selectedIndex = ref(0)

const containerStyle = computed(() => ({
  display: 'flex',
  flexDirection: containerProps.value.flexDirection as any,
  justifyContent: containerProps.value.justifyContent,
  alignItems: containerProps.value.alignItems,
  flexWrap: containerProps.value.flexWrap as any,
  gap: `${containerProps.value.gap}px`,
}))

const getChildStyle = (index: number) => {
  const item = items.value[index]
  const style: Record<string, string> = {
    width: `${item.width}px`,
    height: `${item.height}px`,
  }

  if (index === selectedIndex.value) {
    if (childProps.value.alignSelf !== 'auto') {
      style.alignSelf = childProps.value.alignSelf
    }
    if (childProps.value.flexGrow > 0) {
      style.flexGrow = childProps.value.flexGrow.toString()
    }
    if (childProps.value.flexShrink !== 1) {
      style.flexShrink = childProps.value.flexShrink.toString()
    }
    if (childProps.value.flexBasis !== 'auto') {
      style.flexBasis = childProps.value.flexBasis
    }
  }

  return style
}

const cssCode = computed(() => {
  let code = `.container {\n`
  code += `  display: flex;\n`
  code += `  flex-direction: ${containerProps.value.flexDirection};\n`
  code += `  justify-content: ${containerProps.value.justifyContent};\n`
  code += `  align-items: ${containerProps.value.alignItems};\n`
  code += `  flex-wrap: ${containerProps.value.flexWrap};\n`
  code += `  gap: ${containerProps.value.gap}px;\n`
  code += `}\n`

  if (childProps.value.alignSelf !== 'auto' ||
      childProps.value.flexGrow > 0 ||
      childProps.value.flexShrink !== 1 ||
      childProps.value.flexBasis !== 'auto') {
    code += `\n.item {\n`
    if (childProps.value.alignSelf !== 'auto') {
      code += `  align-self: ${childProps.value.alignSelf};\n`
    }
    if (childProps.value.flexGrow > 0) {
      code += `  flex-grow: ${childProps.value.flexGrow};\n`
    }
    if (childProps.value.flexShrink !== 1) {
      code += `  flex-shrink: ${childProps.value.flexShrink};\n`
    }
    if (childProps.value.flexBasis !== 'auto') {
      code += `  flex-basis: ${childProps.value.flexBasis};\n`
    }
    code += `}`
  }

  return code
})

const addItem = () => {
  const newIndex = items.value.length + 1
  items.value.push({
    label: newIndex.toString(),
    color: colors[(newIndex - 1) % colors.length],
    width: 60 + Math.random() * 40,
    height: 40 + Math.random() * 40,
  })
}

const removeItem = () => {
  if (items.value.length > 1) {
    items.value.pop()
    if (selectedIndex.value >= items.value.length) {
      selectedIndex.value = items.value.length - 1
    }
  }
}

const copyCSS = () => {
  navigator.clipboard.writeText(cssCode.value)
  ElMessage.success('已复制 CSS 代码')
}
</script>
