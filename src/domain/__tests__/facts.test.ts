import { describe, expect, it } from 'vitest'
import { checkAppendOnly } from '../appendOnly.ts'
import { buildComparison } from '../compare.ts'
import {
  currentFact,
  currentFacts,
  factHistory,
  factState,
  lastCheckedAt,
  previousVersion,
} from '../facts.ts'
import { projectFreshness } from '../freshness.ts'
import { comparablePrice, priceSummary } from '../pricing.ts'
import { projectTimeline } from '../timeline.ts'
import { buildOk, errorsOf, rawFact, rawProject } from './fixtures.ts'

const ASOF = '2026-10-19'

const q1 = rawFact({
  id: 'fct_date-v1',
  factType: 'TARGET_FLIGHT_DATE',
  value: { kind: 'date', date: '2027-Q1' },
  evidenceStatus: 'COMPANY_TARGET',
  confidenceLevel: 'LOW',
  observedAt: '2026-06-01',
  recordedAt: '2026-06-01',
})
const q2 = rawFact({
  id: 'fct_date-v2',
  factType: 'TARGET_FLIGHT_DATE',
  value: { kind: 'date', date: '2027-Q2' },
  evidenceStatus: 'COMPANY_TARGET',
  confidenceLevel: 'LOW',
  observedAt: '2026-10-05',
  recordedAt: '2026-10-06',
  supersedes: 'fct_date-v1',
})

describe('历史事实与当前有效事实', () => {
  const atlas = buildOk([rawProject({ facts: [q1, q2] })])
  const project = atlas.projects[0]

  it('新增版本后旧记录仍然可查', () => {
    const history = factHistory(project, 'TARGET_FLIGHT_DATE', ASOF)
    expect(history.map((h) => [h.fact.id, h.state])).toEqual([
      ['fct_date-v2', 'CURRENT'],
      ['fct_date-v1', 'SUPERSEDED'],
    ])
  })

  it('能回答：当前目标、上一次目标、变化何时宣布、证据类型', () => {
    const current = currentFact(project, 'TARGET_FLIGHT_DATE', ASOF)!
    expect(current.value).toEqual({ kind: 'date', date: '2027-Q2' })
    expect(previousVersion(project, current)?.value).toEqual({
      kind: 'date',
      date: '2027-Q1',
    })
    expect(current.observedAt).toBe('2026-10-05')
    expect(current.evidenceStatus).toBe('COMPANY_TARGET')
  })

  it('一条记录只能被一个新版本取代，且只能取代同类型记录', () => {
    const fork = { ...q2, id: 'fct_date-v2b' }
    expect(errorsOf([rawProject({ facts: [q1, q2, fork] })]).join()).toContain(
      '不能被多个记录取代',
    )
    const wrongType = rawFact({ id: 'fct_x', supersedes: 'fct_date-v1' })
    expect(errorsOf([rawProject({ facts: [q1, wrongType] })]).join()).toContain(
      '同类型',
    )
  })

  it('过期或被标为过时的事实不会被当作当前事实', () => {
    const expired = rawFact({ id: 'fct_old', validUntil: '2026-01-31' })
    const outdated = rawFact({
      id: 'fct_outdated',
      verifications: [
        {
          at: '2026-10-01',
          by: 'editor',
          status: 'OUTDATED',
          basis: '官网已下架该价格',
        },
      ],
    })
    const future = rawFact({ id: 'fct_future', validFrom: '2027-01-01' })
    const p = buildOk([rawProject({ facts: [expired, outdated, future] })])
      .projects[0]
    expect(currentFacts(p, 'PUBLIC_PRICE', ASOF)).toEqual([])
    expect(p.facts.map((f) => factState(f, ASOF))).toEqual([
      'EXPIRED',
      'OUTDATED',
      'NOT_YET_VALID',
    ])
  })

  it('冲突记录同时返回并标记争议，而不是静默选一个', () => {
    const a = rawFact({
      id: 'fct_a',
      evidenceStatus: 'DISPUTED',
      sourceIds: ['src_official'],
    })
    const b = rawFact({
      id: 'fct_b',
      evidenceStatus: 'DISPUTED',
      sourceIds: ['src_media-a'],
      value: {
        kind: 'money',
        amount: '600000',
        currency: 'USD',
        priceKind: 'MEDIA_REPORTED',
      },
    })
    const p = buildOk([rawProject({ facts: [a, b] })]).projects[0]
    expect(currentFacts(p, 'PUBLIC_PRICE', ASOF)).toHaveLength(2)
    expect(priceSummary(p, ASOF).disputed).toBe(true)
    expect(
      projectFreshness(p, { sources: {} }, ASOF).issues.map((i) => i.code),
    ).toContain('DISPUTED')
  })

  it('最近核实时间：有核实记录取最新一条，无来源则为 null', () => {
    const verified = rawFact({
      verifications: [
        {
          at: '2026-10-19',
          by: 'editor',
          status: 'VERIFIED_OFFICIAL',
          basis: '复核官网',
        },
      ],
    })
    const unsourced = rawFact({
      id: 'fct_u',
      sourceIds: [],
      evidenceStatus: 'UNKNOWN',
    })
    const p = buildOk([rawProject({ facts: [verified, unsourced] })])
      .projects[0]
    expect(lastCheckedAt(p.facts[0])).toBe('2026-10-19')
    expect(lastCheckedAt(p.facts[1])).toBeNull()
  })
})

