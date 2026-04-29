<template>
  <div class="space-y-6">
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div class="flex gap-4 flex-1 min-w-[200px]">
        <el-input
          v-model="searchQuery"
          placeholder="搜索平台名或账号"
          clearable
          class="w-full max-w-xs"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="flex gap-2">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          添加密码
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button :disabled="passwordStore.passwords.length === 0" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- Password List -->
    <div v-if="filteredPasswords.length === 0" class="text-center py-16">
      <el-icon :size="48" class="text-gray-300 dark:text-gray-600 mb-4">
        <Lock />
      </el-icon>
      <p class="text-gray-500 dark:text-gray-400">
        {{ passwordStore.passwords.length === 0 ? '还没有保存的密码，点击添加' : '没有找到匹配的密码' }}
      </p>
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="item in filteredPasswords"
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <el-icon :size="20" class="text-blue-600 dark:text-blue-400">
                  <Platform />
                </el-icon>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.platform }}</h3>
                <p v-if="item.notes" class="text-xs text-gray-500 dark:text-gray-400">{{ item.notes }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-gray-500 dark:text-gray-400">账号:</span>
                <span class="font-mono text-gray-900 dark:text-gray-200">{{ item.username }}</span>
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="copyText(item.username)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 dark:text-gray-400">密码:</span>
                <span class="font-mono text-gray-900 dark:text-gray-200">
                  {{ showPassword[item.id!] ? item.password : '••••••••' }}
                </span>
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="showPassword[item.id!] = !showPassword[item.id!]"
                >
                  <el-icon>
                    <View v-if="!showPassword[item.id!]" />
                    <Hide v-else />
                  </el-icon>
                </el-button>
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="copyText(item.password)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <el-button type="primary" link @click="editPassword(item)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link @click="deletePassword(item.id!)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingId ? '编辑密码' : '添加密码'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="平台名" required>
          <el-input v-model="form.platform" placeholder="例如：GitHub、支付宝" />
        </el-form-item>
        <el-form-item label="账号" required>
          <el-input v-model="form.username" placeholder="用户名 / 邮箱 / 手机号" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.notes"
            type="textarea"
            rows="2"
            placeholder="可选：添加备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!isFormValid" @click="savePassword">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- Import Dialog -->
    <el-dialog
      v-model="showImportDialog"
      title="导入密码"
      width="500px"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          请上传 JSON 文件，格式如下：<br>
          <code class="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
            [{"platform": "平台名", "username": "账号", "password": "密码", "notes": "备注"}]
          </code>
        </p>
        <el-upload
          ref="uploadRef"
          accept=".json"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            选择文件
          </el-button>
        </el-upload>
        <div v-if="importPreview.length > 0">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            预览 ({{ importPreview.length }} 条记录):
          </p>
          <div class="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
            <div
              v-for="(item, index) in importPreview"
              :key="index"
              class="text-xs py-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              {{ item.platform }} - {{ item.username }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="importPreview.length === 0"
          :loading="importing"
          @click="confirmImport"
        >
          导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import {
  Plus,
  Search,
  Lock,
  Platform,
  CopyDocument,
  View,
  Hide,
  Edit,
  Delete,
  Upload,
  Download,
} from '@element-plus/icons-vue'
import { usePasswordStore, type PasswordForm } from '../../stores'
import type { Password } from '../../db'

const passwordStore = usePasswordStore()

const searchQuery = ref('')
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const editingId = ref<number | null>(null)
const importing = ref(false)
const uploadRef = ref<UploadInstance>()

const showPassword = reactive<Record<number, boolean>>({})

const importPreview = ref<Array<{
  platform: string
  username: string
  password: string
  notes?: string
}>>([])

const form = reactive<PasswordForm>({
  platform: '',
  username: '',
  password: '',
  notes: '',
})

const isFormValid = computed(() => {
  return form.platform.trim() && form.username.trim() && form.password.trim()
})

const filteredPasswords = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return passwordStore.passwords
  return passwordStore.passwords.filter(
    (item: Password) =>
      item.platform.toLowerCase().includes(query) ||
      item.username.toLowerCase().includes(query)
  )
})

const savePassword = async () => {
  try {
    if (editingId.value) {
      await passwordStore.updatePassword(editingId.value, { ...form })
      ElMessage.success('密码已更新')
    } else {
      await passwordStore.addPassword({ ...form })
      ElMessage.success('密码已添加')
    }
    closeDialog()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const editPassword = (item: { id?: number; platform: string; username: string; password: string; notes?: string }) => {
  editingId.value = item.id || null
  form.platform = item.platform
  form.username = item.username
  form.password = item.password
  form.notes = item.notes || ''
  showAddDialog.value = true
}

const deletePassword = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条密码吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await passwordStore.deletePassword(id)
    ElMessage.success('已删除')
  } catch {
    // 用户取消
  }
}

const closeDialog = () => {
  showAddDialog.value = false
  editingId.value = null
  form.platform = ''
  form.username = ''
  form.password = ''
  form.notes = ''
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const handleExport = () => {
  const data = passwordStore.passwords.map(({ platform, username, password, notes }: Password) => ({
    platform,
    username,
    password,
    notes,
  }))
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `passwords_backup_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const handleImport = () => {
  importPreview.value = []
  showImportDialog.value = true
}

const handleFileChange = (file: UploadFile) => {
  if (!file.raw) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data = JSON.parse(content)

      if (!Array.isArray(data)) {
        throw new Error('文件格式错误：必须是数组')
      }

      const valid = data.filter((item: any) =>
        item.platform && item.username && item.password
      )

      if (valid.length === 0) {
        throw new Error('没有找到有效的密码记录')
      }

      importPreview.value = valid
    } catch (error) {
      ElMessage.error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`)
      importPreview.value = []
    }
  }
  reader.readAsText(file.raw)
}

const confirmImport = async () => {
  if (importPreview.value.length === 0) return

  importing.value = true
  try {
    for (const item of importPreview.value) {
      await passwordStore.addPassword(item)
    }
    ElMessage.success(`成功导入 ${importPreview.value.length} 条密码`)
    showImportDialog.value = false
    importPreview.value = []
  } catch (error) {
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}
</script>
