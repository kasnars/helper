import Dexie, { type Table } from 'dexie'

// 数据库类型定义
export interface FoodOption {
  id?: number
  name: string
  emoji: string
  category: 'lunch' | 'dinner'
  weight: number
  isBuiltin: boolean
  createdAt: Date
}

export interface FoodHistory {
  id?: number
  result: string
  timestamp: Date
}

export interface RandomConfig {
  id: 'default'
  min: number
  max: number
  count: number
  unique: boolean
  lastUsed?: Date
}

export interface AppSetting {
  id: string
  value: any
}

// 内置外卖数据
export const builtinFoodOptions: Omit<FoodOption, 'id' | 'createdAt'>[] = [
  // 午餐选项 (15种)
  { name: '盖浇饭', emoji: '🍱', category: 'lunch', weight: 5, isBuiltin: true },
  { name: '黄焖鸡米饭', emoji: '🍛', category: 'lunch', weight: 5, isBuiltin: true },
  { name: '兰州牛肉面', emoji: '🍜', category: 'lunch', weight: 5, isBuiltin: true },
  { name: '东北饺子', emoji: '🥟', category: 'lunch', weight: 5, isBuiltin: true },
  { name: '扬州炒饭', emoji: '🍚', category: 'lunch', weight: 5, isBuiltin: true },
  { name: '螺蛳粉', emoji: '🍜', category: 'lunch', weight: 4, isBuiltin: true },
  { name: '重庆酸辣粉', emoji: '🍝', category: 'lunch', weight: 4, isBuiltin: true },
  { name: '重庆小面', emoji: '🍜', category: 'lunch', weight: 5, isBuiltin: true },
  { name: '云南过桥米线', emoji: '🍜', category: 'lunch', weight: 5, isBuiltin: true },
  { name: '日式豚骨拉面', emoji: '🍜', category: 'lunch', weight: 5, isBuiltin: true },
  { name: '汉堡套餐', emoji: '🍔', category: 'lunch', weight: 4, isBuiltin: true },
  { name: '三明治轻食', emoji: '🥪', category: 'lunch', weight: 4, isBuiltin: true },
  { name: '披萨', emoji: '🍕', category: 'lunch', weight: 4, isBuiltin: true },
  { name: '韩式炸鸡', emoji: '🍗', category: 'lunch', weight: 4, isBuiltin: true },
  { name: '轻食沙拉碗', emoji: '🥗', category: 'lunch', weight: 4, isBuiltin: true },
  // 晚餐选项 (15种)
  { name: '麻辣烫', emoji: '🍲', category: 'dinner', weight: 5, isBuiltin: true },
  { name: '火锅冒菜', emoji: '🥘', category: 'dinner', weight: 5, isBuiltin: true },
  { name: '冷锅串串', emoji: '🍢', category: 'dinner', weight: 5, isBuiltin: true },
  { name: '北京烤鸭套餐', emoji: '🦆', category: 'dinner', weight: 4, isBuiltin: true },
  { name: '酸菜鱼', emoji: '🐟', category: 'dinner', weight: 5, isBuiltin: true },
  { name: '日式寿司套餐', emoji: '🍱', category: 'dinner', weight: 4, isBuiltin: true },
  { name: '石锅拌饭', emoji: '🥡', category: 'dinner', weight: 4, isBuiltin: true },
  { name: '墨西哥鸡肉卷', emoji: '🌮', category: 'dinner', weight: 3, isBuiltin: true },
  { name: '日式咖喱饭', emoji: '🍛', category: 'dinner', weight: 4, isBuiltin: true },
  { name: '番茄肉酱意面', emoji: '🍝', category: 'dinner', weight: 4, isBuiltin: true },
  { name: '麻辣小龙虾', emoji: '🦞', category: 'dinner', weight: 3, isBuiltin: true },
  { name: '烧烤撸串', emoji: '🍢', category: 'dinner', weight: 5, isBuiltin: true },
  { name: '鲜肉馄饨', emoji: '🥟', category: 'dinner', weight: 5, isBuiltin: true },
  { name: '皮蛋瘦肉粥套餐', emoji: '🍚', category: 'dinner', weight: 4, isBuiltin: true },
  { name: '麻辣香锅', emoji: '🥘', category: 'dinner', weight: 5, isBuiltin: true },
]

