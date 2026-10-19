import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAtlas } from '../app/atlasContext.ts'
import { CheckedAt } from '../components/CheckedAt.tsx'
import { Hero } from '../components/Hero.tsx'
import { MissionIcon } from '../components/icons.tsx'
import { StatusBadge, Tag } from '../components/StatusBadge.tsx'
import {
  COMMERCIAL_AVAILABILITIES,
  COMMERCIAL_AVAILABILITY_LABELS,
  DEVELOPMENT_STAGES,
  DEVELOPMENT_STAGE_LABELS,
  MISSION_TYPES,
  MISSION_TYPE_LABELS,
  MISSION_TYPE_SHORT_LABELS,
  type Currency,
} from '../domain/enums.ts'
import type { Project } from '../domain/model.ts'
import {
  parseProjectQuery,
  queryProjects,
  serializeProjectQuery,
  type ProjectListItem,
  type ProjectQuery,
  type SortKey,
} from '../domain/query.ts'
import { useCompareSelection } from '../features/compare/useCompareSelection.ts'

function FilterGroup<T extends string>({
  legend,
  values,
  labels,
  selected,
  counts,
  icon,
  onChange,
}: {
  legend: string
  values: readonly T[]
  labels: Record<T, string>
  selected: readonly T[]
  counts: Map<T, number>
  icon?: (value: T) => React.ReactNode
  onChange: (next: T[]) => void
}) {
  const visible = values.filter((v) => counts.has(v) || selected.includes(v))
  return (
    <fieldset className="filter-group">
      <legend>{legend}</legend>
      {visible.map((value) => (
        <label key={value} className="check">
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...selected, value]
                  : selected.filter((v) => v !== value),
              )
            }
          />
          {icon?.(value)}
          {labels[value]}{' '}
          <span className="count">{counts.get(value) ?? 0}</span>
        </label>
      ))}
    </fieldset>
  )
}

function countBy<T>(projects: readonly Project[], key: (p: Project) => T) {
  const counts = new Map<T, number>()
  for (const p of projects) counts.set(key(p), (counts.get(key(p)) ?? 0) + 1)
  return counts
}

function PriceCell({
  item,
  sortCurrency,
}: {
  item: ProjectListItem
  sortCurrency?: Currency
}) {
  const { price } = item
  return (
    <div className="price-cell">
      <span className={price.state === 'UNKNOWN' ? 'text-muted' : undefined}>
        {price.text}
      </span>
      <span className="cell-meta">
        {price.status && <StatusBadge status={price.status} />}
        {price.disputed && <Tag tone="bad">存在冲突</Tag>}
        {sortCurrency && !item.priceComparable && (
          <Tag tone="muted">不可直接比较</Tag>
        )}
      </span>
    </div>
  )
}

