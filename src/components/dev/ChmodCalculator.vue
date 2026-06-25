<template>
  <div class="space-y-6">
    <!-- 权限计算器 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Chmod 权限计算器</h3>

      <!-- 权限表格 -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/50">
              <th class="px-4 py-3 text-left text-gray-500 dark:text-gray-400">权限</th>
              <th class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">所有者 (u)</th>
              <th class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">组 (g)</th>
              <th class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">其他 (o)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">读取 (r)</td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.owner.read" />
              </td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.group.read" />
              </td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.other.read" />
              </td>
            </tr>
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">写入 (w)</td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.owner.write" />
              </td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.group.write" />
              </td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.other.write" />
              </td>
            </tr>
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">执行 (x)</td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.owner.execute" />
              </td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.group.execute" />
              </td>
              <td class="px-4 py-3 text-center">
                <el-checkbox v-model="permissions.other.execute" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 结果显示 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">权限表示</h3>
      <div class="grid md:grid-cols-3 gap-6">
        <!-- 数字表示 -->
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">数字表示</div>
          <div class="flex items-center gap-2">
            <span class="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">{{ numericPermission }}</span>
            <el-button size="small" @click="copyToClipboard(numericPermission)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 符号表示 -->
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">符号表示</div>
          <div class="flex items-center gap-2">
            <span class="text-3xl font-bold font-mono text-green-600 dark:text-green-400">{{ symbolicPermission }}</span>
            <el-button size="small" @click="copyToClipboard(symbolicPermission)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 完整命令 -->
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">完整命令</div>
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">chmod {{ numericPermission }} file</span>
            <el-button size="small" @click="copyToClipboard(`chmod ${numericPermission} file`)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预设权限 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">常用权限预设</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="preset in presets"
          :key="preset.value"
          class="cursor-pointer bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
          @click="applyPreset(preset.value)"
        >
          <div class="font-bold font-mono text-lg text-gray-900 dark:text-white">{{ preset.value }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ preset.symbolic }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ preset.description }}</div>
        </div>
      </div>
    </div>

    <!-- 说明 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">权限说明</h3>
      <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1">读取权限 (r = 4)</p>
            <p>文件：查看内容</p>
            <p>目录：列出内容</p>
          </div>
          <div>
            <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1">写入权限 (w = 2)</p>
            <p>文件：修改内容</p>
            <p>目录：创建/删除文件</p>
          </div>
          <div>
            <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1">执行权限 (x = 1)</p>
            <p>文件：执行程序</p>
            <p>目录：进入目录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Permission {
  read: boolean
  write: boolean
  execute: boolean
}

interface Permissions {
  owner: Permission
  group: Permission
  other: Permission
}

const permissions = ref<Permissions>({
  owner: { read: true, write: true, execute: false },
  group: { read: true, write: false, execute: false },
  other: { read: true, write: false, execute: false },
})

const presets = [
  { value: '644', symbolic: 'rw-r--r--', description: '文件默认权限' },
  { value: '755', symbolic: 'rwxr-xr-x', description: '目录/可执行文件' },
  { value: '600', symbolic: 'rw-------', description: '私有文件' },
  { value: '700', symbolic: 'rwx------', description: '私有目录' },
  { value: '444', symbolic: 'r--r--r--', description: '只读文件' },
  { value: '666', symbolic: 'rw-rw-rw-', description: '所有用户可读写' },
  { value: '777', symbolic: 'rwxrwxrwx', description: '所有权限（危险）' },
  { value: '000', symbolic: '---------', description: '无权限' },
]

const numericPermission = computed(() => {
  const calc = (perm: Permission) => {
    let value = 0
    if (perm.read) value += 4
    if (perm.write) value += 2
    if (perm.execute) value += 1
    return value
  }

  return `${calc(permissions.value.owner)}${calc(permissions.value.group)}${calc(permissions.value.other)}`
})

const symbolicPermission = computed(() => {
  const calc = (perm: Permission) => {
    let str = ''
    str += perm.read ? 'r' : '-'
    str += perm.write ? 'w' : '-'
    str += perm.execute ? 'x' : '-'
    return str
  }

  return `${calc(permissions.value.owner)}${calc(permissions.value.group)}${calc(permissions.value.other)}`
})

const applyPreset = (value: string) => {
  const digits = value.split('').map(Number)

  permissions.value.owner = {
    read: (digits[0] & 4) !== 0,
    write: (digits[0] & 2) !== 0,
    execute: (digits[0] & 1) !== 0,
  }

  permissions.value.group = {
    read: (digits[1] & 4) !== 0,
    write: (digits[1] & 2) !== 0,
    execute: (digits[1] & 1) !== 0,
  }

  permissions.value.other = {
    read: (digits[2] & 4) !== 0,
    write: (digits[2] & 2) !== 0,
    execute: (digits[2] & 1) !== 0,
  }

  ElMessage.success(`已应用预设权限 ${value}`)
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>