// 默认随机数配置
const defaultRandomConfig: RandomConfig = {
  id: 'default',
  min: 1,
  max: 100,
  count: 1,
  unique: false,
  lastUsed: new Date(),
}

// 检查 IndexedDB 支持
const isIndexedDBSupported = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

// 降级到 localStorage 的类
class LocalStorageDB {
  private prefix = 'helper_'

  private getKey(table: string) {
    return this.prefix + table
  }

  async getAll<T>(table: string): Promise<T[]> {
    const data = localStorage.getItem(this.getKey(table))
    return data ? JSON.parse(data) : []
  }

  async add<T>(table: string, item: T): Promise<number> {
    const items = await this.getAll<T & { id?: number }>(table)
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1
    const newItem = { ...item, id: newId }
    items.push(newItem)
    localStorage.setItem(this.getKey(table), JSON.stringify(items))
    return newId
  }

  async put<T>(table: string, item: T & { id?: number }): Promise<number> {
    const items = await this.getAll<T & { id?: number }>(table)
    const index = items.findIndex(i => i.id === (item as any).id)
    if (index >= 0) {
      items[index] = item as any
    } else {
      items.push(item as any)
    }
    localStorage.setItem(this.getKey(table), JSON.stringify(items))
    return (item as any).id || 1
  }

  async delete(table: string, id: number): Promise<void> {
    const items = await this.getAll<any>(table)
    const filtered = items.filter(i => i.id !== id)
    localStorage.setItem(this.getKey(table), JSON.stringify(filtered))
  }

  async get<T>(table: string, id: number): Promise<T | undefined> {
    const items = await this.getAll<T & { id?: number }>(table)
    return items.find(i => i.id === id) as T
  }

  async clear(table: string): Promise<void> {
    localStorage.removeItem(this.getKey(table))
  }
}

// Dexie 数据库类
export class HelperDatabase extends Dexie {
  foodOptions!: Table<FoodOption>
  foodHistory!: Table<FoodHistory>
  randomConfig!: Table<RandomConfig>
  appSettings!: Table<AppSetting>

  private lsDB: LocalStorageDB | null = null
  private useIndexedDB: boolean = true

  constructor() {
    super('HelperDB')

    // 检查 IndexedDB 支持
    this.useIndexedDB = isIndexedDBSupported()

    if (this.useIndexedDB) {
      // 定义数据库结构
      this.version(1).stores({
        foodOptions: '++id, category, isBuiltin',
        foodHistory: '++id, timestamp',
        randomConfig: 'id',
        appSettings: 'id',
      })
    } else {
      // 使用 localStorage 降级
      this.lsDB = new LocalStorageDB()
      console.warn('IndexedDB not supported, falling back to localStorage')
    }
  }

  // 初始化内置数据
  async initBuiltinData() {
    const existingCount = await this.foodOptions.count()
    if (existingCount === 0) {
      // 插入内置选项
      for (const option of builtinFoodOptions) {
        await this.foodOptions.add({
          ...option,
          createdAt: new Date(),
        })
      }
    }

    // 初始化随机数配置
    const existingConfig = await this.randomConfig.get('default')
    if (!existingConfig) {
      await this.randomConfig.add(defaultRandomConfig)
    }
  }

  // 重写 count 方法以支持降级
  async tableCount(tableName: 'foodOptions' | 'foodHistory' | 'randomConfig' | 'appSettings'): Promise<number> {
    if (this.useIndexedDB) {
      return this[tableName].count()
    } else {
      const items = await this.lsDB!.getAll(this.getTableName(tableName))
      return items.length
    }
  }

  private getTableName(table: 'foodOptions' | 'foodHistory' | 'randomConfig' | 'appSettings'): string {
    return table
  }
}

// 创建单例实例
let db: HelperDatabase | null = null

export const getDB = (): HelperDatabase => {
  if (!db) {
    db = new HelperDatabase()
  }
  return db
}

// 导出初始化函数
export const initDatabase = async () => {
  const database = getDB()
  await database.initBuiltinData()
  return database
}
