import { useState } from 'react'
import {
  BADGE_LABELS,
  BOUNDARY_LABELS,
  BUDGET_LABELS,
  EXPERIENCE_LABELS,
} from '../data/spaceOptions'
import {
  hasActiveFilters,
  type ActiveFilters,
  type FilterDimension,
} from '../features/filters/filterOptions'

interface FilterBarProps {
  activeFilters: ActiveFilters
  onToggle: (dimension: FilterDimension, value: string) => void
  onClear: () => void
}

interface FilterDef {
  key: FilterDimension
  title: string
  options: [string, string][]
}

const FILTER_DEFS: FilterDef[] = [
  {
    key: 'experience',
    title: '按体验类型',
    options: Object.entries(EXPERIENCE_LABELS),
  },
  { key: 'budget', title: '按预算', options: Object.entries(BUDGET_LABELS) },
  {
    key: 'status',
    title: '按状态',
    options: Object.entries(BADGE_LABELS).map(([statusKey, badge]) => [
      statusKey,
      badge.text,
    ]),
  },
  {
    key: 'boundary',
    title: '按卡门线',
    options: Object.entries(BOUNDARY_LABELS),
  },
]

export function FilterBar({
  activeFilters,
  onToggle,
  onClear,
}: FilterBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <section className="filters">
      <div className="filters-header">
        <h2>筛选方案</h2>
        <div className="filters-header__actions">
          {hasActiveFilters(activeFilters) && (
            <button type="button" className="filters-clear" onClick={onClear}>
              清空筛选
            </button>
          )}
          <button
            type="button"
            className="filters-toggle"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen((open) => !open)}
          >
            筛选器 ▾
          </button>
        </div>
      </div>
      <div
        className={`filters-groups ${isDrawerOpen ? 'filters-groups--open' : ''}`}
      >
        {FILTER_DEFS.map((def) => (
          <div className="filter-group" key={def.key}>
            <h3 className="filter-group__title">{def.title}</h3>
            <div className="filter-group__chips">
              {def.options.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={`chip ${activeFilters[def.key].includes(value) ? 'chip--active' : ''}`}
                  onClick={() => onToggle(def.key, value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
