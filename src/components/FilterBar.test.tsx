import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EMPTY_FILTERS,
  type ActiveFilters,
} from '../features/filters/filterOptions'
import { FilterBar } from './FilterBar'

afterEach(cleanup)

describe('FilterBar', () => {
  it('calls onToggle with the dimension and value when a chip is clicked', () => {
    const onToggle = vi.fn()
    render(
      <FilterBar
        activeFilters={EMPTY_FILTERS}
        onToggle={onToggle}
        onClear={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '亚轨道' }))

    expect(onToggle).toHaveBeenCalledWith('experience', 'suborbital')
  })

  it('marks an active chip with the active class', () => {
    const active: ActiveFilters = {
      ...EMPTY_FILTERS,
      experience: ['suborbital'],
    }
    render(
      <FilterBar activeFilters={active} onToggle={vi.fn()} onClear={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: '亚轨道' })).toHaveClass(
      'chip--active',
    )
    expect(screen.getByRole('button', { name: '轨道' })).not.toHaveClass(
      'chip--active',
    )
  })

  it('hides the clear button when no filters are active', () => {
    render(
      <FilterBar
        activeFilters={EMPTY_FILTERS}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('button', { name: '清空筛选' }),
    ).not.toBeInTheDocument()
  })

  it('shows the clear button and calls onClear when filters are active', () => {
    const onClear = vi.fn()
    const active: ActiveFilters = { ...EMPTY_FILTERS, status: ['SOLD_OUT'] }
    render(
      <FilterBar activeFilters={active} onToggle={vi.fn()} onClear={onClear} />,
    )

    fireEvent.click(screen.getByRole('button', { name: '清空筛选' }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
