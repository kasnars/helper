<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🖼️ 图片工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          图片压缩、转换、裁剪、水印、EXIF查看等工具
        </p>
      </div>

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large">
          <el-radio-button label="processor">
            <el-icon><Picture /></el-icon>
            <span class="hidden sm:inline">图片处理</span>
            <span class="sm:hidden">处理</span>
          </el-radio-button>
          <el-radio-button label="crop">
            <el-icon><Crop /></el-icon>
            <span class="hidden sm:inline">图片裁剪</span>
            <span class="sm:hidden">裁剪</span>
          </el-radio-button>
          <el-radio-button label="watermark">
            <el-icon><Picture /></el-icon>
            <span class="hidden sm:inline">图片水印</span>
            <span class="sm:hidden">水印</span>
          </el-radio-button>
          <el-radio-button label="exif">
            <el-icon><InfoFilled /></el-icon>
            <span class="hidden sm:inline">EXIF 信息</span>
            <span class="sm:hidden">EXIF</span>
          </el-radio-button>
          <el-radio-button label="idphoto">
            <el-icon><Avatar /></el-icon>
            <span class="hidden sm:inline">证件照换底色</span>
            <span class="sm:hidden">证件照</span>
          </el-radio-button>
          <el-radio-button label="whiteboard">
            <el-icon><EditPen /></el-icon>
            <span class="hidden sm:inline">在线画板</span>
            <span class="sm:hidden">画板</span>
          </el-radio-button>
          <el-radio-button label="pixelart">
            <el-icon><Grid /></el-icon>
            <span class="hidden sm:inline">像素画</span>
            <span class="sm:hidden">像素</span>
          </el-radio-button>
          <el-radio-button label="gridsplitter">
            <el-icon><Grid /></el-icon>
            <span class="hidden sm:inline">九宫格切图</span>
            <span class="sm:hidden">切图</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <ImageProcessor v-if="activeTool === 'processor'" />
        <ImageCropper v-if="activeTool === 'crop'" />
        <ImageWatermark v-if="activeTool === 'watermark'" />
        <ImageExif v-if="activeTool === 'exif'" />
        <IdPhotoBg v-if="activeTool === 'idphoto'" />
        <Whiteboard v-if="activeTool === 'whiteboard'" />
        <ImagePixelArt v-if="activeTool === 'pixelart'" />
        <ImageGridSplitter v-if="activeTool === 'gridsplitter'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Picture, Crop, InfoFilled, Avatar, EditPen, Grid } from '@element-plus/icons-vue'
import ImageProcessor from './ImageProcessor.vue'
import ImageCropper from '../components/file/ImageCropper.vue'
import ImageWatermark from '../components/dev/ImageWatermark.vue'
import ImageExif from '../components/file/ImageExif.vue'
import IdPhotoBg from '../components/file/IdPhotoBg.vue'
import Whiteboard from '../components/dev/Whiteboard.vue'
import ImagePixelArt from '../components/image/ImagePixelArt.vue'
import ImageGridSplitter from '../components/image/ImageGridSplitter.vue'

const activeTool = ref('processor')
const toolList = ['processor', 'crop', 'watermark', 'exif', 'idphoto', 'whiteboard', 'pixelart', 'gridsplitter']

onMounted(() => {
  const savedTool = sessionStorage.getItem('activeImageTool')
  if (savedTool && toolList.includes(savedTool)) {
    activeTool.value = savedTool
    sessionStorage.removeItem('activeImageTool')
  }
})
</script>
