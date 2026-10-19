import { parsePartialDate } from './dates.ts'
import { currentFacts } from './facts.ts'
import type { Fact, Project, ProjectEvent } from './model.ts'

// 时间线：已发生/已公告的事件与"计划中的目标"分开返回。
// 未来计划来自 TARGET_FLIGHT_DATE 事实，永远不会被渲染为已发生事件。

export interface Timeline {
  events: ProjectEvent[]
  plans: Fact[]
}

/** 事件排序日期：优先实际发生日期，其次公告日期 */
export function eventSortDate(event: ProjectEvent): string {
  const raw = event.occurredAt ?? event.announcedAt!
  return parsePartialDate(raw)?.start ?? raw
}

export function projectTimeline(project: Project, asOf: string): Timeline {
  const events = [...project.events].sort((a, b) => {
    const da = eventSortDate(a)
    const db = eventSortDate(b)
    return da === db ? 0 : da < db ? 1 : -1
  })
  return { events, plans: currentFacts(project, 'TARGET_FLIGHT_DATE', asOf) }
}
