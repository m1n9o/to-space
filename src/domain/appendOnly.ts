// 只追加规则：已发布的事实不得删除或修改，只能通过新增取代版本（supersedes）
// 或追加核实记录（verifications）来更新。比较基线版本与当前版本的原始数据。

export interface AppendOnlyViolation {
  factId: string
  path: string
  message: string
}

interface RawFact {
  id: string
  verifications?: unknown[]
  [key: string]: unknown
}

function stable(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v as Record<string, unknown>).sort(([a], [b]) =>
            a.localeCompare(b),
          ),
        )
      : v,
  )
}

export function rawFacts(projectData: unknown): RawFact[] {
  const facts = (projectData as { facts?: unknown } | null)?.facts
  return Array.isArray(facts)
    ? facts.filter((f): f is RawFact => typeof f?.id === 'string')
    : []
}

export function checkAppendOnly(
  path: string,
  baseFacts: readonly RawFact[],
  headFacts: readonly RawFact[],
): AppendOnlyViolation[] {
  const violations: AppendOnlyViolation[] = []
  const head = new Map(headFacts.map((f) => [f.id, f]))

  for (const before of baseFacts) {
    const after = head.get(before.id)
    if (!after) {
      violations.push({
        factId: before.id,
        path,
        message: '已发布的事实被删除',
      })
      continue
    }
    const { verifications: vb = [], ...coreBefore } = before
    const { verifications: va = [], ...coreAfter } = after
    if (stable(coreBefore) !== stable(coreAfter)) {
      violations.push({
        factId: before.id,
        path,
        message: '已发布的事实被修改；请新增一条 supersedes 该记录的新版本',
      })
    }
    const prefixKept =
      va.length >= vb.length && vb.every((v, i) => stable(v) === stable(va[i]))
    if (!prefixKept) {
      violations.push({
        factId: before.id,
        path,
        message: '核实记录只能在末尾追加，不能修改或删除已有记录',
      })
    }
  }
  return violations
}
