<template>
  <div class="space-y-4" data-testid="backup-tool">
    <p class="text-sm text-gray-600 dark:text-gray-300">把 IndexedDB 里的食物、随机数、主题和番茄钟记录，以及所有 helper_ 开头的本地数据，打成一个 JSON 文件。恢复前会先检查文件是不是 Helper 的备份。</p>
    <div class="flex flex-wrap gap-2">
      <el-button type="primary" data-testid="backup-export" @click="exportData">导出备份</el-button>
      <el-upload :auto-upload="false" :show-file-list="false" accept="application/json,.json" :on-change="onFile">
        <el-button>选择备份文件</el-button>
      </el-upload>
      <el-button type="danger" plain :disabled="!pending" data-testid="backup-restore" @click="restore">确认恢复</el-button>
    </div>
    <p v-if="message" class="text-sm" :class="ok ? 'text-emerald-600' : 'text-red-500'">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getDB } from '@/db'
import { validateBackup, type HelperBackup } from '@/lib/backup'
import { useUsageStore } from '@/stores/usage'

const message = ref('')
const ok = ref(false)
const pending = ref<HelperBackup | null>(null)
const usage = useUsageStore()

const helperKeys = () => {
  const keys: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith('helper_')) keys.push(key)
  }
  return keys
}

const exportData = async () => {
  const db = getDB()
  const local: Record<string, string> = {}
  for (const key of helperKeys()) local[key] = localStorage.getItem(key) || ''
  const backup: HelperBackup = {
    app: 'helper',
    version: 1,
    exportedAt: new Date().toISOString(),
    indexedDB: {
      foodOptions: await db.foodOptions.toArray() as unknown as Record<string, unknown>[],
      foodHistory: await db.foodHistory.toArray() as unknown as Record<string, unknown>[],
      randomConfig: await db.randomConfig.toArray() as unknown as Record<string, unknown>[],
      appSettings: await db.appSettings.toArray() as unknown as Record<string, unknown>[],
      pomodoroDays: await db.pomodoroDays.toArray() as unknown as Record<string, unknown>[],
    },
    localStorage: local,
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `helper-backup-${backup.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(link.href)
  ok.value = true
  message.value = '已开始下载备份文件'
}

const onFile = (file: { raw?: File }) => {
  const raw = file.raw
  if (!raw) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      pending.value = validateBackup(JSON.parse(String(reader.result)))
      ok.value = true
      message.value = `校验通过，导出时间 ${pending.value.exportedAt}。确认后会覆盖当前本地数据。`
    } catch (reason) {
      pending.value = null
      ok.value = false
      message.value = reason instanceof Error ? reason.message : '备份无效'
    }
  }
  reader.readAsText(raw)
}

const restore = async () => {
  if (!pending.value) return
  const backup = pending.value
  const db = getDB()
  await db.transaction('rw', [db.foodOptions, db.foodHistory, db.randomConfig, db.appSettings, db.pomodoroDays], async () => {
    await db.foodOptions.clear()
    await db.foodHistory.clear()
    await db.randomConfig.clear()
    await db.appSettings.clear()
    await db.pomodoroDays.clear()
    if (backup.indexedDB.foodOptions.length) await db.foodOptions.bulkAdd(backup.indexedDB.foodOptions as never[])
    if (backup.indexedDB.foodHistory.length) await db.foodHistory.bulkAdd(backup.indexedDB.foodHistory as never[])
    if (backup.indexedDB.randomConfig.length) await db.randomConfig.bulkAdd(backup.indexedDB.randomConfig as never[])
    if (backup.indexedDB.appSettings.length) await db.appSettings.bulkAdd(backup.indexedDB.appSettings as never[])
    if (backup.indexedDB.pomodoroDays.length) await db.pomodoroDays.bulkAdd(backup.indexedDB.pomodoroDays as never[])
  })
  for (const key of helperKeys()) localStorage.removeItem(key)
  for (const [key, value] of Object.entries(backup.localStorage)) localStorage.setItem(key, value)
  usage.load()
  pending.value = null
  ok.value = true
  message.value = '已恢复。刷新页面后，主题和收藏会按备份显示。'
}
</script>
