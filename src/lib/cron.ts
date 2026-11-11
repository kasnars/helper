export interface CronParts {
  second: string
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
  fieldCount: 5 | 6
}

interface ParsedCron {
  parts: CronParts
  second: Set<number>
  minute: Set<number>
  hour: Set<number>
  dayOfMonth: Set<number>
  month: Set<number>
  dayOfWeek: Set<number>
  dayOfMonthAny: boolean
  dayOfWeekAny: boolean
  six: boolean
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

const WEEKDAYS: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function range(start: number, end: number, step = 1): number[] {
  const values: number[] = []
  for (let value = start; value <= end; value += step) values.push(value)
  return values
}

function expandPart(part: string, min: number, max: number, names: Record<string, number>): number[] {
  const named = part.toLowerCase().replace(/[a-z]{3}/g, (token) => {
    if (!(token in names)) throw new Error(`无法识别的名称：${token}`)
    return String(names[token])
  })
  const [base, stepText] = named.split('/')
  if (named.split('/').length > 2) throw new Error(`步长格式无效：${part}`)
  const step = stepText === undefined ? 1 : Number(stepText)
  if (!Number.isInteger(step) || step < 1) throw new Error(`步长无效：${part}`)

  let start = min
  let end = max
  if (base !== '*' && base !== '?') {
    if (base.includes('-')) {
      const [rawStart, rawEnd] = base.split('-')
      start = Number(rawStart)
      end = Number(rawEnd)
      if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
        throw new Error(`范围无效：${part}`)
      }
    } else {
      const value = Number(base)
      if (!Number.isInteger(value)) throw new Error(`数字无效：${part}`)
      if (stepText === undefined) return [value]
      start = value
    }
  }

  return range(start, end, step)
}

function parseField(expr: string, min: number, max: number, names: Record<string, number> = {}): Set<number> {
  if (!expr) throw new Error('表达式字段不能为空')
  const values = new Set<number>()
  for (const part of expr.split(',')) {
    if (!part) throw new Error('表达式包含空字段')
    for (const value of expandPart(part, min, max, names)) {
      const normalized = max === 7 && value === 7 ? 0 : value
      const upper = max === 7 ? 6 : max
      if (normalized < min || normalized > upper) throw new Error(`${expr} 超出 ${min}-${max} 的范围`)
      values.add(normalized)
    }
  }
  if (values.size === 0) throw new Error(`${expr} 没有可用的取值`)
  return values
}

function isAny(expr: string): boolean {
  return expr === '*' || expr === '?'
}

export function parseCron(expression: string): ParsedCron {
  const fields = expression.trim().split(/\s+/)
  if (fields.length !== 5 && fields.length !== 6) {
    throw new Error('需要 5 个字段（分 时 日 月 周）或 6 个字段（秒 分 时 日 月 周）')
  }
  const six = fields.length === 6
  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = six
    ? fields
    : ['0', ...fields]
  const parts: CronParts = {
    second,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
    fieldCount: six ? 6 : 5,
  }
  return {
    parts,
    second: parseField(second, 0, 59),
    minute: parseField(minute, 0, 59),
    hour: parseField(hour, 0, 23),
    dayOfMonth: parseField(dayOfMonth, 1, 31),
    month: parseField(month, 1, 12, MONTHS),
    dayOfWeek: parseField(dayOfWeek, 0, 7, WEEKDAYS),
    dayOfMonthAny: isAny(dayOfMonth),
    dayOfWeekAny: isAny(dayOfWeek),
    six,
  }
}

function sorted(values: Set<number>): number[] {
  return [...values].sort((a, b) => a - b)
}

function isFullRange(values: Set<number>, min: number, max: number): boolean {
  return values.size === max - min + 1 && [...values].every((value) => value >= min && value <= max)
}

function listText(values: number[], unit: string): string {
  if (values.length === 1) return `${values[0]}${unit}`
  const consecutive = values.every((value, index) => index === 0 || value === values[index - 1] + 1)
  if (consecutive) return `${values[0]}至${values[values.length - 1]}${unit}`
  return `${values.join('、')}${unit}`
}

function weekdayText(values: number[]): string {
  const days = sorted(new Set(values))
  if (days.length === 1) return `每${WEEKDAY_LABELS[days[0]]}`
  const consecutive = days.every((value, index) => index === 0 || value === days[index - 1] + 1)
  if (consecutive) return `每${WEEKDAY_LABELS[days[0]]}至${WEEKDAY_LABELS[days[days.length - 1]]}`
  return `每${days.map((day) => WEEKDAY_LABELS[day]).join('、')}`
}

function clock(parsed: ParsedCron): string {
  const hours = sorted(parsed.hour)
  const minutes = sorted(parsed.minute)
  const seconds = sorted(parsed.second)
  if (hours.length === 1 && minutes.length === 1 && (!parsed.six || seconds.length === 1)) {
    const text = `${String(hours[0]).padStart(2, '0')}:${String(minutes[0]).padStart(2, '0')}`
    return parsed.six ? `${text}:${String(seconds[0]).padStart(2, '0')}` : text
  }
  const bits: string[] = []
  if (!isFullRange(parsed.hour, 0, 23)) bits.push(listText(hours, ' 点'))
  else bits.push('每小时')
  if (!isFullRange(parsed.minute, 0, 59)) bits.push(listText(minutes, ' 分'))
  else bits.push('每分钟')
  if (parsed.six && !isFullRange(parsed.second, 0, 59)) bits.push(listText(seconds, ' 秒'))
  return bits.join('')
}

