import { describe, expect, it } from 'vitest'
import { altitudePosition, altitudeScale } from '../altitude.ts'
import { buildOk, rawFact, rawProject } from './fixtures.ts'

const ASOF = '2026-10-19'
const altitude = (slug: string, amount: number, qualifier = 'APPROX') =>
  rawFact({
    id: `fct_${slug}-alt`,
    factType: 'ALTITUDE',
    value: { kind: 'quantity', amount, unit: 'KM', qualifier },
  })

const atlas = buildOk([
  rawProject({
    slug: 'vg',
    operatorName: 'Virgin Galactic',
    facts: [altitude('vg', 91)],
  }),
  rawProject({
    slug: 'balloon',
    operatorName: 'Zephalto',
    facts: [altitude('balloon', 25)],
  }),
  rawProject({
    slug: 'bo',
    operatorName: 'Blue Origin',
    facts: [altitude('bo', 100, 'MIN')],
  }),
  rawProject({
    slug: 'station',
    operatorName: 'Vast（SpaceX Dragon 运输）',
    facts: [altitude('station', 425)],
  }),
  rawProject({ slug: 'none', operatorName: 'No data' }),
])
const bySlug = (slug: string) => atlas.projects.find((p) => p.slug === slug)!

describe('高度标尺', () => {
  it('对数刻度并截断到 10–500 km', () => {
    expect(altitudePosition(10)).toBe(0)
    expect(altitudePosition(500)).toBe(100)
    expect(altitudePosition(1)).toBe(0)
    expect(altitudePosition(1000)).toBe(100)
    expect(altitudePosition(91)).toBeLessThan(altitudePosition(100))
  })

  it('低于卡门线的项目被标出；"至少 100 km"不算低于', () => {
    expect(altitudeScale(bySlug('vg'), atlas, ASOF)!.belowKarman).toBe(true)
    expect(altitudeScale(bySlug('bo'), atlas, ASOF)!.belowKarman).toBe(false)
  })

  it('参照点来自其他项目，去掉与卡门线重合的值，并清理运营方名称', () => {
    const scale = altitudeScale(bySlug('vg'), atlas, ASOF)!
    expect(scale.references.map((r) => [r.km, r.label])).toEqual([
      [25, 'Zephalto'],
      [425, 'Vast'],
    ])
  })

  it('没有以 km 为单位的高度记录时不生成标尺', () => {
    expect(altitudeScale(bySlug('none'), atlas, ASOF)).toBeNull()
  })
})
