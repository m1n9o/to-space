import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAtlas } from '../app/atlasContext.ts'
import { CheckedAt } from '../components/CheckedAt.tsx'
import { StatusBadge, Tag } from '../components/StatusBadge.tsx'
import { MAX_COMPARE, MIN_COMPARE, buildComparison } from '../domain/compare.ts'
import { useCompareSelection } from '../features/compare/useCompareSelection.ts'

export function ComparePage() {
  const { atlas, asOf } = useAtlas()
  const [params, setParams] = useSearchParams()
  const compare = useCompareSelection()
  const active = useMemo(
    () => atlas.projects.filter((p) => !p.archivedAt),
    [atlas],
  )

  // URL 是对比选择的唯一来源；同步到本地选择以便在列表页继续编辑
  const slugs = useMemo(
    () =>
      [...new Set((params.get('ids') ?? '').split(',').filter(Boolean))]
        .filter((s) => active.some((p) => p.slug === s))
        .slice(0, MAX_COMPARE),
    [params, active],
  )
  const { set } = compare
  useEffect(() => set(slugs), [slugs, set])

  const projects = useMemo(
    () => slugs.map((s) => active.find((p) => p.slug === s)!),
    [slugs, active],
  )
  const rows = useMemo(() => buildComparison(projects, asOf), [projects, asOf])
  const setSlugs = (next: string[]) =>
    setParams(next.length ? { ids: next.join(',') } : {})

  return (
    <>
      <h1>项目对比</h1>
      <p className="text-muted">
        选择 {MIN_COMPARE}–{MAX_COMPARE}{' '}
        个项目逐项比较。缺失数据显示为“未知”；不同币种价格不做数值比较；
        本页不给出“最佳项目”结论。
      </p>

      <div className="compare-picker">
        {Array.from(
          { length: Math.min(slugs.length + 1, MAX_COMPARE) },
          (_, i) => (
            <label key={i} className="field-inline">
              项目 {i + 1}
              <select
                value={slugs[i] ?? ''}
                onChange={(e) => {
                  const next = [...slugs]
                  if (e.target.value) next[i] = e.target.value
                  else next.splice(i, 1)
                  setSlugs(next)
                }}
              >
                <option value="">
                  {i < slugs.length ? '（移除）' : '选择项目…'}
                </option>
                {active
                  .filter((p) => p.slug === slugs[i] || !slugs.includes(p.slug))
                  .map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}（{p.operatorName}）
                    </option>
                  ))}
              </select>
            </label>
          ),
        )}
      </div>

      {projects.length < MIN_COMPARE ? (
        <p className="empty">请至少选择 {MIN_COMPARE} 个项目。</p>
      ) : (
        <div className="table-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col">维度</th>
                {projects.map((p) => (
                  <th key={p.slug} scope="col">
                    <Link to={`/projects/${p.slug}`}>{p.name}</Link>
                    <span className="cell-sub">{p.operatorName}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={cell.unknown ? 'cell-unknown' : undefined}
                    >
                      <div>{cell.text}</div>
                      <div className="cell-meta">
                        {cell.status && <StatusBadge status={cell.status} />}
                        {cell.disputed && <Tag tone="bad">存在冲突</Tag>}
                        {cell.checkedAt !== undefined &&
                          row.key !== 'lastVerified' && (
                            <CheckedAt date={cell.checkedAt} />
                          )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
