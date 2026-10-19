// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { COMPLETION_EVENT_TYPES } from '../src/domain/enums.ts'
import { loadAtlas } from './loadAtlas.ts'

describe('真实数据集', () => {
  it('全部数据文件通过校验，且加载结果确定（可重复执行）', async () => {
    const first = await loadAtlas()
    const errors = first.issues.filter((i) => i.severity === 'error')
    expect(
      errors,
      errors.map((e) => `${e.path}: ${e.message}`).join('\n'),
    ).toEqual([])
    const second = await loadAtlas()
    expect(JSON.stringify(second.atlas)).toBe(JSON.stringify(first.atlas))
  })

  it('每个项目都有官方入口，或明确记录了缺失', async () => {
    const { atlas } = await loadAtlas()
    for (const p of atlas!.projects)
      expect(p.officialWebsiteUrl, p.slug).toBeTruthy()
  })

  it('已完成类事件都有发生日期', async () => {
    const { atlas } = await loadAtlas()
    const completions = atlas!.projects
      .flatMap((p) => p.events)
      .filter((e) => COMPLETION_EVENT_TYPES.includes(e.eventType))
    expect(completions.length).toBeGreaterThan(0)
    for (const e of completions) expect(e.occurredAt, e.id).toBeTruthy()
  })
})
