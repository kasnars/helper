<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 输入 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">🎤 输入文本</h3>
        <el-input
          v-model="text"
          type="textarea"
          :rows="8"
          placeholder="输入要朗读的文本..."
        />
        <div class="mt-4 space-y-3">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">语音</label>
            <el-select v-model="selectedVoice" class="w-full">
              <el-option
                v-for="voice in voices"
                :key="voice.name"
                :label="`${voice.name} (${voice.lang})`"
                :value="voice.name"
              />
            </el-select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">语速: {{ rate }}</label>
              <el-slider v-model="rate" :min="0.5" :max="2" :step="0.1" />
            </div>
            <div>
              <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">音调: {{ pitch }}</label>
              <el-slider v-model="pitch" :min="0.5" :max="2" :step="0.1" />
            </div>
          </div>
        </div>
      </div>

      <!-- 控制 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">🔊 播放控制</h3>
        <div class="flex gap-3 mb-4">
          <el-button type="primary" size="large" @click="speak" :disabled="!text || isSpeaking">
            <el-icon><VideoPlay /></el-icon> 播放
          </el-button>
          <el-button size="large" @click="pause" :disabled="!isSpeaking">
            <el-icon><VideoPause /></el-icon> 暂停
          </el-button>
          <el-button size="large" @click="stop" :disabled="!isSpeaking">
            <el-icon><CloseBold /></el-icon> 停止
          </el-button>
        </div>

        <!-- 状态 -->
        <div class="p-4 rounded-xl" :class="statusClass">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'" />
            <span class="font-medium">{{ statusText }}</span>
          </div>
        </div>

        <!-- 快速示例 -->
        <div class="mt-4">
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">快速示例</h4>
          <div class="flex flex-wrap gap-2">
            <el-button size="small" @click="text = '你好，欢迎使用文字转语音工具。这是一个纯前端实现的功能。'">中文示例</el-button>
            <el-button size="small" @click="text = 'Hello! This is a text to speech demo. Built with Web Speech API.'">英文示例</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VideoPlay, VideoPause, CloseBold } from '@element-plus/icons-vue'

const text = ref('')
const rate = ref(1)
const pitch = ref(1)
const selectedVoice = ref('')
const voices = ref<SpeechSynthesisVoice[]>([])
const isSpeaking = ref(false)
const isPaused = ref(false)

let utterance: SpeechSynthesisUtterance | null = null

onMounted(() => {
  const loadVoices = () => {
    voices.value = speechSynthesis.getVoices()
    // 默认选中中文语音
    if (!selectedVoice.value && voices.value.length) {
      const zhVoice = voices.value.find(v => v.lang.startsWith('zh'))
      if (zhVoice) selectedVoice.value = zhVoice.name
      else selectedVoice.value = voices.value[0].name
    }
  }
  loadVoices()
  speechSynthesis.onvoiceschanged = loadVoices
})

onUnmounted(() => {
  speechSynthesis.cancel()
})

const speak = () => {
  if (!text.value) return

  if (isPaused.value) {
    speechSynthesis.resume()
    isPaused.value = false
    isSpeaking.value = true
    return
  }

  speechSynthesis.cancel()
  utterance = new SpeechSynthesisUtterance(text.value)
  utterance.rate = rate.value
  utterance.pitch = pitch.value

  const voice = voices.value.find(v => v.name === selectedVoice.value)
  if (voice) utterance.voice = voice

  utterance.onend = () => {
    isSpeaking.value = false
    isPaused.value = false
  }

  speechSynthesis.speak(utterance)
  isSpeaking.value = true
  isPaused.value = false
}

const pause = () => {
  speechSynthesis.pause()
  isPaused.value = true
  isSpeaking.value = false
}

const stop = () => {
  speechSynthesis.cancel()
  isSpeaking.value = false
  isPaused.value = false
}

const statusText = computed(() => {
  if (isPaused.value) return '已暂停'
  if (isSpeaking.value) return '正在朗读...'
  return '就绪'
})

const statusClass = computed(() => {
  if (isPaused.value) return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
  if (isSpeaking.value) return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
  return 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
})
</script>
