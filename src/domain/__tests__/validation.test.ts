import { describe, expect, it } from 'vitest'
import { parsePartialDate } from '../dates.ts'
import { formatMoney, parseAmountToMinor } from '../money.ts'
import { errorsOf, rawFact, rawProject } from './fixtures.ts'

const has = (errors: string[], text: string) =>
  expect(
    errors.some((e) => e.includes(text)),
    errors.join('\n'),
  ).toBe(true)

describe('项目字段校验', () => {
  it('合法项目通过校验', () => {
    expect(errorsOf([rawProject()])).toEqual([])
  })

  it('slug 必须唯一', () => {
    has(errorsOf([rawProject(), rawProject({ id: 'prj_other' })]), 'slug 重复')
  })

  it('拒绝非法 slug、未知枚举值与未知字段', () => {
    has(errorsOf([rawProject({ slug: 'Bad Slug' })]), 'slug')
    has(errorsOf([rawProject({ missionType: 'LUNAR' })]), 'missionType')
    has(errorsOf([rawProject({ priceText: '$1' })]), 'priceText')
  })

  it('官方链接必须是合法的 http(s) URL', () => {
    has(
      errorsOf([rawProject({ officialBookingUrl: 'javascript:alert(1)' })]),
      'officialBookingUrl',
    )
    has(
      errorsOf([rawProject({ officialWebsiteUrl: 'not a url' })]),
      'officialWebsiteUrl',
    )
  })

  it('依赖的项目必须存在', () => {
    has(
      errorsOf([rawProject({ dependsOnProjectIds: ['prj_missing'] })]),
      'prj_missing',
    )
  })
})

describe('价格与币种', () => {
  it('金额必须带合法币种', () => {
    const fact = rawFact({
      value: { kind: 'money', amount: '100', priceKind: 'OFFICIAL_LIST_PRICE' },
    })
    has(errorsOf([rawProject({ facts: [fact] })]), 'currency')
    const bad = rawFact({
      value: {
        kind: 'money',
        amount: '100',
        currency: 'XYZ',
        priceKind: 'OFFICIAL_LIST_PRICE',
      },
    })
    has(errorsOf([rawProject({ facts: [bad] })]), 'currency')
  })

  it('金额不能为负，小数位不能超过币种精度', () => {
    const negative = rawFact({
      value: {
        kind: 'money',
        amount: '-1',
        currency: 'USD',
        priceKind: 'OFFICIAL_LIST_PRICE',
      },
    })
    has(errorsOf([rawProject({ facts: [negative] })]), 'amount')
    const yen = rawFact({
      value: {
        kind: 'money',
        amount: '10.5',
        currency: 'JPY',
        priceKind: 'OFFICIAL_LIST_PRICE',
      },
    })
    has(errorsOf([rawProject({ facts: [yen] })]), '精度')
  })

  it('金额以最小货币单位整数存储', () => {
    expect(parseAmountToMinor('750000', 'USD')).toBe(75_000_000)
    expect(parseAmountToMinor('1500000.5', 'CNY')).toBe(150_000_050)
    expect(parseAmountToMinor('0.123', 'USD')).toBeNull()
    expect(formatMoney(75_000_000, 'USD')).toBe('US$750,000 USD')
  })

  it('事实类型限定可用的值类型（价格不能是自由文本）', () => {
    const fact = rawFact({ value: { kind: 'text', text: '约 45 万美元' } })
    has(errorsOf([rawProject({ facts: [fact] })]), '不允许值类型 text')
  })
})

describe('日期', () => {
  it('日期区间起止顺序必须合理', () => {
    const fact = rawFact({ validFrom: '2026-10-01', validUntil: '2026-09-01' })
    has(
      errorsOf([rawProject({ facts: [fact] })]),
      'validUntil 不能早于 validFrom',
    )
    const recorded = rawFact({
      observedAt: '2026-09-20',
      recordedAt: '2026-09-16',
    })
    has(
      errorsOf([rawProject({ facts: [recorded] })]),
      'recordedAt 不能早于 observedAt',
    )
  })

  it('拒绝不存在的日期', () => {
    has(
      errorsOf([rawProject({ firstPublishedAt: '2026-02-30' })]),
      'firstPublishedAt',
    )
  })

  it('部分精度日期展开为区间', () => {
    expect(parsePartialDate('2027-Q1')).toMatchObject({
      start: '2027-01-01',
      end: '2027-03-31',
    })
    expect(parsePartialDate('2028-H2')).toMatchObject({
      start: '2028-07-01',
      end: '2028-12-31',
    })
    expect(parsePartialDate('2028-02')).toMatchObject({ end: '2028-02-29' })
    expect(parsePartialDate('2027-13')).toBeNull()
  })
})

