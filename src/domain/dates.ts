// 日期约定：
// - 所有日期均为 UTC 日历日期，格式 YYYY-MM-DD（ISO 8601），不带时间与时区。
// - 计划/目标日期允许部分精度：YYYY、YYYY-H1、YYYY-Q2、YYYY-MM、YYYY-MM-DD。
//   部分精度日期在比较时展开为区间 [start, end]。

export type DatePrecision = 'YEAR' | 'HALF' | 'QUARTER' | 'MONTH' | 'DAY'

export interface PartialDate {
  raw: string
  precision: DatePrecision
  start: string // 区间第一天 YYYY-MM-DD
  end: string // 区间最后一天 YYYY-MM-DD
}

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/
const PARTIAL = /^(\d{4})(?:-(?:(H[12])|(Q[1-4])|(\d{2})(?:-(\d{2}))?))?$/

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function isIsoDay(value: string): boolean {
  const m = ISO_DAY.exec(value)
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  return mo >= 1 && mo <= 12 && d >= 1 && d <= lastDayOfMonth(y, mo)
}

export function parsePartialDate(raw: string): PartialDate | null {
  const m = PARTIAL.exec(raw)
  if (!m) return null
  const year = Number(m[1])
  const [, , half, quarter, month, day] = m
  const range = (startMonth: number, endMonth: number) => ({
    start: `${year}-${pad(startMonth)}-01`,
    end: `${year}-${pad(endMonth)}-${pad(lastDayOfMonth(year, endMonth))}`,
  })

  if (half) {
    const h = Number(half[1])
    return { raw, precision: 'HALF', ...range(h * 6 - 5, h * 6) }
  }
  if (quarter) {
    const q = Number(quarter[1])
    return { raw, precision: 'QUARTER', ...range(q * 3 - 2, q * 3) }
  }
  if (month && day) {
    if (!isIsoDay(raw)) return null
    return { raw, precision: 'DAY', start: raw, end: raw }
  }
  if (month) {
    const mo = Number(month)
    if (mo < 1 || mo > 12) return null
    return { raw, precision: 'MONTH', ...range(mo, mo) }
  }
  return { raw, precision: 'YEAR', ...range(1, 12) }
}

export function isPartialDate(raw: string): boolean {
  return parsePartialDate(raw) !== null
}

/** ISO 日期字符串可以直接按字典序比较 */
export function compareIsoDay(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** 部分日期整个区间都已经过去（例如 "2026-Q1" 在 2026-04-01 起算过去） */
export function isPartialDatePast(raw: string, asOf: string): boolean {
  const parsed = parsePartialDate(raw)
  return parsed !== null && parsed.end < asOf
}

export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function formatPartialDate(raw: string): string {
  const parsed = parsePartialDate(raw)
  if (!parsed) return raw
  const [y, rest] = [raw.slice(0, 4), raw.slice(5)]
  switch (parsed.precision) {
    case 'YEAR':
      return `${y} 年`
    case 'HALF':
      return `${y} 年${rest === 'H1' ? '上' : '下'}半年`
    case 'QUARTER':
      return `${y} 年第 ${rest[1]} 季度`
    case 'MONTH':
      return `${y} 年 ${Number(rest)} 月`
    case 'DAY':
      return raw
  }
}
