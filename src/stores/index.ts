import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDB, type FoodOption, type RandomConfig, type Password } from '../db'

// 主题 Store
export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const systemPreference = ref<'light' | 'dark' | 'auto'>('auto')

  // 检测系统主题
  const detectSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  // 应用主题
  const applyTheme = () => {
    let theme: 'light' | 'dark'
    if (systemPreference.value === 'auto') {
      theme = detectSystemTheme()
    } else {
      theme = systemPreference.value
    }
    isDark.value = theme === 'dark'

    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    systemPreference.value = isDark.value ? 'light' : 'dark'
    applyTheme()
    saveThemePreference()
  }

  // 保存主题偏好
  const saveThemePreference = async () => {
    const db = getDB()
    await db.appSettings.put({
      id: 'theme',
      value: systemPreference.value,
    })
  }

  // 加载主题偏好
  const loadThemePreference = async () => {
    const db = getDB()
    const setting = await db.appSettings.get('theme')
    if (setting) {
      systemPreference.value = setting.value
    }
    applyTheme()
  }

  // 监听系统主题变化
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (systemPreference.value === 'auto') {
        applyTheme()
      }
    })
  }

  return {
    isDark,
    systemPreference,
    toggleTheme,
    applyTheme,
    loadThemePreference,
  }
})

// 应用状态 Store
export const useAppStore = defineStore('app', () => {
  const sideMenuOpen = ref(false)
  const currentTool = ref('')

  const toggleSideMenu = () => {
    sideMenuOpen.value = !sideMenuOpen.value
  }

  const closeSideMenu = () => {
    sideMenuOpen.value = false
  }

  return {
    sideMenuOpen,
    currentTool,
    toggleSideMenu,
    closeSideMenu,
  }
})

// 食物工具 Store
export const useFoodStore = defineStore('food', () => {
  const options = ref<FoodOption[]>([])
  const history = ref<{ result: string; timestamp: Date }[]>([])
  const loading = ref(false)

  const db = getDB()

  // 加载选项
  const loadOptions = async () => {
    loading.value = true
    options.value = await db.foodOptions.toArray()
    loading.value = false
  }

  // 加载历史
  const loadHistory = async () => {
    const records = await db.foodHistory
      .orderBy('timestamp')
      .reverse()
      .limit(10)
      .toArray()
    history.value = records.map(r => ({
      result: r.result,
      timestamp: r.timestamp,
    }))
  }

  // 添加选项
  const addOption = async (option: Omit<FoodOption, 'id' | 'createdAt'>) => {
    const id = await db.foodOptions.add({
      ...option,
      createdAt: new Date(),
    })
    await loadOptions()
    return id
  }

  // 删除选项
  const deleteOption = async (id: number) => {
    await db.foodOptions.delete(id)
    await loadOptions()
  }

  // 更新选项
  const updateOption = async (id: number, updates: Partial<FoodOption>) => {
    await db.foodOptions.update(id, updates)
    await loadOptions()
  }

  // 添加历史记录
  const addHistory = async (result: string) => {
    await db.foodHistory.add({
      result,
      timestamp: new Date(),
    })
    await loadHistory()
  }

  // 清空历史
  const clearHistory = async () => {
    await db.foodHistory.clear()
    history.value = []
  }

  return {
    options,
    history,
    loading,
    loadOptions,
    loadHistory,
    addOption,
    deleteOption,
    updateOption,
    addHistory,
    clearHistory,
  }
})

// 随机数工具 Store
export const useRandomStore = defineStore('random', () => {
  const config = ref<RandomConfig>({
    id: 'default',
    min: 1,
    max: 100,
    count: 1,
    unique: false,
  })
  const results = ref<number[]>([])
  const generating = ref(false)

  const db = getDB()

  // 加载配置
  const loadConfig = async () => {
    const saved = await db.randomConfig.get('default')
    if (saved) {
      config.value = saved
    }
  }

  // 保存配置
  const saveConfig = async () => {
    await db.randomConfig.put({
      ...config.value,
      lastUsed: new Date(),
    })
  }

  // 生成随机数
  const generate = async () => {
    generating.value = true

    const { min, max, count, unique } = config.value
    const range = max - min + 1

    // 如果要求唯一且范围不够，调整数量
    let actualCount = count
    if (unique && count > range) {
      actualCount = range
    }

    const nums: number[] = []

    if (unique) {
      // 生成不重复的随机数
      const pool = Array.from({ length: range }, (_, i) => min + i)
      for (let i = 0; i < actualCount; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length)
        nums.push(pool.splice(randomIndex, 1)[0])
      }
    } else {
      // 生成可能重复的随机数
      for (let i = 0; i < actualCount; i++) {
        nums.push(Math.floor(Math.random() * range) + min)
      }
    }

    results.value = nums
    generating.value = false

    // 保存配置
    await saveConfig()

    return nums
  }

  // 更新配置
  const updateConfig = (updates: Partial<RandomConfig>) => {
    Object.assign(config.value, updates)
  }

  return {
    config,
    results,
    generating,
    loadConfig,
    saveConfig,
    generate,
    updateConfig,
  }
})

// 密码本 Store
export interface PasswordForm {
  platform: string
  username: string
  password: string
  notes?: string
}

export const usePasswordStore = defineStore('password', () => {
  const passwords = ref<Password[]>([])
  const loading = ref(false)

  const db = getDB()

  // 加载密码列表
  const loadPasswords = async () => {
    loading.value = true
    passwords.value = await db.passwords.orderBy('updatedAt').reverse().toArray()
    loading.value = false
  }

  // 添加密码
  const addPassword = async (form: PasswordForm) => {
    const now = new Date()
    const id = await db.passwords.add({
      ...form,
      createdAt: now,
      updatedAt: now,
    })
    await loadPasswords()
    return id
  }

  // 更新密码
  const updatePassword = async (id: number, form: PasswordForm) => {
    await db.passwords.update(id, {
      ...form,
      updatedAt: new Date(),
    })
    await loadPasswords()
  }

  // 删除密码
  const deletePassword = async (id: number) => {
    await db.passwords.delete(id)
    await loadPasswords()
  }

  return {
    passwords,
    loading,
    loadPasswords,
    addPassword,
    updatePassword,
    deletePassword,
  }
})
