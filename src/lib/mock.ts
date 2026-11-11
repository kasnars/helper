import { faker, fakerZH_CN } from '@faker-js/faker'

export interface MockField {
  name: string
  type: string
  optional: boolean
  children?: MockField[]
}

export type MockLocale = 'zh_CN' | 'en'

function fakerOf(locale: MockLocale) {
  return locale === 'zh_CN' ? fakerZH_CN : faker
}

function splitTopLevel(source: string): string[] {
  const fields: string[] = []
  let current = ''
  let depth = 0
  for (const char of source) {
    if (char === '{' || char === '<' || char === '(') depth += 1
    if (char === '}' || char === '>' || char === ')') depth -= 1
    if ((char === ',' || char === ';' || char === '\n') && depth === 0) {
      if (current.trim()) fields.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (current.trim()) fields.push(current.trim())
  return fields
}

function parseType(type: string): { type: string; children?: MockField[] } {
  const trimmed = type.trim().replace(/;$/, '')
  const union = trimmed.split('|')[0].trim()
  const array = union.match(/^(.*)\[\]$/)
  if (array) return { type: `${array[1].trim()}[]` }
  if (union.startsWith('{') && union.endsWith('}')) {
    return { type: 'object', children: parseFieldList(union.slice(1, -1)) }
  }
  return { type: union || 'string' }
}

function parseFieldList(body: string): MockField[] {
  return splitTopLevel(body).map((field) => {
    const match = field.match(/^([A-Za-z_]\w*)(\?)?\s*:\s*([\s\S]+)$/)
    if (!match) throw new Error(`无法解析字段：${field}`)
    const parsed = parseType(match[3])
    return { name: match[1], optional: Boolean(match[2]), type: parsed.type, children: parsed.children }
  })
}

function extractBody(source: string): string {
  const start = source.indexOf('{')
  const end = source.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('没有找到 interface 或对象结构')
  return source.slice(start + 1, end)
}

function fieldsFromValue(value: unknown): MockField[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('JSON 示例需要是对象或对象数组')
  return Object.entries(value as Record<string, unknown>).map(([name, item]) => {
    if (Array.isArray(item)) return { name, optional: false, type: 'array' }
    if (item && typeof item === 'object') return { name, optional: false, type: 'object', children: fieldsFromValue(item) }
    if (typeof item === 'number') return { name, optional: false, type: 'number' }
    if (typeof item === 'boolean') return { name, optional: false, type: 'boolean' }
    return { name, optional: false, type: 'string' }
  })
}

export function parseSchema(source: string): MockField[] {
  const trimmed = source.trim()
  if (!trimmed) throw new Error('请输入 TypeScript interface 或 JSON 示例')
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const data = JSON.parse(trimmed) as unknown
    return fieldsFromValue(Array.isArray(data) ? data[0] : data)
  }
  return parseFieldList(extractBody(trimmed))
}

function valueFor(field: MockField, locale: MockLocale): unknown {
  const fake = fakerOf(locale)
  const name = field.name.toLowerCase()
  if (field.children && field.type === 'object') {
    return Object.fromEntries(field.children.map((child) => [child.name, valueFor(child, locale)]))
  }
  if (field.type.endsWith('[]') || field.type === 'array') {
    const inner = field.type.replace(/\[\]$/, '')
    return [valueFor({ ...field, name: field.name, type: inner === 'array' ? 'string' : inner }, locale)]
  }
  if (name.includes('email')) return fake.internet.email()
  if (name.includes('phone') || name.includes('mobile') || name === 'tel') return fake.phone.number()
  if (name === 'city' || name.endsWith('city')) return fake.location.city()
  if (name.includes('company')) return fake.company.name()
  if (name.includes('url') || name.includes('website')) return fake.internet.url()
  if (name === 'id' || name.endsWith('id')) return fake.string.uuid()
  if (name.includes('date') || name.includes('time')) return fake.date.recent().toISOString()
  if (name.includes('name') || name === 'user') return fake.person.fullName()
  if (name.includes('address')) return fake.location.streetAddress()
  if (field.type === 'number' || field.type === 'int') {
    if (name.includes('age')) return fake.number.int({ min: 18, max: 70 })
    return fake.number.int({ min: 1, max: 1000 })
  }
  if (field.type === 'boolean') return fake.datatype.boolean()
  return fake.lorem.word()
}

export function generateRecords(fields: MockField[], count: number, locale: MockLocale = 'zh_CN'): Record<string, unknown>[] {
  const total = Math.min(200, Math.max(1, Math.floor(count)))
  faker.seed(1)
  fakerZH_CN.seed(1)
  return Array.from({ length: total }, () => Object.fromEntries(fields.map((field) => [field.name, valueFor(field, locale)])))
}

export function recordsToCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (value: unknown) => {
    const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n')
}
