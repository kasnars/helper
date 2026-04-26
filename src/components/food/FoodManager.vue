<template>
  <div class="space-y-4">
    <!-- Add new option -->
    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">添加新选项</h4>
      <div class="flex flex-wrap gap-2">
        <el-input
          v-model="newOption.name"
          placeholder="输入菜品名称"
          class="flex-1 min-w-[120px]"
        />
        <el-select v-model="newOption.category" class="w-24">
          <el-option label="午餐" value="lunch" />
          <el-option label="晚餐" value="dinner" />
        </el-select>
        <el-input
          v-model="newOption.emoji"
          placeholder="Emoji"
          class="w-16"
        />
        <el-button type="primary" @click="addNewOption" :disabled="!newOption.name">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- Options list -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          选项列表 ({{ filteredOptions.length }})
        </h4>
        <el-radio-group v-model="filter" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="lunch">午餐</el-radio-button>
          <el-radio-button label="dinner">晚餐</el-radio-button>
        </el-radio-group>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        <div
          v-for="option in filteredOptions"
          :key="option.id"
          class="group relative flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <span class="text-lg">{{ option.emoji }}</span>
          <span class="flex-1 text-sm truncate">{{ option.name }}</span>
          <el-tag size="small" :type="option.category === 'lunch' ? 'success' : 'warning'" class="text-xs">
            {{ option.category === 'lunch' ? '午' : '晚' }}
          </el-tag>
          
          <!-- Delete button for custom options -->
          <button
            v-if="!option.isBuiltin"
            @click="deleteOption(option.id!)"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
          >
            <el-icon :size="12"><Close /></el-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Close } from '@element-plus/icons-vue'
import { useFoodStore } from '../../stores'

const foodStore = useFoodStore()
const filter = ref<'all' | 'lunch' | 'dinner'>('all')

const newOption = ref({
  name: '',
  emoji: '🍜',
  category: 'lunch' as 'lunch' | 'dinner',
})

const filteredOptions = computed(() => {
  if (filter.value === 'all') {
    return foodStore.options
  }
  return foodStore.options.filter(o => o.category === filter.value)
})

const addNewOption = async () => {
  if (!newOption.value.name.trim()) return
  
  await foodStore.addOption({
    name: newOption.value.name.trim(),
    emoji: newOption.value.emoji || '🍜',
    category: newOption.value.category,
    weight: 5,
    isBuiltin: false,
  })
  
  newOption.value = {
    name: '',
    emoji: '🍜',
    category: 'lunch',
  }
}

const deleteOption = async (id: number) => {
  await foodStore.deleteOption(id)
}
</script>
