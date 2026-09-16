import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Checklist } from './Checklist'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

describe('Checklist', () => {
  it('renders all 18 questions', () => {
    render(<Checklist />)

    expect(screen.getAllByRole('listitem')).toHaveLength(18)
  })

  it('copies the numbered checklist to the clipboard and reverts the button label after a delay', async () => {
    vi.useFakeTimers()
    render(<Checklist />)

    fireEvent.click(screen.getByRole('button', { name: '复制清单' }))
    await act(async () => {})

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    const copiedText = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0]
    expect(copiedText.startsWith('1. Deposit 是否 refundable？')).toBe(true)
    expect(copiedText.split('\n')).toHaveLength(18)
    expect(screen.getByRole('button', { name: '已复制 ✓' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(screen.getByRole('button', { name: '复制清单' })).toBeInTheDocument()
  })
})
