import type { EvidenceStatus, FactType } from './enums.ts'
import type { Fact, Project } from './model.ts'

// "当前有效事实"的唯一实现。前端不得自行推断。

export type FactState =
  | 'CURRENT'
  | 'SUPERSEDED' // 已被新版本取代
  | 'OUTDATED' // 被核实记录标记为过时
  | 'EXPIRED' // 超过 validUntil
  | 'NOT_YET_VALID' // validFrom 在未来

/** 最新核实记录的状态；没有核实记录时使用录入时的证据状态 */
export function effectiveStatus(fact: Fact): EvidenceStatus {
  const last = fact.verifications.at(-1)
  return last ? last.status : fact.evidenceStatus
}

/**
 * 最近一次核实日期：最新核实记录的日期；没有核实记录但有来源时为观察日期；
 * 没有任何来源时返回 null（展示为"未核实"）。
 */
export function lastCheckedAt(fact: Fact): string | null {
  const last = fact.verifications.at(-1)
  if (last) return last.at
  return fact.sourceIds.length > 0 ? fact.observedAt : null
}

export function factState(fact: Fact, asOf: string): FactState {
  if (fact.supersededById) return 'SUPERSEDED'
  if (effectiveStatus(fact) === 'OUTDATED') return 'OUTDATED'
  if (fact.validUntil && fact.validUntil < asOf) return 'EXPIRED'
  if (fact.validFrom && fact.validFrom > asOf) return 'NOT_YET_VALID'
  return 'CURRENT'
}

function byObservedDesc(a: Fact, b: Fact): number {
  if (a.observedAt !== b.observedAt) return a.observedAt < b.observedAt ? 1 : -1
  return a.recordedAt < b.recordedAt ? 1 : a.recordedAt > b.recordedAt ? -1 : 0
}

/**
 * 某类事实当前有效的记录（按观察时间倒序）。
 * 可能返回多条：例如两条相互冲突、均被标为 DISPUTED 的记录会同时返回，而不是静默选取其一。
 */
export function currentFacts(
  project: Project,
  factType: FactType,
  asOf: string,
): Fact[] {
  return project.facts
    .filter((f) => f.factType === factType && factState(f, asOf) === 'CURRENT')
    .sort(byObservedDesc)
}

export function currentFact(
  project: Project,
  factType: FactType,
  asOf: string,
): Fact | undefined {
  return currentFacts(project, factType, asOf)[0]
}

export interface FactHistoryEntry {
  fact: Fact
  state: FactState
}

/** 某类事实的全部历史（含已取代、已过时），按观察时间倒序 */
export function factHistory(
  project: Project,
  factType: FactType,
  asOf: string,
): FactHistoryEntry[] {
  return project.facts
    .filter((f) => f.factType === factType)
    .sort(byObservedDesc)
    .map((fact) => ({ fact, state: factState(fact, asOf) }))
}

/** 沿 supersedes 链返回某事实的前一版本 */
export function previousVersion(
  project: Project,
  fact: Fact,
): Fact | undefined {
  return fact.supersedes
    ? project.facts.find((f) => f.id === fact.supersedes)
    : undefined
}

/** 项目最近核实日期：阶段分类核实日与所有当前事实核实日中的最大值 */
export function projectLastVerifiedAt(
  project: Project,
  asOf: string,
): string | null {
  let latest = project.classificationVerifiedAt ?? null
  for (const fact of project.facts) {
    if (factState(fact, asOf) !== 'CURRENT') continue
    const checked = lastCheckedAt(fact)
    if (checked && (!latest || checked > latest)) latest = checked
  }
  return latest
}
