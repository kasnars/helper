export const CURRENCY_CACHE_KEY = 'helper_currency_rates'
export const CURRENCY_ENDPOINT = 'https://api.frankfurter.dev/v1/latest?base=CNY'

export const FALLBACK_PER_CNY: Record<string, number> = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.13,
  JPY: 21.2,
  GBP: 0.11,
  HKD: 1.09,
  KRW: 195,
  AUD: 0.21,
  CAD: 0.19,
  SGD: 0.18,
  TWD: 4.5,
}

export interface RateTable {
  base: 'CNY'
  rates: Record<string, number>
  updatedAt: string
  source: 'live' | 'cache' | 'fallback'
}

export interface RateStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (!Number.isFinite(amount)) throw new Error('请输入金额')
  if (!(from in rates) || !(to in rates) || rates[from] === 0) throw new Error('不支持的货币')
  return (amount / rates[from]) * rates[to]
}

export async function loadRates(fetchImpl: typeof fetch, storage: RateStorage): Promise<RateTable> {
  try {
    const response = await fetchImpl(CURRENCY_ENDPOINT)
    if (!response.ok) throw new Error(String(response.status))
    const data = await response.json() as { rates?: Record<string, number>; date?: string }
    if (!data.rates || typeof data.rates !== 'object') throw new Error('汇率数据无效')
    const table: RateTable = {
      base: 'CNY',
      rates: { CNY: 1, ...data.rates },
      updatedAt: data.date || new Date().toISOString().slice(0, 10),
      source: 'live',
    }
    storage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(table))
    return table
  } catch {
    const cached = storage.getItem(CURRENCY_CACHE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as RateTable
        if (parsed.rates && parsed.rates.CNY === 1) return { ...parsed, source: 'cache' }
      } catch {
        // 缓存损坏时继续使用内置汇率。
      }
    }
    return { base: 'CNY', rates: { ...FALLBACK_PER_CNY }, updatedAt: '', source: 'fallback' }
  }
}
