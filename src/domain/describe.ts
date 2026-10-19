import { formatPartialDate } from './dates.ts'
import {
  COMMERCIAL_AVAILABILITY_LABELS,
  QUANTITY_UNIT_LABELS,
  type QuantityQualifier,
} from './enums.ts'
import type { Fact } from './model.ts'
import { describePriceFact } from './pricing.ts'

const QUALIFIER_PREFIX: Record<QuantityQualifier, string> = {
  EXACT: '',
  APPROX: '约 ',
  MIN: '至少 ',
  MAX: '至多 ',
}

/** 将事实值格式化为面向用户的文本。缺失信息一律明确说明，不做推断。 */
export function describeFact(fact: Fact): string {
  const v = fact.value
  switch (v.kind) {
    case 'money':
    case 'free':
      return describePriceFact(fact)
    case 'undisclosed':
      if (
        fact.factType === 'PUBLIC_PRICE' ||
        fact.factType === 'DEPOSIT_AMOUNT'
      )
        return describePriceFact(fact)
      return v.note ? `未公开（${v.note}）` : '未公开'
    case 'date':
      return formatPartialDate(v.date)
    case 'quantity':
      return `${QUALIFIER_PREFIX[v.qualifier]}${v.amount} ${QUANTITY_UNIT_LABELS[v.unit]}`
    case 'availability':
      return COMMERCIAL_AVAILABILITY_LABELS[v.status]
    case 'text':
      return v.text
  }
}