describe('来源与证据', () => {
  it('引用的来源必须存在', () => {
    has(
      errorsOf([rawProject({ facts: [rawFact({ sourceIds: ['src_nope'] })] })]),
      'src_nope',
    )
  })

  it('没有来源的事实不能标记为已核实', () => {
    const fact = rawFact({ sourceIds: [], evidenceStatus: 'VERIFIED_OFFICIAL' })
    has(errorsOf([rawProject({ facts: [fact] })]), '只能标记为 UNKNOWN')
    const unknown = rawFact({ sourceIds: [], evidenceStatus: 'UNKNOWN' })
    expect(errorsOf([rawProject({ facts: [unknown] })])).toEqual([])
  })

  it('VERIFIED_OFFICIAL 需要官方来源', () => {
    const fact = rawFact({ sourceIds: ['src_media-a'] })
    has(errorsOf([rawProject({ facts: [fact] })]), '官方来源')
  })

  it('转载不算独立证据：同一报道的两次转载不能构成 CORROBORATED', () => {
    const reprinted = rawFact({
      evidenceStatus: 'CORROBORATED',
      sourceIds: ['src_media-a', 'src_media-b'],
    })
    has(errorsOf([rawProject({ facts: [reprinted] })]), '相互独立')
    const independent = rawFact({
      evidenceStatus: 'CORROBORATED',
      sourceIds: ['src_media-a', 'src_official'],
    })
    expect(errorsOf([rawProject({ facts: [independent] })])).toEqual([])
  })

  it('同一 URL 不能登记为两个来源', () => {
    const dup = {
      id: 'src_dup',
      url: 'https://EXAMPLE.com/official/#top',
      title: 'Dup',
      publisher: 'X',
      sourceType: 'OTHER',
      accessedAt: '2026-09-16',
      language: 'en',
    }
    const errors = errorsOf(
      [rawProject()],
      [
        {
          id: 'src_official',
          url: 'https://example.com/official',
          title: 'T',
          publisher: 'P',
          sourceType: 'OTHER',
          accessedAt: '2026-09-16',
          language: 'en',
        },
        dup,
      ],
    )
    has(errors, '同一 URL')
  })

  it('来源 URL 必须是 http(s)', () => {
    has(
      errorsOf(
        [rawProject()],
        [{ ...rawSourceBase(), url: 'ftp://example.com/x' }],
      ),
      'url',
    )
  })
})

describe('事件', () => {
  const event = (overrides: Record<string, unknown>) => ({
    id: 'evt_1',
    eventType: 'CREWED_FLIGHT_COMPLETED',
    title: 'Flight',
    occurredAt: '2025-08-03',
    recordedAt: '2026-09-16',
    verificationStatus: 'VERIFIED_OFFICIAL',
    sourceIds: ['src_official'],
    ...overrides,
  })

  it('公司目标不能记录为已完成事件', () => {
    has(
      errorsOf([
        rawProject({
          events: [event({ verificationStatus: 'COMPANY_TARGET' })],
        }),
      ]),
      'COMPANY_TARGET',
    )
  })

  it('已完成事件必须有发生日期，且不能在未来', () => {
    has(
      errorsOf([
        rawProject({
          events: [event({ occurredAt: undefined, announcedAt: '2025-01' })],
        }),
      ]),
      'occurredAt',
    )
    has(
      errorsOf([rawProject({ events: [event({ occurredAt: '2027-02' })] })]),
      '不能晚于录入日期',
    )
  })

  it('非完成类事件可以只有公告日期', () => {
    const delay = event({
      eventType: 'TARGET_DATE_CHANGED',
      occurredAt: undefined,
      announcedAt: '2026-08-06',
      verificationStatus: 'COMPANY_TARGET',
    })
    expect(errorsOf([rawProject({ events: [delay] })])).toEqual([])
  })
})

function rawSourceBase() {
  return {
    id: 'src_official',
    url: 'https://example.com/official',
    title: 'T',
    publisher: 'P',
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    accessedAt: '2026-09-16',
    language: 'en',
  }
}