function stepSentence(parsed: ParsedCron): string | null {
  const match = parsed.parts.minute.match(/^\*\/(\d+)$/)
  if (
    match &&
    parsed.parts.second === '0' &&
    isAny(parsed.parts.hour) &&
    parsed.dayOfMonthAny &&
    isAny(parsed.parts.month) &&
    parsed.dayOfWeekAny
  ) {
    return `每隔 ${match[1]} 分钟执行`
  }
  const hourMatch = parsed.parts.hour.match(/^\*\/(\d+)$/)
  if (
    hourMatch &&
    parsed.parts.second === '0' &&
    parsed.parts.minute === '0' &&
    parsed.dayOfMonthAny &&
    isAny(parsed.parts.month) &&
    parsed.dayOfWeekAny
  ) {
    return `每隔 ${hourMatch[1]} 小时，在第 0 分执行`
  }
  const secondMatch = parsed.six ? parsed.parts.second.match(/^\*\/(\d+)$/) : null
  if (
    secondMatch &&
    isAny(parsed.parts.minute) &&
    isAny(parsed.parts.hour) &&
    parsed.dayOfMonthAny &&
    isAny(parsed.parts.month) &&
    parsed.dayOfWeekAny
  ) {
    return `每隔 ${secondMatch[1]} 秒执行`
  }
  return null
}

export function describeCron(expression: string): string {
  const parsed = parseCron(expression)
  const stepped = stepSentence(parsed)
  if (stepped) return stepped

  const dateBits: string[] = []
  if (!isAny(parsed.parts.month)) dateBits.push(listText(sorted(parsed.month), '月'))
  if (!parsed.dayOfMonthAny && !parsed.dayOfWeekAny) {
    dateBits.push(`${listText(sorted(parsed.dayOfMonth), '日')}或${weekdayText(sorted(parsed.dayOfWeek)).replace(/^每/, '')}`)
  } else if (!parsed.dayOfMonthAny) {
    dateBits.push(`每月 ${listText(sorted(parsed.dayOfMonth), '日')}`)
  } else if (!parsed.dayOfWeekAny) {
    dateBits.push(weekdayText(sorted(parsed.dayOfWeek)))
  } else {
    dateBits.push('每天')
  }
  const relation = !parsed.dayOfMonthAny && !parsed.dayOfWeekAny ? '（日与星期为或关系）' : ''
  return `${dateBits.join('')} ${clock(parsed)} 执行${relation}`.replace(/\s+/g, ' ').trim()
}

function dayMatches(date: Date, parsed: ParsedCron): boolean {
  const dayHit = parsed.dayOfMonth.has(date.getDate())
  const weekHit = parsed.dayOfWeek.has(date.getDay())
  if (parsed.dayOfMonthAny && parsed.dayOfWeekAny) return true
  if (parsed.dayOfMonthAny) return weekHit
  if (parsed.dayOfWeekAny) return dayHit
  return dayHit || weekHit
}

function matches(date: Date, parsed: ParsedCron): boolean {
  return parsed.month.has(date.getMonth() + 1)
    && dayMatches(date, parsed)
    && parsed.hour.has(date.getHours())
    && parsed.minute.has(date.getMinutes())
    && (!parsed.six || parsed.second.has(date.getSeconds()))
}

function at(year: number, monthIndex: number, day: number, hour = 0, minute = 0, second = 0): Date {
  return new Date(year, monthIndex, day, hour, minute, second, 0)
}

function bump(date: Date, parsed: ParsedCron): Date {
  if (!parsed.month.has(date.getMonth() + 1)) {
    return at(date.getFullYear(), date.getMonth() + 1, 1)
  }
  if (!dayMatches(date, parsed)) {
    return at(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  }
  if (!parsed.hour.has(date.getHours())) {
    return at(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1)
  }
  if (!parsed.minute.has(date.getMinutes())) {
    return at(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + 1)
  }
  if (parsed.six && !parsed.second.has(date.getSeconds())) {
    return at(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() + 1)
  }
  return parsed.six
    ? at(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() + 1)
    : at(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + 1)
}

export function nextCronRuns(expression: string, count = 10, from = new Date()): Date[] {
  const parsed = parseCron(expression)
  const limit = Math.max(1, Math.min(count, 50))
  let cursor = new Date(from.getTime())
  cursor.setMilliseconds(0)
  cursor = parsed.six
    ? at(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), cursor.getHours(), cursor.getMinutes(), cursor.getSeconds() + 1)
    : at(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), cursor.getHours(), cursor.getMinutes() + 1)
  const runs: Date[] = []
  for (let guard = 0; runs.length < limit && guard < 200000; guard += 1) {
    if (matches(cursor, parsed)) {
      runs.push(new Date(cursor))
      cursor = parsed.six
        ? at(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), cursor.getHours(), cursor.getMinutes(), cursor.getSeconds() + 1)
        : at(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), cursor.getHours(), cursor.getMinutes() + 1)
      continue
    }
    const next = bump(cursor, parsed)
    if (next.getTime() <= cursor.getTime()) break
    cursor = next
  }
  return runs
}
