<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎲 随机数生成
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          生成指定范围内的随机数
        </p>
      </div>

      <!-- Content -->
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Configuration -->
        <RandomConfig />

        <!-- Results -->
        <RandomResult :results="randomStore.results" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRandomStore } from '../stores'
import RandomConfig from '../components/random/RandomConfig.vue'
import RandomResult from '../components/random/RandomResult.vue'

const randomStore = useRandomStore()

onMounted(async () => {
  await randomStore.loadConfig()
})
</script>
