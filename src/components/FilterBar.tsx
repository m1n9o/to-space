import { useEffect, useRef, useState } from 'react'
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
  const [openDimension, setOpenDimension] = useState<FilterDimension | null>(
    null,
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (openDimension === null) return

    const closeOnOutsideClick = (event: MouseEvent): void => {
      if (
        containerRef.current !== null &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDimension(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpenDimension(null)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openDimension])

  return (
    <section className="filters">
      <div className="filters-header">
        <h2>筛选方案</h2>
        {hasActiveFilters(activeFilters) && (
          <button type="button" className="filters-clear" onClick={onClear}>
            清空筛选
          </button>
        )}
      </div>
      <div className="filters-dropdowns" ref={containerRef}>
        {FILTER_DEFS.map((def) => {
          const activeCount = activeFilters[def.key].length
          const isOpen = openDimension === def.key

          return (
            <div className="filter-dropdown" key={def.key}>
              <button
                type="button"
                className={`filter-dropdown__trigger ${activeCount > 0 ? 'filter-dropdown__trigger--active' : ''}`}
                aria-expanded={isOpen}
                onClick={() => setOpenDimension(isOpen ? null : def.key)}
              >
                {def.title}
                {activeCount > 0 && (
                  <span className="filter-dropdown__count" aria-hidden="true">
                    {activeCount}
                  </span>
                )}
                <span className="filter-dropdown__caret" aria-hidden="true">
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="filter-dropdown__panel" role="menu">
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
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
