import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { SpaceOption } from '../data/spaceOptions'
import { OptionCard } from './OptionCard'

afterEach(cleanup)

const fixture: SpaceOption = {
  id: 'fixture-provider',
  provider: 'Fixture Provider',
  vehicle: 'Fixture Vehicle',
  experienceType: 'suborbital',
  altitudeKm: '100+ km',
  crossesKarmanLine: true,
  flightDuration: '约 11 分钟',
  weightlessness: '数分钟',
  price: '$150,000 可退押金',
  priceStatus: ['PRICE_UNDISCLOSED'],
  deposit: '$150,000 USD',
  bookingStatus: ['CURRENTLY_PAUSED'],
  targetDate: '2028+',
  dateConfidence: 'unclear',
  training: '2 天现场训练',
  medicalRequirements: '安全培训',
  technicalMaturity: '已执行 38 次飞行',
  crewedFlightHistory: '已大量商业载人飞行',
  mainRisks: ['复飞时间未知', '最终票价不公开'],
  badges: ['FLIGHT_PROVEN', 'CURRENTLY_PAUSED'],
  budgetTier: '10m-usd-plus',
  sources: [{ label: 'Official site', url: 'https://example.com/fixture' }],
  lastChecked: '2026-09-16',
}

describe('OptionCard', () => {
  it('renders provider, vehicle, price and risks', () => {
    render(<OptionCard option={fixture} />)

    expect(screen.getByText('Fixture Provider')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Fixture Vehicle' }),
    ).toBeInTheDocument()
    expect(screen.getByText('$150,000 可退押金')).toBeInTheDocument()
    expect(screen.getByText('复飞时间未知')).toBeInTheDocument()
    expect(screen.getByText('Last checked: 2026-09-16')).toBeInTheDocument()
  })

  it('renders a badge for each status in badges', () => {
    render(<OptionCard option={fixture} />)

    const headerBadges = within(document.querySelector('.card__badges')!)
    expect(headerBadges.getByText('已验证载人飞行')).toBeInTheDocument()
    expect(headerBadges.getByText('当前暂停')).toBeInTheDocument()
  })

  it('shows the deposit placeholder when there is no deposit', () => {
    render(<OptionCard option={{ ...fixture, deposit: null }} />)

    expect(screen.getByText('无 / 不适用')).toBeInTheDocument()
  })

  it('links to each source with the option label', () => {
    render(<OptionCard option={fixture} />)

    const link = screen.getByRole('link', { name: 'Official site' })
    expect(link).toHaveAttribute('href', 'https://example.com/fixture')
  })
})
