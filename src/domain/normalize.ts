import type { z } from 'zod'
import { parsePartialDate } from './dates.ts'
import {
  COMPLETION_EVENT_TYPES,
  OFFICIAL_SOURCE_TYPES,
  type EvidenceStatus,
} from './enums.ts'
import { effectiveStatus } from './facts.ts'
import type {
  Atlas,
  DataIssue,
  Fact,
  FactValue,
  Project,
  ProjectEvent,
} from './model.ts'
import { parseAmountToMinor } from './money.ts'
import {
  projectFileSchema,
  sourcesFileSchema,
  type ProjectFile,
  type Source,
} from './schema.ts'

// 将原始数据（已解析的 YAML 对象）校验并规范化为 Atlas。
// 结构错误由 Zod 报告，跨记录的业务规则在这里检查。有任何 error 时不生成 Atlas。

export interface RawProjectFile {
  path: string
  data: unknown
}

export interface NormalizeResult {
  atlas: Atlas | null
  issues: DataIssue[]
}

function zodIssues(path: string, error: z.ZodError): DataIssue[] {
  return error.issues.map((issue) => ({
    severity: 'error',
    path: [path, ...issue.path.map(String)].join('.'),
    message: issue.message,
  }))
}

/** 用于来源去重的规范 URL：去掉 fragment、末尾斜杠，主机名小写 */
export function canonicalizeUrl(raw: string): string {
  const url = new URL(raw)
  url.hash = ''
  url.hostname = url.hostname.toLowerCase()
  let text = url.toString()
  if (text.endsWith('/') && url.pathname !== '/') text = text.slice(0, -1)
  return text
}

/** 追溯转载链，返回原始来源 ID：多家媒体转载同一报道只算一份独立证据 */
export function rootSourceId(
  sources: Record<string, Source>,
  sourceId: string,
): string {
  const seen = new Set<string>()
  let current = sourceId
  while (sources[current]?.republishedFromId && !seen.has(current)) {
    seen.add(current)
    current = sources[current].republishedFromId!
  }
  return current
}

export function independentSourceCount(
  sources: Record<string, Source>,
  sourceIds: readonly string[],
): number {
  return new Set(sourceIds.map((id) => rootSourceId(sources, id))).size
}

/** 检查证据状态与所给来源是否匹配 */
export function evidenceIssue(
  status: EvidenceStatus,
  sourceIds: readonly string[],
  sources: Record<string, Source>,
): string | null {
  const known = sourceIds.filter((id) => sources[id])
  if (known.length === 0 && status !== 'UNKNOWN') {
    return `没有来源的记录只能标记为 UNKNOWN（当前为 ${status}）`
  }
  if (
    status === 'VERIFIED_OFFICIAL' &&
    !known.some((id) => OFFICIAL_SOURCE_TYPES.includes(sources[id].sourceType))
  ) {
    return 'VERIFIED_OFFICIAL 需要至少一个官方来源'
  }
  if (status === 'CORROBORATED' && independentSourceCount(sources, known) < 2) {
    return 'CORROBORATED 需要至少两个相互独立的来源（转载不计）'
  }
  return null
}

function normalizeValue(
  fact: ProjectFile['facts'][number],
  path: string,
  issues: DataIssue[],
): FactValue {
  if (fact.value.kind !== 'money') return fact.value
  const amountMinor = parseAmountToMinor(fact.value.amount, fact.value.currency)
  if (amountMinor === null) {
    issues.push({
      severity: 'error',
      path: `${path}.value.amount`,
      message: `金额 ${fact.value.amount} 与币种 ${fact.value.currency} 的精度不符或超出范围`,
    })
  }
  return { ...fact.value, amountMinor: amountMinor ?? 0 }
}

