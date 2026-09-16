import { describe, expect, it } from 'vitest'
import type { SpaceOption } from '../../data/spaceOptions'
import {
  EMPTY_FILTERS,
  boundaryKeyFor,
  filterOptions,
  hasActiveFilters,
  toggleFilterValue,
  type ActiveFilters,
} from './filterOptions'

const option = (overrides: Partial<SpaceOption>): SpaceOption => ({
  id: 'fixture',
  provider: 'Fixture Provider',
  vehicle: 'Fixture Vehicle',
  country: 'Fixture Country',
  experienceType: 'suborbital',
  altitudeKm: '100 km',
  crossesKarmanLine: true,
  flightDuration: '10 分钟',
  weightlessness: '数分钟',
  price: '未公开',
  priceStatus: ['PRICE_UNDISCLOSED'],
  deposit: null,
  bookingStatus: ['BOOKING_OPEN'],
  targetDate: '未公开',
  dateConfidence: 'unclear',
  training: '未公开',
  medicalRequirements: '未公开',
  technicalMaturity: '未公开',
  crewedFlightHistory: '无',
  mainRisks: [],
  badges: ['PRICE_UNDISCLOSED'],
  budgetTier: '10m-usd-plus',
  sources: [],
  lastChecked: '2026-09-16',
  ...overrides,
})

const suborbitalCrossed = option({
  id: 'suborbital-crossed',
  experienceType: 'suborbital',
  crossesKarmanLine: true,
  budgetTier: '10m-usd-plus',
  badges: ['FLIGHT_PROVEN'],
})
const suborbitalTarget = option({
  id: 'suborbital-target',
  experienceType: 'suborbital',
  crossesKarmanLine: 'target',
  budgetTier: 'lt-3m-cny',
  badges: ['PRE_SALE', 'UNDER_DEVELOPMENT'],
})
const nearSpace = option({
  id: 'near-space',
  experienceType: 'near-space',
  crossesKarmanLine: false,
  budgetTier: '500k-1m-usd',
  badges: ['NOT_ACTUAL_SPACE', 'WAITLIST'],
})
const orbital = option({
  id: 'orbital',
  experienceType: 'orbital',
  crossesKarmanLine: true,
  budgetTier: '10m-usd-plus',
  badges: ['FLIGHT_PROVEN', 'PRICE_UNDISCLOSED'],
})

const allOptions = [suborbitalCrossed, suborbitalTarget, nearSpace, orbital]

describe('boundaryKeyFor', () => {
  it('maps true to crosses', () => {
    expect(boundaryKeyFor(suborbitalCrossed)).toBe('crosses')
  })

  it('maps false to not-crosses', () => {
    expect(boundaryKeyFor(nearSpace)).toBe('not-crosses')
  })

  it('maps the "target" sentinel to target', () => {
    expect(boundaryKeyFor(suborbitalTarget)).toBe('target')
  })
})

describe('filterOptions', () => {
  it('returns every option when no filters are active', () => {
    expect(filterOptions(allOptions, EMPTY_FILTERS)).toEqual(allOptions)
  })

  it('filters by a single dimension', () => {
    const filters: ActiveFilters = {
      ...EMPTY_FILTERS,
      experience: ['near-space'],
    }
    expect(filterOptions(allOptions, filters)).toEqual([nearSpace])
  })

  it('combines multiple dimensions with AND', () => {
    const filters: ActiveFilters = {
      ...EMPTY_FILTERS,
      experience: ['suborbital'],
      budget: ['lt-3m-cny'],
    }
    expect(filterOptions(allOptions, filters)).toEqual([suborbitalTarget])
  })

  it('combines multiple values in the same dimension with OR', () => {
    const filters: ActiveFilters = {
      ...EMPTY_FILTERS,
      experience: ['near-space', 'orbital'],
    }
    expect(filterOptions(allOptions, filters)).toEqual([nearSpace, orbital])
  })

  it('filters by status badge', () => {
    const filters: ActiveFilters = {
      ...EMPTY_FILTERS,
      status: ['NOT_ACTUAL_SPACE'],
    }
    expect(filterOptions(allOptions, filters)).toEqual([nearSpace])
  })

  it('filters by Kármán line boundary', () => {
    const filters: ActiveFilters = { ...EMPTY_FILTERS, boundary: ['target'] }
    expect(filterOptions(allOptions, filters)).toEqual([suborbitalTarget])
  })
})

describe('toggleFilterValue', () => {
  it('adds a value that is not yet active', () => {
    const next = toggleFilterValue(EMPTY_FILTERS, 'experience', 'suborbital')
    expect(next.experience).toEqual(['suborbital'])
  })

  it('removes a value that is already active', () => {
    const withValue: ActiveFilters = {
      ...EMPTY_FILTERS,
      experience: ['suborbital'],
    }
    const next = toggleFilterValue(withValue, 'experience', 'suborbital')
    expect(next.experience).toEqual([])
  })

  it('does not mutate other dimensions', () => {
    const withValue: ActiveFilters = { ...EMPTY_FILTERS, budget: ['sponsored'] }
    const next = toggleFilterValue(withValue, 'experience', 'orbital')
    expect(next.budget).toEqual(['sponsored'])
  })
})

describe('hasActiveFilters', () => {
  it('is false when every dimension is empty', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false)
  })

  it('is true when any dimension has a value', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, status: ['SOLD_OUT'] })).toBe(
      true,
    )
  })
})
