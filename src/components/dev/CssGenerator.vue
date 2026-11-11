<template>
  <div class="space-y-4" data-testid="cssgen-tool">
    <el-radio-group v-model="tab">
      <el-radio-button value="shadow">阴影</el-radio-button>
      <el-radio-button value="gradient">渐变</el-radio-button>
      <el-radio-button value="radius">圆角</el-radio-button>
      <el-radio-button value="bezier">贝塞尔</el-radio-button>
    </el-radio-group>

    <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div class="space-y-3">
        <template v-if="tab === 'shadow'">
          <label class="block text-sm text-gray-500">X <el-slider v-model="shadow.x" :min="-40" :max="40" /></label>
          <label class="block text-sm text-gray-500">Y <el-slider v-model="shadow.y" :min="-40" :max="40" /></label>
          <label class="block text-sm text-gray-500">模糊 <el-slider v-model="shadow.blur" :min="0" :max="80" /></label>
          <label class="block text-sm text-gray-500">扩展 <el-slider v-model="shadow.spread" :min="-20" :max="40" /></label>
          <div class="flex items-center gap-2"><span class="text-sm text-gray-500">颜色</span><el-color-picker v-model="shadow.color" show-alpha /></div>
          <el-checkbox v-model="shadow.inset">内阴影</el-checkbox>
        </template>
        <template v-else-if="tab === 'gradient'">
          <label class="block text-sm text-gray-500">角度 {{ gradient.angle }}°</label>
          <el-slider v-model="gradient.angle" :min="0" :max="360" />
          <div class="flex gap-3"><el-color-picker v-model="gradient.from" /><el-color-picker v-model="gradient.to" /></div>
        </template>
        <template v-else-if="tab === 'radius'">
          <label v-for="corner in corners" :key="corner.key" class="block text-sm text-gray-500">
            {{ corner.label }} {{ radius[corner.key] }}px
            <el-slider v-model="radius[corner.key]" :min="0" :max="80" />
          </label>
        </template>
        <template v-else>
          <label class="block text-sm text-gray-500">x1 {{ bezier.x1.toFixed(2) }} <el-slider v-model="bezier.x1" :min="0" :max="1" :step="0.01" /></label>
          <label class="block text-sm text-gray-500">y1 {{ bezier.y1.toFixed(2) }} <el-slider v-model="bezier.y1" :min="0" :max="1" :step="0.01" /></label>
          <label class="block text-sm text-gray-500">x2 {{ bezier.x2.toFixed(2) }} <el-slider v-model="bezier.x2" :min="0" :max="1" :step="0.01" /></label>
          <label class="block text-sm text-gray-500">y2 {{ bezier.y2.toFixed(2) }} <el-slider v-model="bezier.y2" :min="0" :max="1" :step="0.01" /></label>
        </template>
      </div>
      <div>
        <div class="flex h-40 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900">
          <div class="h-20 w-36 bg-white dark:bg-gray-700" :class="tab === 'bezier' ? 'bezier-box' : ''" :style="previewStyle" />
        </div>
        <pre class="mt-4 overflow-auto rounded-lg bg-gray-950 p-3 text-sm text-green-300">{{ cssText }}</pre>
        <el-button class="mt-3" type="primary" data-testid="cssgen-copy" @click="copy">复制 CSS</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { copyToClipboard } from '@/utils/clipboard'

const tab = ref<'shadow' | 'gradient' | 'radius' | 'bezier'>('shadow')
const shadow = reactive({ x: 8, y: 12, blur: 24, spread: 0, color: 'rgba(15, 23, 42, 0.18)', inset: false })
const gradient = reactive({ angle: 135, from: '#2563eb', to: '#7c3aed' })
const radius = reactive({ tl: 16, tr: 16, br: 16, bl: 16 })
const bezier = reactive({ x1: 0.4, y1: 0, x2: 0.2, y2: 1 })
const corners = [
  { key: 'tl' as const, label: '左上' },
  { key: 'tr' as const, label: '右上' },
  { key: 'br' as const, label: '右下' },
  { key: 'bl' as const, label: '左下' },
]

const cssText = computed(() => {
  if (tab.value === 'shadow') {
    return `box-shadow: ${shadow.inset ? 'inset ' : ''}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color};`
  }
  if (tab.value === 'gradient') return `background: linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to});`
  if (tab.value === 'radius') return `border-radius: ${radius.tl}px ${radius.tr}px ${radius.br}px ${radius.bl}px;`
  return `transition-timing-function: cubic-bezier(${bezier.x1}, ${bezier.y1}, ${bezier.x2}, ${bezier.y2});`
})

const previewStyle = computed(() => {
  if (tab.value === 'shadow') return { boxShadow: cssText.value.replace('box-shadow: ', '').replace(';', '') }
  if (tab.value === 'gradient') return { background: `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})` }
  if (tab.value === 'radius') return { borderRadius: `${radius.tl}px ${radius.tr}px ${radius.br}px ${radius.bl}px`, background: '#2563eb' }
  return { animationTimingFunction: `cubic-bezier(${bezier.x1}, ${bezier.y1}, ${bezier.x2}, ${bezier.y2})` }
})

const copy = async () => {
  await copyToClipboard(cssText.value)
  ElMessage.success('已复制')
}
</script>

<style scoped>
.bezier-box {
  animation: slide 1.4s infinite alternate;
}
@keyframes slide {
  from { transform: translateX(-36px); }
  to { transform: translateX(36px); }
}
</style>
