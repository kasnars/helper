<template>
  <div class="space-y-4">
    <!-- Results grid -->
    <div
      v-if="results.length > 0"
      class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            生成结果 ({{ results.length }}个)
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            算法: {{ algorithmName }}
          </p>
        </div>
        <el-button type="primary" plain size="small" @click="copyAll">
          <template #icon>
            <el-icon><CopyDocument /></el-icon>
          </template>
          复制全部
        </el-button>
      </div>

      <!-- Number cards with stagger animation -->
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <div
          v-for="(num, index) in results"
          :key="`${num}-${index}`"
          class="stagger-item relative group"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="aspect-square flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-2xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-200 hover:shadow-md hover:scale-105">
            <!-- Rolling animation for newly generated numbers -->
            <span
              v-if="isNewGeneration"
              class="animate-number-roll"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              {{ num }}
            </span>
            <span v-else>{{ num }}</span>
          </div>
          
          <!-- Copy individual button -->
          <button
            @click="copySingle(num)"
            class="absolute top-1 right-1 w-6 h-6 bg-white dark:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            title="复制"
          >
            <el-icon :size="12" class="text-gray-600 dark:text-gray-300">
              <CopyDocument />
            </el-icon>
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <span class="text-xs text-gray-500 dark:text-gray-400">最小</span>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ stats.min }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-500 dark:text-gray-400">最大</span>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ stats.max }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-500 dark:text-gray-400">平均</span>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ stats.avg }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center"
    >
      <el-icon :size="48" class="text-gray-300 dark:text-gray-600 mb-4">
        <CircleCheckFilled />
      </el-icon>
      <p class="text-gray-500 dark:text-gray-400">点击"生成随机数"按钮开始</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CopyDocument, CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRandomStore } from '../../stores'
import { RandomAlgorithmFactory } from '../../utils/randomAlgorithms'

interface Props {
  results: number[]
}

const props = defineProps<Props>()

const randomStore = useRandomStore()

const isNewGeneration = ref(false)

// 获取当前算法名称
const algorithmName = computed(() => {
  const algo = randomStore.config.algorithm || 'random'
  const info = RandomAlgorithmFactory.getAlgorithmInfo().find(a => a.value === algo)
  return info ? info.name : 'Math.random()'
})

// Calculate statistics
const stats = computed(() => {
  if (props.results.length === 0) {
    return { min: 0, max: 0, avg: 0 }
  }
  const min = Math.min(...props.results)
  const max = Math.max(...props.results)
  const avg = Math.round((props.results.reduce((a, b) => a + b, 0) / props.results.length) * 100) / 100
  return { min, max, avg }
})

// Watch for new results to trigger animation
let prevLength = 0
watch(() => props.results, (newVal) => {
  if (newVal.length > 0 && newVal.length !== prevLength) {
    isNewGeneration.value = true
    prevLength = newVal.length
    setTimeout(() => {
      isNewGeneration.value = false
    }, 1000)
  }
}, { deep: true })

const copySingle = async (num: number) => {
  try {
    await navigator.clipboard.writeText(num.toString())
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const copyAll = async () => {
  try {
    const text = props.results.join(', ')
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制全部结果')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>
