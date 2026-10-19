import { SOURCE_TYPE_LABELS } from '../domain/enums.ts'
import type { Source } from '../domain/model.ts'

// 来源内容只作为纯文本渲染（React 默认转义），链接加 noopener/noreferrer。
export function SourceLink({ source }: { source: Source }) {
  return (
    <span className="source-link">
      <a href={source.url} target="_blank" rel="noopener noreferrer nofollow">
        {source.title}
      </a>
      <span className="source-meta">
        {source.publisher} · {SOURCE_TYPE_LABELS[source.sourceType]}
        {source.publishedAt && ` · ${source.publishedAt}`}
        {source.linkStatus === 'BROKEN' && (
          <strong className="text-bad"> · 链接已失效</strong>
        )}
        {source.republishedFromId && ' · 非独立来源（与其他来源同源）'}
      </span>
    </span>
  )
}

export function SourceRefs({
  ids,
  sources,
}: {
  ids: readonly string[]
  sources: Record<string, Source>
}) {
  if (ids.length === 0) return <span className="text-muted">无来源</span>
  return (
    <ul className="source-refs">
      {ids.map((id) =>
        sources[id] ? (
          <li key={id}>
            <SourceLink source={sources[id]} />
          </li>
        ) : null,
      )}
    </ul>
  )
}
