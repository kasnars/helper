<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔐 密码本
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          安全存储账号密码，支持导入导出
        </p>
      </div>

      <!-- Warning -->
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <el-icon :size="20" class="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5">
            <Warning />
          </el-icon>
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>安全提示：</strong>密码存储在本地浏览器中，请勿在公共设备上保存敏感密码。
            建议定期导出备份，并妥善保管备份文件。
          </p>
        </div>
      </div>

      <!-- Password Manager -->
      <PasswordManager />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'
import PasswordManager from '../components/password/PasswordManager.vue'
</script>
