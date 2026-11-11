import { describe, expect, it } from 'vitest'
import { describeCron, nextCronRuns } from './cron'
import { decodeJwt, signJwtHs, verifyJwtHs } from './jwt'
import { buildUrl, decodeUrlComponent, encodeUrlComponent, parseUrl } from './url'
import { diffLines, diffStats, diffWords } from './diff'
import { parseCurl, toAxios, toFetch, toNode } from './curl'
import { normalizeHex, rgbToHsl, hexToRgb, scaleToCss, scaleToTailwind, tonalScale } from './color'
import { taxOnTaxable, withholdingSchedule } from './tax'
import { mortgageSchedule } from './mortgage'
import { compareModels, estimateCost } from './cost'
import { convertUnit } from './units'
import { convertCurrency, loadRates } from './currency'
import { generateRecords, parseSchema, recordsToCsv } from './mock'
import { serializeBackup, validateBackup } from './backup'
import { stripJpegMetadata, stripPngMetadata } from './metadata'

describe('cron', () => {
  const from = new Date(2026, 0, 1, 0, 0, 0)

  it('describes 5-field and 6-field rules in Chinese', () => {
    expect(describeCron('0 0 9 * * *')).toBe('每天 09:00:00 执行')
    expect(describeCron('0 9 * * 1-5')).toBe('每周一至周五 09:00 执行')
    expect(describeCron('*/5 * * * *')).toBe('每隔 5 分钟执行')
    expect(describeCron('0 */2 * * *')).toBe('每隔 2 小时，在第 0 分执行')
    expect(describeCron('0 0 0 1 * 1')).toContain('或关系')
  })

  it('returns the next ten runs', () => {
    const runs = nextCronRuns('0 0 9 * * *', 10, from)
    expect(runs).toHaveLength(10)
    expect(runs[0]).toEqual(new Date(2026, 0, 1, 9, 0, 0))
    expect(runs[1]).toEqual(new Date(2026, 0, 2, 9, 0, 0))
    expect(nextCronRuns('0 9 * * 1', 1, from)[0]).toEqual(new Date(2026, 0, 5, 9, 0, 0))
  })

  it('rejects an incomplete expression', () => {
    expect(() => describeCron('* * *')).toThrow(/5 个字段/)
    expect(() => describeCron('60 * * * *')).toThrow(/超出/)
  })
})

