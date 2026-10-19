import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  buildOk,
  rawFact,
  rawProject,
} from '../../domain/__tests__/fixtures.ts'
import { renderApp } from '../../test/renderWithAtlas.tsx'

const atlas = buildOk([
  rawProject({
    slug: 'alpha',
    name: 'Alpha Flight',
    operatorName: 'Alpha Co',
    facts: [rawFact({ id: 'fct_alpha-price' })],
    events: [
      {
        id: 'evt_alpha-flight',
        eventType: 'CREWED_FLIGHT_COMPLETED',
        title: 'First crewed flight',
        occurredAt: '2025-08-03',
        recordedAt: '2026-09-16',
        verificationStatus: 'VERIFIED_OFFICIAL',
        sourceIds: ['src_official'],
      },
    ],
  }),
  rawProject({
    slug: 'beta',
    name: 'Beta Orbit',
    operatorName: 'Beta Inc',
    missionType: 'ORBITAL',
    facts: [
      rawFact({
        id: 'fct_beta-target',
        factType: 'TARGET_FLIGHT_DATE',
        value: { kind: 'date', date: '2027-Q2' },
        evidenceStatus: 'COMPANY_TARGET',
      }),
    ],
  }),
])

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('项目列表页', () => {
  it('显示项目总数，缺失价格显示为未知而不是 0 或免费', () => {
    renderApp(atlas, '/')
    expect(screen.getByText(/收录/)).toHaveTextContent('收录 2 个')
    const betaRow = screen
      .getByRole('link', { name: 'Beta Orbit' })
      .closest('tr')!
    expect(within(betaRow).getByText('价格未知（待核实）')).toBeInTheDocument()
    expect(betaRow).not.toHaveTextContent(/免费|\$0/)
  })

  it('搜索与筛选通过 URL 参数生效', async () => {
    renderApp(atlas, '/?type=ORBITAL')
    expect(screen.getByRole('status')).toHaveTextContent('共 1 个结果')
    expect(
      screen.queryByRole('link', { name: 'Alpha Flight' }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox', { name: /^轨道飞行/ }))
    expect(screen.getByRole('status')).toHaveTextContent('共 2 个结果')

    await userEvent.type(screen.getByRole('searchbox'), 'alpha')
    expect(screen.getByRole('status')).toHaveTextContent('共 1 个结果')
  })
})

describe('项目详情页', () => {
  it('公司目标只出现在"计划中"，不出现在已发生事件中', () => {
    renderApp(atlas, '/projects/beta')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Beta Orbit',
    )
    expect(screen.getByText('计划中（尚未发生）')).toBeInTheDocument()
    expect(screen.getByText('暂未收录事件。')).toBeInTheDocument()
    expect(screen.getByText('尚未确认公开购买渠道')).toBeInTheDocument()
    expect(
      screen.getByText('未找到公开退款政策（不代表不可退款）'),
    ).toBeInTheDocument()
  })

  it('来源以新窗口打开且带 noopener', () => {
    renderApp(atlas, '/projects/alpha')
    const link = screen.getAllByRole('link', { name: 'Official page' })[0]
    expect(link).toHaveAttribute('href', 'https://example.com/official')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('未知项目显示未找到', () => {
    renderApp(atlas, '/projects/nope')
    expect(
      screen.getByRole('heading', { name: '未找到该页面' }),
    ).toBeInTheDocument()
  })
})

describe('对比页', () => {
  it('并列展示两个项目，缺失数据显示为未知', () => {
    renderApp(atlas, '/compare?ids=alpha,beta')
    const table = screen.getByRole('table')
    const priceRow = within(table)
      .getByRole('rowheader', { name: '最新票价' })
      .closest('tr')!
    expect(priceRow).toHaveTextContent('US$450,000 USD（官方公开价）')
    expect(priceRow).toHaveTextContent('价格未知（待核实）')
    const crewedRow = within(table)
      .getByRole('rowheader', { name: '载人飞行证据' })
      .closest('tr')!
    expect(crewedRow).toHaveTextContent('First crewed flight')
    expect(crewedRow).toHaveTextContent('数据集中无已完成的载人飞行记录')
  })

  it('少于两个项目时提示选择', () => {
    renderApp(atlas, '/compare?ids=alpha')
    expect(screen.getByText('请至少选择 2 个项目。')).toBeInTheDocument()
  })
})
