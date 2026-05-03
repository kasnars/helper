<template>
  <div class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">水印设置</h3>
        
        <!-- Upload Image -->
        <el-upload
          drag
          accept="image/*"
          :auto-upload="false"
          :on-change="handleImageUpload"
          class="mb-4"
        >
          <el-icon :size="48" class="text-gray-400"><Upload /></el-icon>
          <div class="el-upload__text">拖拽图片到此处或 <em>点击上传</em></div>
        </el-upload>

        <!-- Watermark Type -->
        <el-form label-position="top" class="space-y-4">
          <el-form-item label="水印类型">
            <el-radio-group v-model="watermarkType">
              <el-radio-button label="text">文字水印</el-radio-button>
              <el-radio-button label="image">图片水印</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <!-- Text Watermark -->
          <template v-if="watermarkType === 'text'">
            <el-form-item label="水印文字">
              <el-input v-model="watermarkText" placeholder="输入水印文字..." />
            </el-form-item>

            <el-form-item label="字体大小">
              <el-slider v-model="fontSize" :min="12" :max="100" show-stops />
            </el-form-item>

            <el-form-item label="文字颜色">
              <el-color-picker v-model="fontColor" />
            </el-form-item>
          </template>

          <!-- Image Watermark -->
          <template v-if="watermarkType === 'image'">
            <el-form-item label="水印图片">
              <el-upload
                accept="image/*"
                :auto-upload="false"
                :on-change="handleWatermarkUpload"
                :show-file-list="false"
              >
                <el-button>选择水印图片</el-button>
              </el-upload>
            </el-form-item>

            <el-form-item label="水印宽度">
              <el-slider v-model="watermarkWidth" :min="10" :max="500" show-stops />
            </el-form-item>
          </template>

          <!-- Common Settings -->
          <el-form-item label="透明度">
            <el-slider v-model="opacity" :min="0" :max="100" :step="5" show-stops />
          </el-form-item>

          <el-form-item label="位置">
            <el-select v-model="position" class="w-full">
              <el-option label="左上角" value="top-left" />
              <el-option label="右上角" value="top-right" />
              <el-option label="左下角" value="bottom-left" />
              <el-option label="右下角" value="bottom-right" />
              <el-option label="居中" value="center" />
              <el-option label="平铺" value="tile" />
            </el-select>
          </el-form-item>

          <el-form-item label="旋转角度">
            <el-slider v-model="rotation" :min="-180" :max="180" show-stops />
          </el-form-item>
        </el-form>

        <el-button type="primary" class="w-full mt-4" @click="addWatermark" :disabled="!mainImage">
          添加水印
        </el-button>
      </div>

      <!-- Preview -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">预览</h3>
        
        <div class="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
          <canvas v-if="mainImage" ref="canvasRef" class="max-w-full" />
          <p v-else class="text-gray-400">请先上传图片</p>
        </div>

        <div class="flex gap-3 mt-4">
          <el-button
            type="primary"
            class="flex-1"
            :disabled="!resultImage"
            @click="downloadImage"
          >
            <el-icon><Download /></el-icon>
            下载图片
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Upload, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'

const mainImage = ref<HTMLImageElement | null>(null)
const watermarkImage = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const resultImage = ref('')

const watermarkType = ref<'text' | 'image'>('text')
const watermarkText = ref('水印文字')
const fontSize = ref(32)
const fontColor = ref('#000000')
const watermarkWidth = ref(100)
const opacity = ref(30)
const position = ref('bottom-right')
const rotation = ref(-30)

const handleImageUpload = async (file: UploadFile) => {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    const img = new Image()
    img.onload = async () => {
      mainImage.value = img
      resultImage.value = ''
      await nextTick()
      addWatermark()
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const handleWatermarkUpload = async (file: UploadFile) => {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      watermarkImage.value = img
      addWatermark()
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const addWatermark = () => {
  if (!mainImage.value || !canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = mainImage.value.width
  canvas.height = mainImage.value.height

  // Draw main image
  ctx.drawImage(mainImage.value, 0, 0)

  ctx.globalAlpha = opacity.value / 100

  if (watermarkType.value === 'text') {
    addTextWatermark(ctx)
  } else if (watermarkImage.value) {
    addImageWatermark(ctx)
  }

  ctx.globalAlpha = 1
  resultImage.value = canvas.toDataURL('image/png')
}

const addTextWatermark = (ctx: CanvasRenderingContext2D) => {
  ctx.font = `${fontSize.value}px Arial`
  ctx.fillStyle = fontColor.value

  const padding = 20
  let x = 0
  let y = 0

  // Calculate position based on selection
  switch (position.value) {
    case 'top-left':
      x = padding
      y = fontSize.value + padding
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      break
    case 'top-right':
      x = canvasRef.value!.width - padding
      y = fontSize.value + padding
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      break
    case 'bottom-left':
      x = padding
      y = canvasRef.value!.height - padding
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      break
    case 'bottom-right':
      x = canvasRef.value!.width - padding
      y = canvasRef.value!.height - padding
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      break
    case 'center':
      x = canvasRef.value!.width / 2
      y = canvasRef.value!.height / 2
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      break
    case 'tile':
      // Tile watermark - handled separately
      break
  }

  if (position.value === 'tile') {
    // Tile watermark
    const spacing = fontSize.value * 4
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    for (let i = 0; i < canvasRef.value!.width * 2; i += spacing) {
      for (let j = 0; j < canvasRef.value!.height * 2; j += spacing) {
        ctx.save()
        ctx.translate(i - canvasRef.value!.width / 2, j - canvasRef.value!.height / 2)
        ctx.rotate((rotation.value * Math.PI) / 180)
        ctx.fillText(watermarkText.value, 0, 0)
        ctx.restore()
      }
    }
  } else {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((rotation.value * Math.PI) / 180)
    ctx.fillText(watermarkText.value, 0, 0)
    ctx.restore()
  }
}

const addImageWatermark = (ctx: CanvasRenderingContext2D) => {
  if (!watermarkImage.value) return

  const scale = watermarkWidth.value / watermarkImage.value.width
  const w = watermarkImage.value.width * scale
  const h = watermarkImage.value.height * scale

  let x = 0
  let y = 0

  switch (position.value) {
    case 'top-left':
      x = 20
      y = 20
      break
    case 'top-right':
      x = canvasRef.value!.width - w - 20
      y = 20
      break
    case 'bottom-left':
      x = 20
      y = canvasRef.value!.height - h - 20
      break
    case 'bottom-right':
      x = canvasRef.value!.width - w - 20
      y = canvasRef.value!.height - h - 20
      break
    case 'center':
      x = (canvasRef.value!.width - w) / 2
      y = (canvasRef.value!.height - h) / 2
      break
  }

  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate((rotation.value * Math.PI) / 180)
  ctx.drawImage(watermarkImage.value, -w / 2, -h / 2, w, h)
  ctx.restore()
}

const downloadImage = () => {
  if (!resultImage.value) return
  
  const link = document.createElement('a')
  link.href = resultImage.value
  link.download = `watermarked_${Date.now()}.png`
  link.click()
  ElMessage.success('图片已下载')
}

// Watch for setting changes and update preview
watch(
  [watermarkType, watermarkText, fontSize, fontColor, watermarkWidth, opacity, position, rotation],
  () => {
    if (mainImage.value) {
      addWatermark()
    }
  }
)
</script>
