import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { SpaceOption } from '../data/spaceOptions'
import { CardGrid } from './CardGrid'

afterEach(cleanup)

const option = (id: string, provider: string): SpaceOption => ({
  id,
  provider,
  vehicle: `${provider} vehicle`,
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
})

describe('CardGrid', () => {
  it('shows the filtered/total count and renders a card per option', () => {
    const options = [option('a', 'Provider A'), option('b', 'Provider B')]
    render(<CardGrid options={options} total={5} />)

    expect(screen.getByText('2 / 5 个方案')).toBeInTheDocument()
    expect(screen.getByText('Provider A')).toBeInTheDocument()
    expect(screen.getByText('Provider B')).toBeInTheDocument()
  })

  it('shows an empty-state message when there are no options', () => {
    render(<CardGrid options={[]} total={5} />)

    expect(screen.getByText('0 / 5 个方案')).toBeInTheDocument()
    expect(
      screen.getByText('没有符合当前筛选条件的方案，试试清空筛选器。'),
    ).toBeInTheDocument()
  })
})
