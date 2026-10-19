import { daysBetween, isPartialDatePast, parsePartialDate } from './dates.ts'
import { FACT_TYPE_LABELS, type FactType } from './enums.ts'
import {
  currentFacts,
  effectiveStatus,
  factState,
  lastCheckedAt,
} from './facts.ts'
import type { Atlas, Project } from './model.ts'

// 数据新鲜度：不计算综合分数，而是逐条列出可解释的问题。
// 规则阈值集中定义在这里，README 中有同样的说明。

export const FRESHNESS_RULES = {
  priceMaxAgeDays: 180,
  salesStatusMaxAgeDays: 90,
  classificationMaxAgeDays: 180,
  criticalAgeDays: 365,
} as const

export type FreshnessLevel = 'OK' | 'REVIEW' | 'CRITICAL'

export type FreshnessIssueCode =
  | 'MISSING_KEY_FACT'
  | 'STALE_FACT'
  | 'STALE_CLASSIFICATION'
  | 'TARGET_DATE_PASSED'
  | 'BROKEN_SOURCE'
  | 'DISPUTED'
  | 'UNSOURCED_FACT'

export interface FreshnessIssue {
  code: FreshnessIssueCode
  level: Exclude<FreshnessLevel, 'OK'>
  message: string
  factId?: string
  sourceId?: string
}

export interface FreshnessReport {
  level: FreshnessLevel
  issues: FreshnessIssue[]
}

const KEY_FACTS: readonly FactType[] = ['PUBLIC_PRICE', 'TICKET_SALES_STATUS']

const MAX_AGE: Partial<Record<FactType, number>> = {
  PUBLIC_PRICE: FRESHNESS_RULES.priceMaxAgeDays,
  DEPOSIT_AMOUNT: FRESHNESS_RULES.priceMaxAgeDays,
  TICKET_SALES_STATUS: FRESHNESS_RULES.salesStatusMaxAgeDays,
  TARGET_FLIGHT_DATE: FRESHNESS_RULES.salesStatusMaxAgeDays,
}

export function projectFreshness(
  project: Project,
  atlas: Pick<Atlas, 'sources'>,
  asOf: string,
): FreshnessReport {
  const issues: FreshnessIssue[] = []
  const ageLevel = (days: number) =>
    days > FRESHNESS_RULES.criticalAgeDays ? 'CRITICAL' : 'REVIEW'

  for (const type of KEY_FACTS) {
    if (currentFacts(project, type, asOf).length === 0) {
      issues.push({
        code: 'MISSING_KEY_FACT',
        level: 'REVIEW',
        message: `缺少当前有效的「${FACT_TYPE_LABELS[type]}」记录`,
      })
    }
  }

  if (!project.classificationVerifiedAt) {
    issues.push({
      code: 'STALE_CLASSIFICATION',
      level: 'REVIEW',
      message: '项目阶段与商业状态尚无核实记录',
    })
  } else {
    const age = daysBetween(project.classificationVerifiedAt, asOf)
    if (age > FRESHNESS_RULES.classificationMaxAgeDays) {
      issues.push({
        code: 'STALE_CLASSIFICATION',
        level: ageLevel(age),
        message: `项目阶段与商业状态已 ${age} 天未核实`,
      })
    }
  }

  const completions = project.events.filter(
    (e) => e.eventType === 'CREWED_FLIGHT_COMPLETED' && e.occurredAt,
  )

  for (const fact of project.facts) {
    if (factState(fact, asOf) !== 'CURRENT') continue
    const label = FACT_TYPE_LABELS[fact.factType]
    const status = effectiveStatus(fact)
    const checked = lastCheckedAt(fact)

    if (!checked) {
      issues.push({
        code: 'UNSOURCED_FACT',
        level: 'REVIEW',
        message: `「${label}」没有来源，不能视为已核实`,
        factId: fact.id,
      })
    } else {
      const maxAge = MAX_AGE[fact.factType]
      const age = daysBetween(checked, asOf)
      if (maxAge !== undefined && age > maxAge) {
        issues.push({
          code: 'STALE_FACT',
          level: ageLevel(age),
          message: `「${label}」已 ${age} 天未核实（阈值 ${maxAge} 天）`,
          factId: fact.id,
        })
      }
    }

    if (status === 'DISPUTED') {
      issues.push({
        code: 'DISPUTED',
        level: 'REVIEW',
        message: `「${label}」存在来源冲突，尚未解决`,
        factId: fact.id,
      })
    }

    // 目标日期已过，但没有记录到该日期之后的载人飞行
    if (
      fact.factType === 'TARGET_FLIGHT_DATE' &&
      fact.value.kind === 'date' &&
      isPartialDatePast(fact.value.date, asOf)
    ) {
      const targetStart = parsePartialDate(fact.value.date)!.start
      const flown = completions.some(
        (e) => parsePartialDate(e.occurredAt!)!.end >= targetStart,
      )
      if (!flown) {
        issues.push({
          code: 'TARGET_DATE_PASSED',
          level: 'CRITICAL',
          message: `目标日期 ${fact.value.date} 已过，但未找到相应的飞行结果`,
          factId: fact.id,
        })
      }
    }
  }

  // 项目引用的来源中有失效链接
  const referenced = new Set<string>([
    ...project.classificationSourceIds,
    ...project.facts
      .filter((f) => factState(f, asOf) === 'CURRENT')
      .flatMap((f) => f.sourceIds),
    ...project.events.flatMap((e) => e.sourceIds),
  ])
  for (const id of referenced) {
    if (atlas.sources[id]?.linkStatus === 'BROKEN') {
      issues.push({
        code: 'BROKEN_SOURCE',
        level: 'REVIEW',
        message: `来源链接失效：${atlas.sources[id].title}`,
        sourceId: id,
      })
    }
  }

  const level: FreshnessLevel = issues.some((i) => i.level === 'CRITICAL')
    ? 'CRITICAL'
    : issues.length > 0
      ? 'REVIEW'
      : 'OK'
  return { level, issues }
}
