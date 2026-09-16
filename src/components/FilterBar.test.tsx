import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EMPTY_FILTERS,
  type ActiveFilters,
} from '../features/filters/filterOptions'
import { FilterBar } from './FilterBar'

afterEach(cleanup)

describe('FilterBar', () => {
  it('keeps every dropdown panel closed by default', () => {
    render(
      <FilterBar
        activeFilters={EMPTY_FILTERS}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('button', { name: '亚轨道' }),
    ).not.toBeInTheDocument()
  })

  it('opens a dropdown panel when its trigger is clicked', () => {
    render(
      <FilterBar
        activeFilters={EMPTY_FILTERS}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '按体验类型' }))

    expect(screen.getByRole('button', { name: '亚轨道' })).toBeInTheDocument()
  })

  it('calls onToggle with the dimension and value when a chip inside the panel is clicked', () => {
    const onToggle = vi.fn()
    render(
      <FilterBar
        activeFilters={EMPTY_FILTERS}
        onToggle={onToggle}
        onClear={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '按体验类型' }))
    fireEvent.click(screen.getByRole('button', { name: '亚轨道' }))

    expect(onToggle).toHaveBeenCalledWith('experience', 'suborbital')
  })

  it('marks an active chip and shows a count badge on the trigger', () => {
    const active: ActiveFilters = {
      ...EMPTY_FILTERS,
      experience: ['suborbital'],
    }
    render(
      <FilterBar activeFilters={active} onToggle={vi.fn()} onClear={vi.fn()} />,
    )

    const trigger = screen.getByRole('button', { name: '按体验类型' })
    expect(trigger).toHaveClass('filter-dropdown__trigger--active')
    expect(trigger).toHaveTextContent('1')

    fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: '亚轨道' })).toHaveClass(
      'chip--active',
    )
  })

  it('closes the open panel when another trigger is clicked', () => {
    render(
      <FilterBar
        activeFilters={EMPTY_FILTERS}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '按体验类型' }))
    expect(screen.getByRole('button', { name: '亚轨道' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '按预算' }))
    expect(
      screen.queryByRole('button', { name: '亚轨道' }),
    ).not.toBeInTheDocument()
  })

  it('closes the open panel on an outside click', () => {
    render(
      <FilterBar
        activeFilters={EMPTY_FILTERS}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '按体验类型' }))
    fireEvent.mouseDown(document.body)

    expect(
      screen.queryByRole('button', { name: '亚轨道' }),
    ).not.toBeInTheDocument()
  })

  it('closes the open panel on Escape', () => {
    render(
      <FilterBar
        activeFilters={EMPTY_FILTERS}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '按体验类型' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(
      screen.queryByRole('button', { name: '亚轨道' }),
    ).not.toBeInTheDocument()
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
