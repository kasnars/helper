import { defineStore } from 'pinia'
import { ref } from 'vue'

const FAVORITES_KEY = 'helper_favorites'
const RECENT_KEY = 'helper_recent'

function readList(key: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]') as unknown
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export const useUsageStore = defineStore('usage', () => {
  const favorites = ref<string[]>([])
  const recent = ref<string[]>([])

  const load = () => {
    favorites.value = readList(FAVORITES_KEY)
    recent.value = readList(RECENT_KEY)
  }

  const persist = () => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.value))
  }

  const touch = (id: string) => {
    recent.value = [id, ...recent.value.filter((item) => item !== id)].slice(0, 12)
    persist()
  }

  const toggleFavorite = (id: string) => {
    favorites.value = favorites.value.includes(id)
      ? favorites.value.filter((item) => item !== id)
      : [...favorites.value, id]
    persist()
  }

  const isFavorite = (id: string) => favorites.value.includes(id)

  return { favorites, recent, load, touch, toggleFavorite, isFavorite }
})
