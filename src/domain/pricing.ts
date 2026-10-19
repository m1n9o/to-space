import {
  PRICE_KIND_LABELS,
  type Currency,
  type EvidenceStatus,
  type PriceKind,
} from './enums.ts'
import { currentFacts, effectiveStatus, lastCheckedAt } from './facts.ts'
import type { Fact, Project } from './model.ts'
import { formatMoney } from './money.ts'

// 价格摘要。四种状态严格区分，任何情况下"未知"都不会显示为"免费"或 0。
// - PRICED：有结构化金额
// - UNDISCLOSED：确认公司未公开价格（"暂无可靠公开价格"）
// - FREE：参与者无需付费（赞助/选拔）
// - UNKNOWN：数据集中没有当前有效的价格记录

export type PriceState = 'PRICED' | 'UNDISCLOSED' | 'FREE' | 'UNKNOWN'

export interface PriceSummary {
  state: PriceState
  text: string
  fact?: Fact
  priceKind?: PriceKind
  currency?: Currency
  amountMinor?: number
  status?: EvidenceStatus
  checkedAt?: string | null
  /** 有多条当前价格记录且存在冲突 */
  disputed: boolean
}

// 只有公司公布的单席票价之间可以进行数值比较
const COMPARABLE_PRICE_KINDS: readonly PriceKind[] = [
  'OFFICIAL_LIST_PRICE',
  'PRE_SALE_PRICE',
]

const PRICE_KIND_RANK: Record<PriceKind, number> = {
  OFFICIAL_LIST_PRICE: 0,
  PRE_SALE_PRICE: 1,
  HISTORICAL_PRICE: 2,
  MEDIA_REPORTED: 3,
  THIRD_PARTY_ESTIMATE: 4,
}

function rank(fact: Fact): number {
  switch (fact.value.kind) {
    case 'money':
      return PRICE_KIND_RANK[fact.value.priceKind]
    case 'free':
      return -1
    default:
      return 10
  }
}

export const PRICE_STATE_TEXT: Record<Exclude<PriceState, 'PRICED'>, string> = {
  UNDISCLOSED: '暂无可靠公开价格',
  FREE: '参与者无需付费',
  UNKNOWN: '价格未知（待核实）',
}

export function describePriceFact(fact: Fact): string {
  const v = fact.value
  switch (v.kind) {
    case 'money':
      return `${formatMoney(v.amountMinor, v.currency)}（${PRICE_KIND_LABELS[v.priceKind]}）`
    case 'free':
      return `${PRICE_STATE_TEXT.FREE}：${v.note}`
    case 'undisclosed':
      return PRICE_STATE_TEXT.UNDISCLOSED
    default:
      return PRICE_STATE_TEXT.UNKNOWN
  }
}

export function priceSummary(project: Project, asOf: string): PriceSummary {
  const facts = currentFacts(project, 'PUBLIC_PRICE', asOf)
  if (facts.length === 0) {
    return { state: 'UNKNOWN', text: PRICE_STATE_TEXT.UNKNOWN, disputed: false }
  }
  const fact = [...facts].sort((a, b) => rank(a) - rank(b))[0]
  const disputed = facts.some((f) => effectiveStatus(f) === 'DISPUTED')
  const base = {
    fact,
    status: effectiveStatus(fact),
    checkedAt: lastCheckedAt(fact),
    disputed,
    text: describePriceFact(fact),
  }
  const v = fact.value
  if (v.kind === 'money') {
    return {
      ...base,
      state: 'PRICED',
      priceKind: v.priceKind,
      currency: v.currency,
      amountMinor: v.amountMinor,
    }
  }
  if (v.kind === 'free') return { ...base, state: 'FREE' }
  return { ...base, state: 'UNDISCLOSED' }
}

/**
 * 返回可用于数值排序的金额；不同币种、非官方票价、存在争议、未知/未公开均返回 null，
 * 由界面显示为"不可直接比较"。
 */
export function comparablePrice(
  summary: PriceSummary,
  currency: Currency,
): number | null {
  if (summary.state !== 'PRICED' || summary.disputed) return null
  if (summary.currency !== currency) return null
  if (!summary.priceKind || !COMPARABLE_PRICE_KINDS.includes(summary.priceKind))
    return null
  return summary.amountMinor ?? null
}
