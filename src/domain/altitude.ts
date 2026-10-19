import { currentFact } from './facts.ts'
import type { Atlas, Fact, Project } from './model.ts'

// 高度标尺：把当前项目的飞行高度放在对数刻度上，与 100 km 卡门线
// 及其他项目的当前高度记录对照。只使用以 km 为单位的数量型事实，不做推断。

export const KARMAN_LINE_KM = 100
export const SCALE_MIN_KM = 10
export const SCALE_MAX_KM = 500

export interface AltitudeMark {
  km: number
  /** 至少（MIN）/ 约（APPROX）等限定 */
  qualifier: 'EXACT' | 'APPROX' | 'MIN' | 'MAX'
  label: string
  /** 0–100，标尺上的百分比位置 */
  position: number
}

export interface AltitudeScale {
  current: AltitudeMark
  karman: AltitudeMark
  references: AltitudeMark[]
  belowKarman: boolean
}

/** 对数刻度位置（百分比），超出范围时截断到两端 */
export function altitudePosition(km: number): number {
  const clamped = Math.min(Math.max(km, SCALE_MIN_KM), SCALE_MAX_KM)
  const span = Math.log10(SCALE_MAX_KM) - Math.log10(SCALE_MIN_KM)
  return ((Math.log10(clamped) - Math.log10(SCALE_MIN_KM)) / span) * 100
}

function kmValue(fact: Fact | undefined) {
  const v = fact?.value
  return v?.kind === 'quantity' && v.unit === 'KM' ? v : null
}

export function altitudeScale(
  project: Project,
  atlas: Pick<Atlas, 'projects'>,
  asOf: string,
): AltitudeScale | null {
  const value = kmValue(currentFact(project, 'ALTITUDE', asOf))
  if (!value) return null

  // 参照点：其他项目的当前高度，去掉与卡门线或本项目重合的值，同一高度只保留一个
  const seen = new Set<number>([KARMAN_LINE_KM, value.amount])
  const references: AltitudeMark[] = []
  for (const other of atlas.projects) {
    if (other.id === project.id || other.archivedAt) continue
    const ref = kmValue(currentFact(other, 'ALTITUDE', asOf))
    if (!ref || seen.has(ref.amount)) continue
    seen.add(ref.amount)
    references.push({
      km: ref.amount,
      qualifier: ref.qualifier,
      label: other.operatorName.split(/[（(]/)[0].trim(),
      position: altitudePosition(ref.amount),
    })
  }
  references.sort((a, b) => a.km - b.km)

  return {
    current: {
      km: value.amount,
      qualifier: value.qualifier,
      label: '本项目',
      position: altitudePosition(value.amount),
    },
    karman: {
      km: KARMAN_LINE_KM,
      qualifier: 'EXACT',
      label: '卡门线',
      position: altitudePosition(KARMAN_LINE_KM),
    },
    references,
    // "至少 100 km" 不算低于卡门线
    belowKarman: value.amount < KARMAN_LINE_KM && value.qualifier !== 'MIN',
  }
}
