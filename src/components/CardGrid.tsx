import type { SpaceOption } from '../data/spaceOptions'
import { OptionCard } from './OptionCard'

interface CardGridProps {
  options: SpaceOption[]
  total: number
}

export function CardGrid({ options, total }: CardGridProps) {
  return (
    <section className="card-grid-section">
      <h2>全部方案</h2>
      <p className="card-grid__count">
        {options.length} / {total} 个方案
      </p>
      {options.length === 0 ? (
        <p className="card-grid__empty">
          没有符合当前筛选条件的方案，试试清空筛选器。
        </p>
      ) : (
        <div className="card-grid">
          {options.map((option) => (
            <OptionCard option={option} key={option.id} />
          ))}
        </div>
      )}
    </section>
  )
}
