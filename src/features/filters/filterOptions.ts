import type { BoundaryKey, SpaceOption } from '../../data/spaceOptions'

export type FilterDimension = 'experience' | 'budget' | 'status' | 'boundary'

export type ActiveFilters = Record<FilterDimension, string[]>

export const EMPTY_FILTERS: ActiveFilters = {
  experience: [],
  budget: [],
  status: [],
  boundary: [],
}

export function boundaryKeyFor(option: SpaceOption): BoundaryKey {
  if (option.crossesKarmanLine === true) return 'crosses'
  if (option.crossesKarmanLine === false) return 'not-crosses'
  return 'target'
}

export function filterOptions(
  options: SpaceOption[],
  filters: ActiveFilters,
): SpaceOption[] {
  return options.filter((option) => {
    if (
      filters.experience.length &&
      !filters.experience.includes(option.experienceType)
    )
      return false
    if (filters.budget.length && !filters.budget.includes(option.budgetTier))
      return false
    if (
      filters.status.length &&
      !option.badges.some((badge) => filters.status.includes(badge))
    )
      return false
    if (
      filters.boundary.length &&
      !filters.boundary.includes(boundaryKeyFor(option))
    )
      return false
    return true
  })
}

export function toggleFilterValue(
  filters: ActiveFilters,
  dimension: FilterDimension,
  value: string,
): ActiveFilters {
  const current = filters[dimension]
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
  return { ...filters, [dimension]: next }
}

export function hasActiveFilters(filters: ActiveFilters): boolean {
  return Object.values(filters).some((list) => list.length > 0)
}
