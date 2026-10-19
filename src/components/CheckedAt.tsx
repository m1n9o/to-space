import { daysBetween } from '../domain/dates.ts'
import { FRESHNESS_RULES } from '../domain/freshness.ts'
import { useAtlas } from '../app/atlasContext.ts'

/** 显示核实日期；没有核实记录时明确显示"未核实" */
export function CheckedAt({ date }: { date: string | null | undefined }) {
  const { asOf } = useAtlas()
  if (!date) return <span className="checked checked-none">未核实</span>
  const stale = daysBetween(date, asOf) > FRESHNESS_RULES.priceMaxAgeDays
  return (
    <span className={stale ? 'checked checked-stale' : 'checked'}>
      核实于 <time dateTime={date}>{date}</time>
      {stale && '（较久未复核）'}
    </span>
  )
}