export function ProjectListPage() {
  const { atlas, asOf } = useAtlas()
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => parseProjectQuery(params), [params])
  const result = useMemo(
    () => queryProjects(atlas.projects, query, asOf),
    [atlas, query, asOf],
  )
  const compare = useCompareSelection()

  const active = useMemo(
    () => atlas.projects.filter((p) => !p.archivedAt),
    [atlas],
  )
  const currencies = useMemo(() => {
    const set = new Set<Currency>()
    for (const p of active)
      for (const f of p.facts)
        if (f.factType === 'PUBLIC_PRICE' && f.value.kind === 'money')
          set.add(f.value.currency)
    return [...set].sort()
  }, [active])

  const update = (patch: Partial<ProjectQuery>) => {
    // 修改筛选条件时回到第一页
    setParams(serializeProjectQuery({ ...query, page: undefined, ...patch }), {
      replace: true,
    })
  }
  const sortCurrency = query.sort?.startsWith('price-')
    ? (query.sort.slice(-3) as Currency)
    : undefined

  return (
    <>
      <Hero />

      <div className="list-layout">
        <aside className="filters" aria-label="筛选">
          <label className="field">
            <span>搜索项目或运营公司</span>
            <input
              type="search"
              value={query.q ?? ''}
              placeholder="如 Blue Origin、深蓝"
              onChange={(e) => update({ q: e.target.value || undefined })}
            />
          </label>
          <FilterGroup
            legend="飞行类型"
            values={MISSION_TYPES}
            labels={MISSION_TYPE_LABELS}
            selected={query.missionTypes ?? []}
            counts={countBy(active, (p) => p.missionType)}
            icon={(type) => (
              <MissionIcon type={type} className="icon icon-sm" />
            )}
            onChange={(missionTypes) => update({ missionTypes })}
          />
          <FilterGroup
            legend="研发/运营阶段"
            values={DEVELOPMENT_STAGES}
            labels={DEVELOPMENT_STAGE_LABELS}
            selected={query.stages ?? []}
            counts={countBy(active, (p) => p.developmentStage)}
            onChange={(stages) => update({ stages })}
          />
          <FilterGroup
            legend="购买/申请状态"
            values={COMMERCIAL_AVAILABILITIES}
            labels={COMMERCIAL_AVAILABILITY_LABELS}
            selected={query.availabilities ?? []}
            counts={countBy(active, (p) => p.commercialAvailability)}
            onChange={(availabilities) => update({ availabilities })}
          />
          <button
            type="button"
            className="button-link"
            onClick={() => setParams({}, { replace: true })}
          >
            清除全部条件
          </button>
        </aside>

        <section className="results" aria-label="项目列表">
          <div className="results-bar">
            <p role="status">
              共 {result.total} 个结果
              {result.pageCount > 1 &&
                `，第 ${result.page}/${result.pageCount} 页`}
            </p>
            <label className="field-inline">
              排序
              <select
                value={query.sort ?? 'verified-desc'}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
              >
                <option value="verified-desc">最近核实优先</option>
                <option value="verified-asc">最久未核实优先</option>
                <option value="name-asc">名称</option>
                {currencies.map((c) => (
                  <optgroup key={c} label={`官方票价（${c}，仅同币种可比）`}>
                    <option value={`price-asc-${c}`}>{c} 由低到高</option>
                    <option value={`price-desc-${c}`}>{c} 由高到低</option>
                  </optgroup>
                ))}
              </select>
            </label>
          </div>

          {result.total === 0 ? (
            <p className="empty">没有符合条件的项目。</p>
          ) : (
            <table className="project-table">
              <thead>
                <tr>
                  <th scope="col">项目</th>
                  <th scope="col">类型</th>
                  <th scope="col">阶段</th>
                  <th scope="col">商业参与状态</th>
                  <th scope="col">价格信息</th>
                  <th scope="col">最近核实</th>
                  <th scope="col">
                    <span className="visually-hidden">加入对比</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => {
                  const p = item.project
                  const selected = compare.ids.includes(p.slug)
                  return (
                    <tr key={p.id}>
                      <th scope="row" data-label="项目">
                        <Link to={`/projects/${p.slug}`}>{p.name}</Link>
                        <span className="cell-sub">
                          {p.operatorName} · {p.countryOrRegion}
                        </span>
                      </th>
                      <td data-label="类型">
                        <span
                          className="mission"
                          title={MISSION_TYPE_LABELS[p.missionType]}
                        >
                          <MissionIcon type={p.missionType} />
                          {MISSION_TYPE_SHORT_LABELS[p.missionType]}
                        </span>
                      </td>
                      <td data-label="阶段">
                        {DEVELOPMENT_STAGE_LABELS[p.developmentStage]}
                      </td>
                      <td data-label="商业参与">
                        {
                          COMMERCIAL_AVAILABILITY_LABELS[
                            p.commercialAvailability
                          ]
                        }
                      </td>
                      <td data-label="价格">
                        <PriceCell item={item} sortCurrency={sortCurrency} />
                      </td>
                      <td data-label="最近核实">
                        <CheckedAt date={item.lastVerifiedAt} />
                      </td>
                      <td data-label="对比">
                        <label className="check">
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={!selected && compare.isFull}
                            onChange={() => compare.toggle(p.slug)}
                          />
                          对比
                        </label>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {result.pageCount > 1 && (
            <nav className="pagination" aria-label="分页">
              <button
                type="button"
                disabled={result.page <= 1}
                onClick={() =>
                  setParams(
                    serializeProjectQuery({ ...query, page: result.page - 1 }),
                  )
                }
              >
                上一页
              </button>
              <span>
                {result.page} / {result.pageCount}
              </span>
              <button
                type="button"
                disabled={result.page >= result.pageCount}
                onClick={() =>
                  setParams(
                    serializeProjectQuery({ ...query, page: result.page + 1 }),
                  )
                }
              >
                下一页
              </button>
            </nav>
          )}

          {compare.ids.length > 0 && (
            <div className="compare-tray" role="region" aria-label="对比选择">
              已选 {compare.ids.length}/4 个项目
              {compare.ids.length >= 2 ? (
                <Link
                  className="button"
                  to={`/compare?ids=${compare.ids.join(',')}`}
                >
                  开始对比
                </Link>
              ) : (
                <span className="text-muted">至少选择 2 个</span>
              )}
              <button
                type="button"
                className="button-link"
                onClick={() => compare.set([])}
              >
                清空
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
