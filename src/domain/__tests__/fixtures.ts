import { normalizeAtlas } from '../normalize.ts'
import type { Atlas } from '../model.ts'

// 测试用原始数据构造器：与真实数据文件走同一条校验路径。

export const OFFICIAL = {
  id: 'src_official',
  url: 'https://example.com/official',
  title: 'Official page',
  publisher: 'Example Co',
  sourceType: 'OFFICIAL_PRODUCT_PAGE',
  accessedAt: '2026-09-16',
  language: 'en',
  linkStatus: 'OK',
}
export const MEDIA_A = {
  id: 'src_media-a',
  url: 'https://news-a.example.org/story',
  title: 'Story A',
  publisher: 'News A',
  sourceType: 'REPUTABLE_MEDIA',
  accessedAt: '2026-09-16',
  language: 'en',
  linkStatus: 'OK',
}
export const MEDIA_B_REPRINT = {
  id: 'src_media-b',
  url: 'https://news-b.example.org/reprint',
  title: 'Story A (reprint)',
  publisher: 'News B',
  sourceType: 'REPUTABLE_MEDIA',
  accessedAt: '2026-09-16',
  language: 'en',
  linkStatus: 'OK',
  republishedFromId: 'src_media-a',
}
export const DEFAULT_SOURCES = [OFFICIAL, MEDIA_A, MEDIA_B_REPRINT]

export function rawProject(overrides: Record<string, unknown> = {}) {
  const slug = (overrides.slug as string) ?? 'test-project'
  return {
    id: `prj_${slug}`,
    slug,
    name: 'Test Flight',
    operatorName: 'Example Co',
    countryOrRegion: '美国',
    description: 'A test project',
    missionType: 'SUBORBITAL',
    participationPathways: ['PURCHASE'],
    developmentStage: 'COMMERCIAL_OPERATIONS',
    commercialAvailability: 'WAITLIST_OR_INTEREST',
    classificationVerifiedAt: '2026-09-16',
    classificationSourceIds: ['src_official'],
    firstPublishedAt: '2026-09-16',
    facts: [],
    events: [],
    ...overrides,
  }
}

export function rawFact(overrides: Record<string, unknown> = {}) {
  return {
    id: 'fct_price-1',
    factType: 'PUBLIC_PRICE',
    value: {
      kind: 'money',
      amount: '450000',
      currency: 'USD',
      priceKind: 'OFFICIAL_LIST_PRICE',
    },
    observedAt: '2026-09-16',
    recordedAt: '2026-09-16',
    evidenceStatus: 'VERIFIED_OFFICIAL',
    confidenceLevel: 'HIGH',
    sourceIds: ['src_official'],
    ...overrides,
  }
}

export function build(
  projects: unknown[],
  sources: unknown[] = DEFAULT_SOURCES,
) {
  return normalizeAtlas(
    projects.map((data, i) => ({ path: `p${i}`, data })),
    { sources },
  )
}

export function buildOk(
  projects: unknown[],
  sources: unknown[] = DEFAULT_SOURCES,
): Atlas {
  const result = build(projects, sources)
  if (!result.atlas) {
    throw new Error(
      result.issues.map((i) => `${i.path}: ${i.message}`).join('\n'),
    )
  }
  return result.atlas
}

export function errorsOf(
  projects: unknown[],
  sources: unknown[] = DEFAULT_SOURCES,
): string[] {
  return build(projects, sources)
    .issues.filter((i) => i.severity === 'error')
    .map((i) => `${i.path}: ${i.message}`)
}
