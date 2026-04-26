<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🍜 今天吃什么
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          不知道吃什么？让命运轮盘帮你决定！
        </p>
      </div>

      <!-- Main content -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Left: Wheel -->
        <div class="flex flex-col items-center">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full">
            <FoodWheel
              :options="wheelOptions"
              :size="wheelSize"
              @select="onWheelSelect"
            />
          </div>
          
          <!-- Quick filter -->
          <div class="mt-4 flex gap-2">
            <el-radio-group v-model="categoryFilter" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="lunch">午餐</el-radio-button>
              <el-radio-button label="dinner">晚餐</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- Right: Options & History -->
        <div class="space-y-6">
          <!-- Options manager -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <FoodManager />
          </div>

          <!-- History -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">历史记录</h3>
              <el-button
                v-if="foodStore.history.length > 0"
                type="danger"
                link
                size="small"
                @click="clearHistory"
              >
                清空
              </el-button>
            </div>
            
            <div v-if="foodStore.history.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500">
              <el-icon :size="32" class="mb-2">
                <Timer />
              </el-icon>
              <p class="text-sm">暂无记录</p>
            </div>
            
            <div v-else class="space-y-2">
              <div
                v-for="(record, index) in foodStore.history"
                :key="index"
                class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span class="text-sm text-gray-900 dark:text-white">{{ record.result }}</span>
                <span class="text-xs text-gray-400 dark:text-gray-500">
                  {{ formatTime(record.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Result modal -->
      <FoodResult
        :visible="showResult"
        :title="selectedResult?.name || ''"
        :subtitle="`就是它了！${selectedResult?.name || ''}`"
        :emoji="selectedResult?.emoji || '🎉'"
        @close="showResult = false"
        @again="spinAgain"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Timer } from '@element-plus/icons-vue'
import { useFoodStore } from '../stores'
import FoodWheel from '../components/food/FoodWheel.vue'
import FoodManager from '../components/food/FoodManager.vue'
import FoodResult from '../components/food/FoodResult.vue'

const foodStore = useFoodStore()
const categoryFilter = ref<'all' | 'lunch' | 'dinner'>('all')
const showResult = ref(false)
const selectedResult = ref<{ name: string; emoji: string } | null>(null)

// Responsive wheel size
const wheelSize = computed(() => {
  const width = window.innerWidth
  if (width < 640) return 260
  if (width < 1024) return 280
  return 320
})

// Filter options based on category
const wheelOptions = computed(() => {
  let options = foodStore.options
  if (categoryFilter.value !== 'all') {
    options = options.filter(o => o.category === categoryFilter.value)
  }
  return options.map(o => ({
    name: o.name,
    emoji: o.emoji,
  }))
})

// Watch for options changes to reload
onMounted(async () => {
  await foodStore.loadOptions()
  await foodStore.loadHistory()
})

// Handle wheel selection
const onWheelSelect = async (result: { name: string; emoji: string }) => {
  selectedResult.value = result
  showResult.value = true
  await foodStore.addHistory(`${result.emoji} ${result.name}`)
}

const spinAgain = () => {
  showResult.value = false
  selectedResult.value = null
}

const clearHistory = async () => {
  await foodStore.clearHistory()
}

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// Reload options when they change
watch(() => foodStore.options, () => {
  // Options updated
}, { deep: true })
</script>
