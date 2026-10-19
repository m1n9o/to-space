import { CURRENCY_MINOR_DIGITS, type Currency } from './enums.ts'

// 金额以"最小货币单位"的整数存储（例如美分），永远不用浮点数表示金额。
// 数据文件中以十进制字符串书写（"750000" / "1500000.00"），加载时转换。

const DECIMAL = /^(\d+)(?:\.(\d+))?$/

/** 返回最小单位整数；格式非法、为负或小数位超过币种精度时返回 null */
export function parseAmountToMinor(
  amount: string,
  currency: Currency,
): number | null {
  const m = DECIMAL.exec(amount)
  if (!m) return null
  const digits = CURRENCY_MINOR_DIGITS[currency]
  const fraction = m[2] ?? ''
  if (fraction.length > digits) return null
  const minor = Number(m[1] + fraction.padEnd(digits, '0'))
  return Number.isSafeInteger(minor) ? minor : null
}

const SYMBOLS: Record<Currency, string> = {
  USD: 'US$',
  CNY: '¥',
  EUR: '€',
  GBP: '£',
  JPY: 'JP¥',
}

export function formatMoney(amountMinor: number, currency: Currency): string {
  const digits = CURRENCY_MINOR_DIGITS[currency]
  const major = amountMinor / 10 ** digits
  const hasFraction = amountMinor % 10 ** digits !== 0
  const text = major.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? digits : 0,
    maximumFractionDigits: digits,
  })
  return `${SYMBOLS[currency]}${text} ${currency}`
}