describe('价格语义', () => {
  const projectWith = (value: unknown, slug = 'p') =>
    rawProject({ slug, facts: [rawFact({ id: `fct_${slug}`, value })] })

  it('未知价格、未公开价格与免费严格区分，都不会显示为 0', () => {
    const atlas = buildOk([
      rawProject({ slug: 'none' }),
      projectWith({ kind: 'undisclosed' }, 'undisclosed'),
      projectWith({ kind: 'free', note: '由基金会赞助' }, 'free'),
    ])
    const [free, none, undisclosed] = atlas.projects.map((p) =>
      priceSummary(p, ASOF),
    )
    expect(none).toMatchObject({ state: 'UNKNOWN', text: '价格未知（待核实）' })
    expect(undisclosed).toMatchObject({
      state: 'UNDISCLOSED',
      text: '暂无可靠公开价格',
    })
    expect(free.state).toBe('FREE')
    for (const s of [none, undisclosed]) {
      expect(s.text).not.toMatch(/免费|无需付费|\b0\b/)
      expect(s.amountMinor).toBeUndefined()
    }
  })

  it('不同币种、历史价格、第三方估算不能参与数值比较', () => {
    const atlas = buildOk([
      projectWith(
        {
          kind: 'money',
          amount: '450000',
          currency: 'USD',
          priceKind: 'OFFICIAL_LIST_PRICE',
        },
        'usd',
      ),
      projectWith(
        {
          kind: 'money',
          amount: '1500000',
          currency: 'CNY',
          priceKind: 'PRE_SALE_PRICE',
        },
        'cny',
      ),
      projectWith(
        {
          kind: 'money',
          amount: '750000',
          currency: 'USD',
          priceKind: 'HISTORICAL_PRICE',
        },
        'hist',
      ),
    ])
    const bySlug = Object.fromEntries(
      atlas.projects.map((p) => [p.slug, priceSummary(p, ASOF)]),
    )
    expect(comparablePrice(bySlug.usd, 'USD')).toBe(45_000_000)
    expect(comparablePrice(bySlug.cny, 'USD')).toBeNull()
    expect(comparablePrice(bySlug.cny, 'CNY')).toBe(150_000_000)
    expect(comparablePrice(bySlug.hist, 'USD')).toBeNull()
  })

  it('对比中缺失的退款政策显示为未找到，而非不可退款', () => {
    const atlas = buildOk([
      rawProject({ slug: 'a' }),
      rawProject({ slug: 'b' }),
    ])
    const refund = buildComparison(atlas.projects, ASOF).find(
      (r) => r.key === 'refund',
    )!
    expect(
      refund.cells.every((c) => c.unknown && c.text === '未找到公开退款政策'),
    ).toBe(true)
  })
})

describe('计划与已发生事件', () => {
  it('目标日期只出现在计划中，不出现在事件时间线', () => {
    const p = buildOk([rawProject({ facts: [q1, q2] })]).projects[0]
    const timeline = projectTimeline(p, ASOF)
    expect(timeline.events).toEqual([])
    expect(timeline.plans.map((f) => f.id)).toEqual(['fct_date-v2'])
  })

  it('目标日期已过且没有飞行结果时提示严重过期', () => {
    const passed = rawFact({
      ...q1,
      id: 'fct_passed',
      value: { kind: 'date', date: '2026-Q2' },
    })
    const p = buildOk([rawProject({ facts: [passed] })]).projects[0]
    const report = projectFreshness(p, { sources: {} }, ASOF)
    expect(report.level).toBe('CRITICAL')
    expect(report.issues.map((i) => i.code)).toContain('TARGET_DATE_PASSED')
  })
})

describe('只追加规则', () => {
  it('允许新增版本与追加核实记录', () => {
    const before = [q1]
    const after = [
      {
        ...q1,
        verifications: [
          { at: '2026-10-19', by: 'e', status: 'OUTDATED', basis: 'x' },
        ],
      },
      q2,
    ]
    expect(checkAppendOnly('f', before, after)).toEqual([])
  })

  it('禁止修改或删除已发布事实及其核实记录', () => {
    expect(
      checkAppendOnly(
        'f',
        [q1],
        [{ ...q1, value: { kind: 'date', date: '2027-Q3' } }],
      )[0].message,
    ).toContain('被修改')
    expect(checkAppendOnly('f', [q1], [])[0].message).toContain('被删除')
    const verified = {
      ...q1,
      verifications: [
        { at: '2026-10-19', by: 'e', status: 'OUTDATED', basis: 'x' },
      ],
    }
    expect(checkAppendOnly('f', [verified], [q1])[0].message).toContain(
      '核实记录',
    )
  })
})