describe('jwt', () => {
  it('decodes times and verifies an HS256 signature', async () => {
    const now = new Date('2026-01-02T00:00:00Z').getTime()
    const token = await signJwtHs({ sub: 'ada', iat: now / 1000 - 60, exp: now / 1000 + 3600, nbf: now / 1000 - 60 }, 'secret', 'HS256')
    const decoded = decodeJwt(token, now)
    expect(decoded.validStructure).toBe(true)
    expect(decoded.algorithm).toBe('HS256')
    expect(decoded.expired).toBe(false)
    expect(decoded.claims.find((claim) => claim.key === 'exp')?.value).toMatch(/\d/)
    expect(await verifyJwtHs(token, 'secret')).toEqual({ ok: true, reason: '签名匹配' })
    expect((await verifyJwtHs(token, 'wrong')).ok).toBe(false)
  })

  it('marks an expired token and refuses unsupported algorithms', async () => {
    const token = await signJwtHs({ exp: 1_000 }, 'secret', 'HS384')
    expect(decodeJwt(token, Date.now()).expired).toBe(true)
    const header = token.split('.')[0]
    const tampered = `${header.replace(/HS384/, 'none')}.${token.split('.').slice(1).join('.')}`
    const none = decodeJwt('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhIn0.sig')
    expect(none.algorithm).toBe('none')
    expect((await verifyJwtHs(none.validStructure ? 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhIn0.sig' : tampered, 'secret')).ok).toBe(false)
  })
})

describe('url', () => {
  it('encodes, parses and rebuilds a query string', () => {
    expect(encodeUrlComponent('你好 世界')).toBe('%E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C')
    expect(decodeUrlComponent('%E4%BD%A0%E5%A5%BD')).toBe('你好')
    const parsed = parseUrl('https://example.com:8080/search?q=vue&page=1#top')
    parsed.params[1].value = '2'
    parsed.params.push({ key: 'lang', value: 'zh' })
    expect(buildUrl(parsed)).toBe('https://example.com:8080/search?q=vue&page=2&lang=zh#top')
  })

  it('rejects a url without a protocol', () => {
    expect(() => parseUrl('example.com')).toThrow(/完整 URL/)
  })
})

describe('diff', () => {
  it('pairs changed lines and diffs words', () => {
    const rows = diffLines('a\nhello world\nc', 'a\nhello there\nc')
    expect(diffStats(rows)).toEqual({ added: 0, removed: 0, changed: 1 })
    const changed = rows.find((row) => row.type === 'change')
    expect(changed?.wordDiff).toEqual([
      { type: 'equal', value: 'hello' },
      { type: 'equal', value: ' ' },
      { type: 'delete', value: 'world' },
      { type: 'insert', value: 'there' },
    ])
    expect(diffWords('赤壁', '赤水').map((item) => item.type)).toEqual(['equal', 'delete', 'insert'])
  })
})

describe('curl', () => {
  const command = "curl 'https://api.test/v1' \\\n  -X POST -H 'Content-Type: application/json' -d '{\"a\":1}' -u ada:secret -k"

  it('converts a command into fetch, axios and node', () => {
    const request = parseCurl(command)
    expect(request.method).toBe('POST')
    expect(request.url).toBe('https://api.test/v1')
    expect(request.body).toBe('{"a":1}')
    expect(request.headers[0]).toEqual({ name: 'Content-Type', value: 'application/json' })
    expect(request.headers[1].value.startsWith('Basic ')).toBe(true)
    expect(toFetch(request)).toContain('fetch("https://api.test/v1"')
    expect(toAxios(request)).toContain('axios(')
    expect(toNode(request)).toContain('Node.js 18+')
  })

  it('defaults to POST when data is present and rejects unknown flags', () => {
    expect(parseCurl("curl https://a.test -d hi").method).toBe('POST')
    expect(() => parseCurl('curl https://a.test --proxy socks5')).toThrow(/暂不支持/)
  })
})

describe('color palette', () => {
  it('builds a light-to-dark scale and export snippets', () => {
    const scale = tonalScale('#3B82F6')
    expect(scale.map((item) => item.step)).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950])
    expect(scale[4].hex).not.toBe(scale[0].hex)
    const lightness = scale.map((item) => rgbToHsl(hexToRgb(item.hex)).l)
    expect(lightness[0]).toBeGreaterThan(lightness[5])
    expect(lightness[5]).toBeGreaterThan(lightness[10])
    expect(scale[5].hex).toBe(normalizeHex('3b82f6'))
    expect(scaleToCss('Brand', scale)).toContain('--brand-500: #3B82F6;')
    expect(scaleToTailwind('Brand', scale)).toContain("500: '#3B82F6'")
  })
})

describe('tax and mortgage', () => {
  it('withholds salary tax with the cumulative brackets', () => {
    const result = withholdingSchedule({ monthlySalary: 10000, months: 1, monthlyInsurance: 0, monthlySpecial: 0, monthlyOther: 0 })
    expect(result.current.taxable).toBe(5000)
    expect(result.current.taxThisMonth).toBe(150)
    expect(taxOnTaxable(60000)).toEqual({ rate: 0.1, deduction: 2520, tax: 3480 })
  })

  it('builds equal installment and equal principal schedules', () => {
    const zero = mortgageSchedule(120000, 0, 12, 'installment')
    expect(zero.rows.every((row) => row.payment === 10000 && row.interest === 0)).toBe(true)
    const principal = mortgageSchedule(120000, 12, 12, 'principal')
    expect(principal.rows[0].interest).toBe(1200)
    expect(principal.rows[0].principal).toBeGreaterThan(principal.rows[0].interest)
    const paid = principal.rows.reduce((sum, row) => sum + row.principal, 0)
    expect(Math.round(paid)).toBe(120000)
    const installment = mortgageSchedule(100000, 3.6, 12, 'installment')
    expect(installment.rows[0].payment).toBe(installment.rows[1].payment)
    expect(installment.totalInterest).toBeGreaterThan(0)
  })
})

describe('cost and units', () => {
  it('compares model prices per million tokens', () => {
    const cost = estimateCost({ id: 'a', name: 'A', inputPerMillion: 3, outputPerMillion: 15 }, 1_000_000, 500_000)
    expect(cost).toBe(10.5)
    const ranked = compareModels([
      { id: 'dear', name: '贵', inputPerMillion: 10, outputPerMillion: 10 },
      { id: 'cheap', name: '廉', inputPerMillion: 1, outputPerMillion: 1 },
    ], 1000, 1000)
    expect(ranked[0].id).toBe('cheap')
  })

  it('converts length, temperature and bytes', () => {
    expect(convertUnit('length', 1, 'km', 'm')).toBe(1000)
    expect(convertUnit('temperature', 0, 'c', 'f')).toBe(32)
    expect(convertUnit('temperature', 100, 'c', 'k')).toBeCloseTo(373.15)
    expect(convertUnit('data', 1, 'kb', 'b')).toBe(1024)
  })
})

describe('currency, mock and backup', () => {
  it('converts with cached rates and falls back offline', async () => {
    expect(convertCurrency(100, 'CNY', 'USD', { CNY: 1, USD: 0.14 })).toBeCloseTo(14)
    const storage = memory()
    const liveFetch = (async () => ({ ok: true, json: async () => ({ date: '2026-01-01', rates: { USD: 0.14 } }) })) as unknown as typeof fetch
    const live = await loadRates(liveFetch, storage)
    expect(live.source).toBe('live')
    const cached = await loadRates(async () => { throw new Error('offline') }, storage)
    expect(cached.source).toBe('cache')
    const fallback = await loadRates(async () => { throw new Error('offline') }, memory())
    expect(fallback.source).toBe('fallback')
    expect(fallback.rates.CNY).toBe(1)
  })

  it('generates records from an interface or json sample and exports csv', () => {
    const fields = parseSchema('interface User { name: string; age: number; email?: string }')
    expect(fields.map((field) => field.name)).toEqual(['name', 'age', 'email'])
    const rows = generateRecords(fields, 2, 'zh_CN')
    expect(rows).toHaveLength(2)
    expect(typeof rows[0].name).toBe('string')
    expect(typeof rows[0].age).toBe('number')
    expect(recordsToCsv(rows).split('\n')[0]).toBe('name,age,email')
    expect(parseSchema('[{"city":"杭州","ok":true}]')[0].name).toBe('city')
  })

  it('validates a backup and rejects a tampered file', () => {
    const backup = {
      app: 'helper' as const,
      version: 1 as const,
      exportedAt: '2026-01-01T00:00:00.000Z',
      indexedDB: { foodOptions: [], foodHistory: [], randomConfig: [{ id: 'default' }], appSettings: [{ id: 'theme' }], pomodoroDays: [{ date: '2026-01-01', minutes: 25, note: '写完规格' }] },
      localStorage: { helper_favorites: '[]' },
    }
    expect(JSON.parse(serializeBackup(backup)).app).toBe('helper')
    expect(() => validateBackup({ ...backup, version: 2 })).toThrow(/版本/)
    expect(() => validateBackup({ ...backup, localStorage: { helper_favorites: [] } })).toThrow(/字符串/)
    const legacy = { ...backup, indexedDB: { ...backup.indexedDB } }
    delete (legacy.indexedDB as { pomodoroDays?: unknown }).pomodoroDays
    expect(validateBackup(legacy).indexedDB.pomodoroDays).toEqual([])
  })
})

describe('metadata', () => {
  it('removes jpeg app segments and png text chunks', () => {
    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x04, 0x00, 0x00, 0xff, 0xda, 0x00, 0x02, 0xff, 0xd9])
    const cleaned = stripJpegMetadata(jpeg)
    expect([...cleaned]).not.toContain(0xe1)
    expect(cleaned[0]).toBe(0xff)
    expect(cleaned.at(-2)).toBe(0xff)

    const png = new Uint8Array(8 + 12 + 12)
    png.set([137, 80, 78, 71, 13, 10, 26, 10])
    png.set([0, 0, 0, 0], 8)
    png.set([...'tEXt'].map((char) => char.charCodeAt(0)), 12)
    png.set([0, 0, 0, 0], 20)
    png.set([...'IEND'].map((char) => char.charCodeAt(0)), 24)
    const stripped = stripPngMetadata(png)
    expect(String.fromCharCode(...stripped)).not.toContain('tEXt')
    expect(String.fromCharCode(...stripped)).toContain('IEND')
  })
})

function memory() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}
