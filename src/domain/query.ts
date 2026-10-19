import {
  COMMERCIAL_AVAILABILITIES,
  CURRENCIES,
  DEVELOPMENT_STAGES,
  MISSION_TYPES,
  type CommercialAvailability,
  type Currency,
  type DevelopmentStage,
  type MissionType,
} from './enums.ts'
import { projectLastVerifiedAt } from './facts.ts'
import type { Project } from './model.ts'
import { comparablePrice, priceSummary, type PriceSummary } from './pricing.ts'

export type SortKey =
  | 'verified-desc'
  | 'verified-asc'
  | 'name-asc'
  | `price-asc-${Currency}`
  | `price-desc-${Currency}`

export interface ProjectQuery {
  q?: string
  missionTypes?: MissionType[]
  stages?: DevelopmentStage[]
  availabilities?: CommercialAvailability[]
  sort?: SortKey
  page?: number
  pageSize?: number
}

export interface ProjectListItem {
  project: Project
  price: PriceSummary
  lastVerifiedAt: string | null
  /** 仅在按价格排序时有意义：该项目价格不可与所选币种直接比较 */
  priceComparable: boolean
}

export interface ProjectQueryResult {
  items: ProjectListItem[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 50

function normalizeText(text: string): string {
  return text.normalize('NFKC').toLowerCase().trim()
}

function matchesQuery(project: Project, q: string): boolean {
  const needle = normalizeText(q)
  if (!needle) return true
  return [project.name, project.operatorName, project.slug].some((field) =>
    normalizeText(field).includes(needle),
  )
}

function parsePriceSort(
  sort: SortKey,
): { currency: Currency; direction: 1 | -1 } | null {
  const m = /^price-(asc|desc)-([A-Z]{3})$/.exec(sort)
  if (!m) return null
  return { currency: m[2] as Currency, direction: m[1] === 'asc' ? 1 : -1 }
}

export function queryProjects(
  projects: readonly Project[],
  query: ProjectQuery,
  asOf: string,
): ProjectQueryResult {
  const sort = query.sort ?? 'verified-desc'
  const priceSort = parsePriceSort(sort)

  const items: ProjectListItem[] = projects
    .filter((p) => !p.archivedAt)
    .filter((p) => matchesQuery(p, query.q ?? ''))
    .filter(
      (p) =>
        !query.missionTypes?.length ||
        query.missionTypes.includes(p.missionType),
    )
    .filter(
      (p) => !query.stages?.length || query.stages.includes(p.developmentStage),
    )
    .filter(
      (p) =>
        !query.availabilities?.length ||
        query.availabilities.includes(p.commercialAvailability),
    )
    .map((project) => {
      const price = priceSummary(project, asOf)
      return {
        project,
        price,
        lastVerifiedAt: projectLastVerifiedAt(project, asOf),
        priceComparable: priceSort
          ? comparablePrice(price, priceSort.currency) !== null
          : true,
      }
    })

  const byName = (a: ProjectListItem, b: ProjectListItem) =>
    a.project.name.localeCompare(b.project.name, 'zh-CN')
  // 缺失核实日期的项目始终排在最后
  const byVerified =
    (direction: 1 | -1) => (a: ProjectListItem, b: ProjectListItem) => {
      if (a.lastVerifiedAt === b.lastVerifiedAt) return byName(a, b)
      if (!a.lastVerifiedAt) return 1
      if (!b.lastVerifiedAt) return -1
      return (a.lastVerifiedAt < b.lastVerifiedAt ? -1 : 1) * direction
    }

  if (priceSort) {
    // 可比较的价格按数值排序；不可比较的统一排在后面，按名称排序
    items.sort((a, b) => {
      const pa = comparablePrice(a.price, priceSort.currency)
      const pb = comparablePrice(b.price, priceSort.currency)
      if (pa === null && pb === null) return byName(a, b)
      if (pa === null) return 1
      if (pb === null) return -1
      return pa === pb ? byName(a, b) : (pa - pb) * priceSort.direction
    })
  } else if (sort === 'name-asc') {
    items.sort(byName)
  } else {
    items.sort(byVerified(sort === 'verified-asc' ? 1 : -1))
  }

  const pageSize = Math.min(
    Math.max(1, Math.floor(query.pageSize ?? DEFAULT_PAGE_SIZE)),
    MAX_PAGE_SIZE,
  )
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(Math.max(1, Math.floor(query.page ?? 1)), pageCount)
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
    pageCount,
  }
}

// ---------- URL 查询参数 <-> ProjectQuery ----------

function pickList<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
): T[] {
  return params
    .getAll(key)
    .flatMap((v) => v.split(','))
    .filter((v): v is T => (allowed as readonly string[]).includes(v))
}

const SORT_KEYS: readonly string[] = [
  'verified-desc',
  'verified-asc',
  'name-asc',
  ...CURRENCIES.flatMap((c) => [`price-asc-${c}`, `price-desc-${c}`]),
]

export function parseProjectQuery(params: URLSearchParams): ProjectQuery {
  const sort = params.get('sort')
  const page = Number(params.get('page'))
  return {
    q: params.get('q') ?? undefined,
    missionTypes: pickList(params, 'type', MISSION_TYPES),
    stages: pickList(params, 'stage', DEVELOPMENT_STAGES),
    availabilities: pickList(params, 'availability', COMMERCIAL_AVAILABILITIES),
    sort: sort && SORT_KEYS.includes(sort) ? (sort as SortKey) : undefined,
    page: Number.isFinite(page) && page > 0 ? page : undefined,
  }
}

export function serializeProjectQuery(query: ProjectQuery): URLSearchParams {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.missionTypes?.length)
    params.set('type', query.missionTypes.join(','))
  if (query.stages?.length) params.set('stage', query.stages.join(','))
  if (query.availabilities?.length)
    params.set('availability', query.availabilities.join(','))
  if (query.sort && query.sort !== 'verified-desc')
    params.set('sort', query.sort)
  if (query.page && query.page > 1) params.set('page', String(query.page))
  return params
}
