import { describe, expect, it } from 'vitest'
import {
  parseProjectQuery,
  queryProjects,
  serializeProjectQuery,
} from '../query.ts'
import { buildOk, rawFact, rawProject } from './fixtures.ts'

const ASOF = '2026-10-19'

const price = (
  slug: string,
  amount: string,
  currency = 'USD',
  priceKind = 'OFFICIAL_LIST_PRICE',
  observedAt = '2026-09-16',
) =>
  rawFact({
    id: `fct_${slug}`,
    value: { kind: 'money', amount, currency, priceKind },
    observedAt,
    recordedAt: observedAt,
  })

const atlas = buildOk([
  rawProject({
    slug: 'alpha',
    name: 'Alpha Shepard',
    operatorName: 'Blue Co',
    facts: [price('alpha', '450000')],
  }),
  rawProject({
    slug: 'beta',
    name: 'Beta Orbit',
    operatorName: 'Orbit Inc',
    missionType: 'ORBITAL',
    classificationVerifiedAt: '2026-01-01',
    facts: [
      price('beta', '55000000', 'USD', 'OFFICIAL_LIST_PRICE', '2026-01-01'),
    ],
  }),
  rawProject({
    slug: 'gamma',
    name: '深蓝亚轨道',
    operatorName: '深蓝航天',
    developmentStage: 'TESTING',
    commercialAvailability: 'PRE_SALE',
    facts: [price('gamma', '1500000', 'CNY', 'PRE_SALE_PRICE')],
  }),
  rawProject({
    slug: 'delta',
    name: 'Delta',
    operatorName: 'Unknown Co',
    classificationVerifiedAt: undefined,
    classificationSourceIds: [],
  }),
  rawProject({ slug: 'archived', name: 'Archived', archivedAt: '2026-10-01' }),
])

const slugs = (r: ReturnType<typeof queryProjects>) =>
  r.items.map((i) => i.project.slug)

describe('项目查询', () => {
  it('按名称与运营公司搜索（大小写不敏感，支持中文）', () => {
    expect(
      slugs(queryProjects(atlas.projects, { q: 'shepard' }, ASOF)),
    ).toEqual(['alpha'])
    expect(
      slugs(queryProjects(atlas.projects, { q: 'ORBIT inc' }, ASOF)),
    ).toEqual(['beta'])
    expect(slugs(queryProjects(atlas.projects, { q: '深蓝' }, ASOF))).toEqual([
      'gamma',
    ])
  })

  it('按类型、阶段、商业状态组合筛选，并排除已归档项目', () => {
    expect(queryProjects(atlas.projects, {}, ASOF).total).toBe(4)
    expect(
      slugs(queryProjects(atlas.projects, { missionTypes: ['ORBITAL'] }, ASOF)),
    ).toEqual(['beta'])
    expect(
      slugs(
        queryProjects(
          atlas.projects,
          { stages: ['TESTING'], availabilities: ['PRE_SALE'] },
          ASOF,
        ),
      ),
    ).toEqual(['gamma'])
    expect(
      queryProjects(
        atlas.projects,
        { stages: ['TESTING'], missionTypes: ['ORBITAL'] },
        ASOF,
      ).total,
    ).toBe(0)
  })

  it('按最近核实时间排序，未核实的项目排在最后', () => {
    expect(
      slugs(queryProjects(atlas.projects, { sort: 'verified-desc' }, ASOF)).at(
        -1,
      ),
    ).toBe('delta')
    expect(
      slugs(
        queryProjects(atlas.projects, { sort: 'verified-asc' }, ASOF),
      ).slice(0, 1),
    ).toEqual(['beta'])
  })

  it('按价格排序只对同币种可比价格生效，其余标记为不可直接比较', () => {
    const result = queryProjects(
      atlas.projects,
      { sort: 'price-desc-USD' },
      ASOF,
    )
    expect(slugs(result).slice(0, 2)).toEqual(['beta', 'alpha'])
    expect(result.items.map((i) => i.priceComparable)).toEqual([
      true,
      true,
      false,
      false,
    ])
  })

  it('分页并限制页码范围', () => {
    const page2 = queryProjects(
      atlas.projects,
      { sort: 'name-asc', pageSize: 3, page: 2 },
      ASOF,
    )
    expect(page2).toMatchObject({ total: 4, page: 2, pageCount: 2 })
    expect(page2.items).toHaveLength(1)
    expect(
      queryProjects(atlas.projects, { pageSize: 3, page: 99 }, ASOF).page,
    ).toBe(2)
  })

  it('URL 参数往返，忽略非法值', () => {
    const params = new URLSearchParams(
      'q=blue&type=ORBITAL,LUNAR&stage=TESTING&sort=price-asc-CNY&page=2&evil=1',
    )
    const query = parseProjectQuery(params)
    expect(query).toMatchObject({
      q: 'blue',
      missionTypes: ['ORBITAL'],
      stages: ['TESTING'],
      sort: 'price-asc-CNY',
      page: 2,
    })
    expect(serializeProjectQuery(query).toString()).toBe(
      'q=blue&type=ORBITAL&stage=TESTING&sort=price-asc-CNY&page=2',
    )
    expect(
      parseProjectQuery(new URLSearchParams('sort=drop+table')).sort,
    ).toBeUndefined()
  })
})
