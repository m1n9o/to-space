import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { SPACE_OPTIONS } from './data/spaceOptions'

afterEach(cleanup)

describe('App', () => {
  it('renders the hero and disclaimer, and shows every option by default', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '普通人如何上太空？' }),
    ).toBeInTheDocument()
    expect(screen.getByText('⚠ 重要说明：请先区分事实类型')).toBeInTheDocument()
    expect(
      screen.getByText(
        `${SPACE_OPTIONS.length} / ${SPACE_OPTIONS.length} 个方案`,
      ),
    ).toBeInTheDocument()
  })

  it('narrows the card grid when a filter chip is selected, and restores it on clear', () => {
    render(<App />)

    const filterBar = screen
      .getByRole('heading', { name: '筛选方案' })
      .closest('section')!
    fireEvent.click(within(filterBar).getByRole('button', { name: '亚轨道' }))

    const suborbitalCount = SPACE_OPTIONS.filter(
      (option) => option.experienceType === 'suborbital',
    ).length
    expect(
      screen.getByText(`${suborbitalCount} / ${SPACE_OPTIONS.length} 个方案`),
    ).toBeInTheDocument()
    expect(
      within(filterBar).getByRole('button', { name: '亚轨道' }),
    ).toHaveClass('chip--active')

    fireEvent.click(within(filterBar).getByRole('button', { name: '清空筛选' }))

    expect(
      screen.getByText(
        `${SPACE_OPTIONS.length} / ${SPACE_OPTIONS.length} 个方案`,
      ),
    ).toBeInTheDocument()
  })
})
