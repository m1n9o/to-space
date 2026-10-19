import { useAtlas } from '../app/atlasContext.ts'
import { describeFact } from '../domain/describe.ts'
import { FACT_TYPE_LABELS, type FactType } from '../domain/enums.ts'
import {
  currentFacts,
  effectiveStatus,
  factHistory,
  lastCheckedAt,
  type FactState,
} from '../domain/facts.ts'
import type { Fact, Project } from '../domain/model.ts'
import { CheckedAt } from './CheckedAt.tsx'
import { SourceRefs } from './SourceLink.tsx'
import { StatusBadge, Tag } from './StatusBadge.tsx'

const STATE_LABELS: Record<Exclude<FactState, 'CURRENT'>, string> = {
  SUPERSEDED: '已被新记录取代',
  OUTDATED: '已过时',
  EXPIRED: '已过有效期',
  NOT_YET_VALID: '尚未生效',
}

function FactValueLine({ fact, state }: { fact: Fact; state: FactState }) {
  const { atlas } = useAtlas()
  const status = effectiveStatus(fact)
  const lastVerification = fact.verifications.at(-1)
  return (
    <div className={state === 'CURRENT' ? 'fact' : 'fact fact-inactive'}>
      <div className="fact-value">
        {describeFact(fact)}
        {fact.label && <span className="fact-label">{fact.label}</span>}
      </div>
      <div className="fact-meta">
        <StatusBadge status={status} />
        {state !== 'CURRENT' && <Tag tone="muted">{STATE_LABELS[state]}</Tag>}
        <CheckedAt date={lastCheckedAt(fact)} />
        <span className="text-muted">观察于 {fact.observedAt}</span>
        {(fact.validFrom || fact.validUntil) && (
          <span className="text-muted">
            适用 {fact.validFrom ?? '…'} 至 {fact.validUntil ?? '…'}
          </span>
        )}
      </div>
      {status === 'DISPUTED' && (
        <p className="notice notice-bad">
          来源之间存在冲突
          {lastVerification?.notes
            ? `：${lastVerification.notes}`
            : '，请参阅下方来源自行判断。'}
        </p>
      )}
      {fact.notes && <p className="fact-notes">{fact.notes}</p>}
      <SourceRefs ids={fact.sourceIds} sources={atlas.sources} />
    </div>
  )
}

/** 某类事实：当前有效记录 + 可展开的历史版本。没有记录时明确显示缺失。 */
export function FactBlock({
  project,
  type,
  title,
  emptyText,
}: {
  project: Project
  type: FactType
  title?: string
  emptyText?: string
}) {
  const { asOf } = useAtlas()
  const current = currentFacts(project, type, asOf)
  const history = factHistory(project, type, asOf).filter(
    (h) => h.state !== 'CURRENT',
  )
  return (
    <div className="fact-block">
      <h3>{title ?? FACT_TYPE_LABELS[type]}</h3>
      {current.length === 0 ? (
        <p className="text-muted">{emptyText ?? '暂无公开信息'}</p>
      ) : (
        current.map((fact) => (
          <FactValueLine key={fact.id} fact={fact} state="CURRENT" />
        ))
      )}
      {current.length > 1 && type !== 'OTHER' && (
        <p className="notice notice-warn">
          存在 {current.length} 条同时有效的记录，未自动选取其一。
        </p>
      )}
      {history.length > 0 && (
        <details className="fact-history">
          <summary>历史记录（{history.length}）</summary>
          {history.map(({ fact, state }) => (
            <FactValueLine key={fact.id} fact={fact} state={state} />
          ))}
        </details>
      )}
    </div>
  )
}
