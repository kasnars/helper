<template>
  <div class="wheel-container relative">
    <!-- Pointer -->
    <div class="wheel-pointer" />
    
    <!-- Canvas -->
    <canvas
      ref="canvasRef"
      :width="size"
      :height="size"
      class="transition-transform duration-100"
      :style="{ transform: `rotate(${rotation}deg)` }"
    />
    
    <!-- Center button -->
    <button
      @click="spin"
      :disabled="isSpinning"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20"
    >
      <span v-if="isSpinning" class="text-sm">...</span>
      <span v-else class="text-sm">开始</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  options: Array<{ name: string; emoji: string; color?: string }>
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 300,
})

const emit = defineEmits<{
  (e: 'select', option: { name: string; emoji: string; index: number }): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const rotation = ref(0)
const isSpinning = ref(false)

// Colors for wheel segments
const defaultColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#A855F7', '#EAB308', '#EF4444', '#3B82F6',
]

const drawWheel = () => {
  if (!canvasRef.value || props.options.length === 0) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const centerX = props.size / 2
  const centerY = props.size / 2
  const radius = props.size / 2 - 10

  ctx.clearRect(0, 0, props.size, props.size)

  const anglePerSegment = (2 * Math.PI) / props.options.length

  props.options.forEach((option, index) => {
    const startAngle = index * anglePerSegment - Math.PI / 2
    const endAngle = (index + 1) * anglePerSegment - Math.PI / 2

    // Draw segment
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = option.color || defaultColors[index % defaultColors.length]
    ctx.fill()
    ctx.stroke()

    // Draw text
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(startAngle + anglePerSegment / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px sans-serif'
    
    const text = `${option.emoji} ${option.name}`
    ctx.fillText(text, radius - 20, 5)
    ctx.restore()
  })

  // Draw center circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 2
  ctx.stroke()
}

// Easing function for smooth stop
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

const easeOutBack = (t: number): number => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

const spin = () => {
  if (isSpinning.value || props.options.length === 0) return

  isSpinning.value = true
  
  const duration = 4000 // 4 seconds
  const startTime = Date.now()
  const startRotation = rotation.value
  const minSpins = 5
  const extraSpins = Math.random() * 3
  const totalRotation = (minSpins + extraSpins) * 360

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Use easeOutCubic for most of the animation, then easeOutBack for slight bounce
    let eased: number
    if (progress < 0.9) {
      eased = easeOutCubic(progress / 0.9) * 0.9
    } else {
      const bounceProgress = (progress - 0.9) / 0.1
      eased = 0.9 + easeOutBack(bounceProgress) * 0.1
    }
    
    rotation.value = startRotation + totalRotation * eased

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      // Animation complete
      isSpinning.value = false
      
      // Calculate selected option
      const finalRotation = rotation.value % 360
      const anglePerSegment = 360 / props.options.length
      const selectedIndex = Math.floor((360 - finalRotation + anglePerSegment / 2) / anglePerSegment) % props.options.length
      
      emit('select', {
        ...props.options[selectedIndex],
        index: selectedIndex,
      })
    }
  }

  requestAnimationFrame(animate)
}

// Redraw when options change
watch(() => props.options, drawWheel, { deep: true })

onMounted(() => {
  drawWheel()
})

// Expose spin method for parent component
defineExpose({
  spin
})
</script>
