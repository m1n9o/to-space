import { formatPartialDate } from './dates.ts'
import { describeFact } from './describe.ts'
import {
  COMMERCIAL_AVAILABILITY_LABELS,
  DEVELOPMENT_STAGE_LABELS,
  MISSION_TYPE_LABELS,
  type EvidenceStatus,
  type FactType,
} from './enums.ts'
import {
  currentFacts,
  effectiveStatus,
  lastCheckedAt,
  projectLastVerifiedAt,
} from './facts.ts'
import type { Project } from './model.ts'
import { priceSummary } from './pricing.ts'

// 多项目对比：逐行列出差异，不计算"最佳项目"。
// 缺失数据统一为 unknown，不以 0 代替；不同币种不做数值比较。

export const MIN_COMPARE = 2
export const MAX_COMPARE = 4

export interface CompareCell {
  text: string
  unknown: boolean
  status?: EvidenceStatus
  checkedAt?: string | null
  disputed?: boolean
}

export interface CompareRow {
  key: string
  label: string
  cells: CompareCell[]
}

const UNKNOWN: CompareCell = { text: '未知', unknown: true }

function factCell(project: Project, type: FactType, asOf: string): CompareCell {
  const facts = currentFacts(project, type, asOf)
  if (facts.length === 0) return UNKNOWN
  const fact = facts[0]
  return {
    text: describeFact(fact),
    unknown: false,
    status: effectiveStatus(fact),
    checkedAt: lastCheckedAt(fact),
    disputed: facts.some((f) => effectiveStatus(f) === 'DISPUTED'),
  }
}

export function buildComparison(
  projects: readonly Project[],
  asOf: string,
): CompareRow[] {
  const row = (
    key: string,
    label: string,
    cell: (p: Project) => CompareCell,
  ): CompareRow => ({ key, label, cells: projects.map(cell) })

  return [
    row('missionType', '飞行类型', (p) => ({
      text: MISSION_TYPE_LABELS[p.missionType],
      unknown: false,
    })),
    row('stage', '当前阶段', (p) => ({
      text: DEVELOPMENT_STAGE_LABELS[p.developmentStage],
      unknown: p.developmentStage === 'UNKNOWN',
      checkedAt: p.classificationVerifiedAt ?? null,
    })),
    row('crewed', '载人飞行证据', (p) => {
      const flights = p.events
        .filter(
          (e) => e.eventType === 'CREWED_FLIGHT_COMPLETED' && e.occurredAt,
        )
        .sort((a, b) => (a.occurredAt! < b.occurredAt! ? 1 : -1))
      if (flights.length === 0) {
        return { text: '数据集中无已完成的载人飞行记录', unknown: false }
      }
      const latest = flights[0]
      return {
        text: `最近：${formatPartialDate(latest.occurredAt!)} ${latest.title}（共收录 ${flights.length} 条）`,
        unknown: false,
        status: latest.verificationStatus,
      }
    }),
    row('price', '最新票价', (p) => {
      const price = priceSummary(p, asOf)
      return {
        text: price.text,
        unknown: price.state === 'UNKNOWN',
        status: price.status,
        checkedAt: price.checkedAt,
        disputed: price.disputed,
      }
    }),
    row('extraCosts', '额外费用是否明确', (p) => {
      const price = priceSummary(p, asOf)
      const v = price.fact?.value
      if (v?.kind === 'free') return { text: '无需付费', unknown: false }
      if (v?.kind !== 'money' || v.extraCostsDisclosed === undefined)
        return UNKNOWN
      return {
        text: v.extraCostsDisclosed
          ? `已说明${v.inclusions ? `：${v.inclusions}` : ''}`
          : '未说明',
        unknown: false,
      }
    }),
    row('deposit', '押金/订金', (p) => factCell(p, 'DEPOSIT_AMOUNT', asOf)),
    row('availability', '购买/申请状态', (p) => ({
      text: COMMERCIAL_AVAILABILITY_LABELS[p.commercialAvailability],
      unknown: p.commercialAvailability === 'UNKNOWN',
      checkedAt: p.classificationVerifiedAt ?? null,
    })),
    row('targetDate', '目标飞行时间', (p) =>
      factCell(p, 'TARGET_FLIGHT_DATE', asOf),
    ),
    row('training', '训练要求', (p) => factCell(p, 'TRAINING_DURATION', asOf)),
    row('eligibility', '资格要求', (p) =>
      factCell(p, 'ELIGIBILITY_REQUIREMENTS', asOf),
    ),
    row('refund', '退款政策', (p) => {
      // 缺失的退款政策不得描述为"不可退款"
      const cell = factCell(p, 'REFUND_POLICY', asOf)
      return cell.unknown ? { text: '未找到公开退款政策', unknown: true } : cell
    }),
    row('lastVerified', '数据最近核实', (p) => {
      const at = projectLastVerifiedAt(p, asOf)
      return at
        ? { text: at, unknown: false }
        : { text: '未核实', unknown: true }
    }),
  ]
}