export function normalizeAtlas(
  rawProjects: readonly RawProjectFile[],
  rawSources: unknown,
  sourcesPath = 'data/sources.yaml',
): NormalizeResult {
  const issues: DataIssue[] = []
  const err = (path: string, message: string) =>
    issues.push({ severity: 'error', path, message })
  const warn = (path: string, message: string) =>
    issues.push({ severity: 'warning', path, message })

  // ---- Sources ----
  const sources: Record<string, Source> = {}
  const parsedSources = sourcesFileSchema.safeParse(rawSources)
  if (!parsedSources.success) {
    issues.push(...zodIssues(sourcesPath, parsedSources.error))
  } else {
    const byCanonical = new Map<string, string>()
    parsedSources.data.sources.forEach((source, i) => {
      const path = `${sourcesPath}.sources.${i}(${source.id})`
      if (sources[source.id]) err(path, `来源 ID 重复：${source.id}`)
      sources[source.id] = source
      const canonical = canonicalizeUrl(source.canonicalUrl ?? source.url)
      const dup = byCanonical.get(canonical)
      if (dup) err(path, `与 ${dup} 指向同一 URL，应复用已有来源`)
      byCanonical.set(canonical, source.id)
      if (source.publishedAt && source.publishedAt > source.accessedAt) {
        err(path, 'accessedAt 不能早于 publishedAt')
      }
      if (source.linkStatus === 'UNCHECKED') warn(path, '链接状态尚未检查')
    })
    for (const source of Object.values(sources)) {
      if (source.republishedFromId && !sources[source.republishedFromId]) {
        err(
          `${sourcesPath}(${source.id})`,
          `republishedFromId 不存在：${source.republishedFromId}`,
        )
      }
    }
  }

  const checkSources = (path: string, ids: readonly string[]) => {
    for (const id of ids) {
      if (!sources[id]) err(path, `引用了不存在的来源：${id}`)
    }
  }

  // ---- Projects ----
  const projects: Project[] = []
  const projectIds = new Set<string>()
  const slugs = new Set<string>()
  const factIds = new Set<string>()
  const eventIds = new Set<string>()

  for (const raw of rawProjects) {
    const parsed = projectFileSchema.safeParse(raw.data)
    if (!parsed.success) {
      issues.push(...zodIssues(raw.path, parsed.error))
      continue
    }
    const file = parsed.data
    const p = raw.path

    if (projectIds.has(file.id)) err(p, `项目 ID 重复：${file.id}`)
    if (slugs.has(file.slug)) err(p, `slug 重复：${file.slug}`)
    projectIds.add(file.id)
    slugs.add(file.slug)

    checkSources(`${p}.classificationSourceIds`, file.classificationSourceIds)
    if (
      file.classificationVerifiedAt &&
      file.classificationSourceIds.length === 0
    ) {
      err(p, '有 classificationVerifiedAt 时必须提供 classificationSourceIds')
    }
    file.assessments.forEach((a, i) =>
      checkSources(`${p}.assessments.${i}`, a.sourceIds),
    )

    // Facts
    const facts: Fact[] = file.facts.map((fact, i) => {
      const fp = `${p}.facts.${i}(${fact.id})`
      if (factIds.has(fact.id)) err(fp, `事实 ID 重复：${fact.id}`)
      factIds.add(fact.id)
      checkSources(`${fp}.sourceIds`, fact.sourceIds)

      const problem = evidenceIssue(
        fact.evidenceStatus,
        fact.sourceIds,
        sources,
      )
      if (problem) err(`${fp}.evidenceStatus`, problem)

      let previousAt = fact.observedAt
      fact.verifications.forEach((v, j) => {
        const vp = `${fp}.verifications.${j}`
        checkSources(`${vp}.sourceIds`, v.sourceIds)
        if (v.at < previousAt)
          err(vp, '核实记录必须按时间顺序追加，且不早于观察日期')
        previousAt = v.at
        const vProblem = evidenceIssue(
          v.status,
          [...fact.sourceIds, ...v.sourceIds],
          sources,
        )
        if (vProblem) err(`${vp}.status`, vProblem)
      })

      return {
        ...fact,
        projectId: file.id,
        value: normalizeValue(fact, fp, issues),
      }
    })

    // supersedes：同项目、同类型、单一后继、新版本不早于旧版本
    const factById = new Map(facts.map((f) => [f.id, f]))
    for (const fact of facts) {
      if (!fact.supersedes) continue
      const fp = `${p}.facts(${fact.id}).supersedes`
      const old = factById.get(fact.supersedes)
      if (!old) {
        err(fp, `取代的事实不存在于本项目：${fact.supersedes}`)
        continue
      }
      if (old.factType !== fact.factType) err(fp, '只能取代同类型的事实')
      if (old.observedAt > fact.observedAt)
        err(fp, '新版本的观察日期不能早于旧版本')
      if (old.supersededById) {
        err(fp, `${old.id} 已被 ${old.supersededById} 取代，不能被多个记录取代`)
      }
      old.supersededById = fact.id
    }

    // Events
    const events: ProjectEvent[] = file.events.map((event, i) => {
      const ep = `${p}.events.${i}(${event.id})`
      if (eventIds.has(event.id)) err(ep, `事件 ID 重复：${event.id}`)
      eventIds.add(event.id)
      checkSources(`${ep}.sourceIds`, event.sourceIds)
      const problem = evidenceIssue(
        event.verificationStatus,
        event.sourceIds,
        sources,
      )
      if (problem) err(`${ep}.verificationStatus`, problem)

      for (const key of ['previousFactId', 'newFactId'] as const) {
        const ref = event[key]
        if (ref && !factById.has(ref))
          err(`${ep}.${key}`, `事实不存在于本项目：${ref}`)
      }

      if (COMPLETION_EVENT_TYPES.includes(event.eventType)) {
        // "公司计划首飞" ≠ "首飞已完成"：已完成事件必须有实际发生日期，且不能是公司目标
        if (!event.occurredAt) err(ep, `${event.eventType} 必须有 occurredAt`)
        if (event.verificationStatus === 'COMPANY_TARGET') {
          err(
            ep,
            '已完成类事件不能是 COMPANY_TARGET；未来计划应记录为 TARGET_FLIGHT_DATE 事实',
          )
        }
        const occurred = event.occurredAt && parsePartialDate(event.occurredAt)
        if (occurred && occurred.start > event.recordedAt) {
          err(ep, '已完成类事件的发生日期不能晚于录入日期')
        }
      }
      return { ...event, projectId: file.id }
    })

    // 商业状态与最新售票状态事实的一致性
    const latestSales = facts
      .filter((f) => f.factType === 'TICKET_SALES_STATUS' && !f.supersededById)
      .sort((a, b) => (a.observedAt < b.observedAt ? 1 : -1))[0]
    if (
      latestSales?.value.kind === 'availability' &&
      latestSales.value.status !== file.commercialAvailability &&
      effectiveStatus(latestSales) !== 'OUTDATED'
    ) {
      warn(
        p,
        `commercialAvailability(${file.commercialAvailability}) 与最新售票状态事实(${latestSales.value.status}) 不一致`,
      )
    }

    projects.push({ ...file, facts, events })
  }

  for (const project of projects) {
    for (const dep of project.dependsOnProjectIds) {
      if (!projectIds.has(dep))
        err(project.slug, `dependsOnProjectIds 引用了不存在的项目：${dep}`)
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error')
  return {
    atlas: hasErrors
      ? null
      : {
          projects: projects.sort((a, b) => a.slug.localeCompare(b.slug)),
          sources,
        },
    issues,
  }
}
