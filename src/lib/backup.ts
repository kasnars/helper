export const BACKUP_VERSION = 1
export const BACKUP_TABLES = ['foodOptions', 'foodHistory', 'randomConfig', 'appSettings'] as const

export interface HelperBackup {
  app: 'helper'
  version: 1
  exportedAt: string
  indexedDB: Record<(typeof BACKUP_TABLES)[number], Record<string, unknown>[]>
  localStorage: Record<string, string>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function validateBackup(input: unknown): HelperBackup {
  if (!isRecord(input)) throw new Error('备份文件不是 JSON 对象')
  if (input.app !== 'helper') throw new Error('这不是 Helper 的备份文件')
  if (input.version !== BACKUP_VERSION) throw new Error('不支持的备份版本')
  if (typeof input.exportedAt !== 'string' || !input.exportedAt) throw new Error('缺少导出时间')
  if (!isRecord(input.indexedDB)) throw new Error('缺少 IndexedDB 数据')
  const indexedDB = {} as HelperBackup['indexedDB']
  for (const table of BACKUP_TABLES) {
    const rows = input.indexedDB[table]
    if (!Array.isArray(rows)) throw new Error(`${table} 必须是数组`)
    if (rows.some((row) => !isRecord(row))) throw new Error(`${table} 中存在无效记录`)
    indexedDB[table] = rows as Record<string, unknown>[]
  }
  if (!isRecord(input.localStorage)) throw new Error('缺少 localStorage 数据')
  const localStorage: Record<string, string> = {}
  for (const [key, value] of Object.entries(input.localStorage)) {
    if (typeof value !== 'string') throw new Error(`localStorage.${key} 必须是字符串`)
    localStorage[key] = value
  }
  return {
    app: 'helper',
    version: 1,
    exportedAt: input.exportedAt,
    indexedDB,
    localStorage,
  }
}

export function serializeBackup(backup: HelperBackup): string {
  return JSON.stringify(validateBackup(backup), null, 2)
}
