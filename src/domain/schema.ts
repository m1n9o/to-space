import { z } from 'zod'
import { isIsoDay, isPartialDate } from './dates.ts'
import {
  ASSESSMENT_KINDS,
  COMMERCIAL_AVAILABILITIES,
  CONFIDENCE_LEVELS,
  CURRENCIES,
  CUSTOMER_SEGMENTS,
  DEVELOPMENT_STAGES,
  EVENT_TYPES,
  EVIDENCE_STATUSES,
  FACT_TYPES,
  LINK_STATUSES,
  MISSION_TYPES,
  PARTICIPATION_PATHWAYS,
  PRICE_KINDS,
  QUANTITY_QUALIFIERS,
  QUANTITY_UNITS,
  SOURCE_TYPES,
  type FactType,
} from './enums.ts'

// 数据文件（data/**/*.yaml）的原始结构。所有对象均为 strict：未知字段直接报错，防止拼写错误被静默忽略。

const isoDay = z
  .string()
  .refine(isIsoDay, { message: '必须是合法的 YYYY-MM-DD 日期' })
const partialDate = z.string().refine(isPartialDate, {
  message: '必须是 YYYY / YYYY-H1 / YYYY-Q1 / YYYY-MM / YYYY-MM-DD',
})
const httpUrl = z.url({
  protocol: /^https?$/,
  hostname: z.regexes.domain,
  message: '必须是 http(s) URL',
})
const id = (prefix: string) =>
  z
    .string()
    .regex(
      new RegExp(`^${prefix}_[a-z0-9][a-z0-9-]*$`),
      `ID 必须形如 ${prefix}_xxx（小写字母、数字、连字符）`,
    )
const nonEmpty = z.string().trim().min(1)

export const projectId = id('prj')
export const factId = id('fct')
export const eventId = id('evt')
export const sourceId = id('src')

// ---------- Source ----------

export const sourceSchema = z.strictObject({
  id: sourceId,
  url: httpUrl,
  canonicalUrl: httpUrl.optional(),
  title: nonEmpty,
  publisher: nonEmpty,
  sourceType: z.enum(SOURCE_TYPES),
  publishedAt: isoDay.optional(),
  accessedAt: isoDay,
  language: z
    .string()
    .regex(/^[a-z]{2}(-[A-Za-z]{2,4})?$/, '使用 BCP 47 语言代码'),
  // 简短证据摘要或定位信息，不复制全文
  excerptOrEvidence: z.string().max(400).optional(),
  notes: z.string().optional(),
  linkStatus: z.enum(LINK_STATUSES).default('UNCHECKED'),
  linkCheckedAt: isoDay.optional(),
  // 转载/引用自另一来源：不算独立证据
  republishedFromId: sourceId.optional(),
})
export type SourceInput = z.input<typeof sourceSchema>
export type Source = z.output<typeof sourceSchema>

export const sourcesFileSchema = z.strictObject({
  sources: z.array(sourceSchema),
})

// ---------- Fact value ----------

const moneyValue = z.strictObject({
  kind: z.literal('money'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, '金额为非负十进制字符串'),
  currency: z.enum(CURRENCIES),
  priceKind: z.enum(PRICE_KINDS),
  // 价格是否明确包含/不包含的内容（训练、住宿、保险等）
  inclusions: z.string().optional(),
  extraCostsDisclosed: z.boolean().optional(),
})
const undisclosedValue = z.strictObject({
  kind: z.literal('undisclosed'),
  note: z.string().optional(),
})
// 免费/赞助：参与者无需付费。与 undisclosed（无公开价格）严格区分。
const freeValue = z.strictObject({
  kind: z.literal('free'),
  note: nonEmpty,
})
const dateValue = z.strictObject({
  kind: z.literal('date'),
  date: partialDate,
})
const quantityValue = z.strictObject({
  kind: z.literal('quantity'),
  amount: z.number().nonnegative(),
  unit: z.enum(QUANTITY_UNITS),
  qualifier: z.enum(QUANTITY_QUALIFIERS).default('EXACT'),
})
const availabilityValue = z.strictObject({
  kind: z.literal('availability'),
  status: z.enum(COMMERCIAL_AVAILABILITIES),
})
const textValue = z.strictObject({
  kind: z.literal('text'),
  text: nonEmpty,
})

export const factValueSchema = z.discriminatedUnion('kind', [
  moneyValue,
  undisclosedValue,
  freeValue,
  dateValue,
  quantityValue,
  availabilityValue,
  textValue,
])
export type FactValueInput = z.output<typeof factValueSchema>
export type FactValueKind = FactValueInput['kind']

/** 每种事实类型允许的值类型 */
export const ALLOWED_VALUE_KINDS: Record<FactType, readonly FactValueKind[]> = {
  PUBLIC_PRICE: ['money', 'undisclosed', 'free'],
  DEPOSIT_AMOUNT: ['money', 'undisclosed', 'free'],
  TARGET_FLIGHT_DATE: ['date', 'undisclosed'],
  TICKET_SALES_STATUS: ['availability'],
  REFUND_POLICY: ['text', 'undisclosed'],
  FLIGHT_DURATION: ['quantity', 'text', 'undisclosed'],
  ALTITUDE: ['quantity', 'text', 'undisclosed'],
  WEIGHTLESSNESS_DURATION: ['quantity', 'text', 'undisclosed'],
  TRAINING_DURATION: ['quantity', 'text', 'undisclosed'],
  ELIGIBILITY_REQUIREMENTS: ['text', 'undisclosed'],
  OTHER: [
    'money',
    'undisclosed',
    'free',
    'date',
    'quantity',
    'availability',
    'text',
  ],
}

// ---------- Verification ----------

export const verificationSchema = z.strictObject({
  at: isoDay,
  by: nonEmpty,
  status: z.enum(EVIDENCE_STATUSES),
  basis: nonEmpty, // 核实依据
  sourceIds: z.array(sourceId).default([]),
  notes: z.string().optional(),
})
export type Verification = z.output<typeof verificationSchema>

// ---------- Fact ----------

export const factSchema = z
  .strictObject({
    id: factId,
    factType: z.enum(FACT_TYPES),
    value: factValueSchema,
    // 面向用户的一句话说明（例如"首批直播优惠价"），不承载结构化语义
    label: z.string().optional(),
    validFrom: isoDay.optional(),
    validUntil: isoDay.optional(),
    observedAt: isoDay, // 我们何时从来源看到该信息
    recordedAt: isoDay, // 何时录入本数据集
    evidenceStatus: z.enum(EVIDENCE_STATUSES), // 录入时的证据状态
    confidenceLevel: z.enum(CONFIDENCE_LEVELS),
    supersedes: factId.optional(), // 本记录取代的旧版本
    sourceIds: z.array(sourceId).default([]),
    notes: z.string().optional(),
    // 只追加：后续核实/标记过时/标记争议都以新增核实记录完成，不改动上面的字段
    verifications: z.array(verificationSchema).default([]),
  })
  .superRefine((fact, ctx) => {
    if (!ALLOWED_VALUE_KINDS[fact.factType].includes(fact.value.kind)) {
      ctx.addIssue({
        code: 'custom',
        path: ['value', 'kind'],
        message: `${fact.factType} 不允许值类型 ${fact.value.kind}`,
      })
    }
    if (fact.validFrom && fact.validUntil && fact.validFrom > fact.validUntil) {
      ctx.addIssue({
        code: 'custom',
        path: ['validUntil'],
        message: 'validUntil 不能早于 validFrom',
      })
    }
    if (fact.observedAt > fact.recordedAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['recordedAt'],
        message: 'recordedAt 不能早于 observedAt',
      })
    }
  })
export type FactInput = z.output<typeof factSchema>

// ---------- Event ----------

export const eventSchema = z
  .strictObject({
    id: eventId,
    eventType: z.enum(EVENT_TYPES),
    title: nonEmpty,
    summary: z.string().optional(),
    announcedAt: partialDate.optional(), // 公告发布日期
    occurredAt: partialDate.optional(), // 实际发生日期
    recordedAt: isoDay,
    previousValue: z.string().optional(),
    newValue: z.string().optional(),
    previousFactId: factId.optional(),
    newFactId: factId.optional(),
    businessImpact: z.string().optional(), // 对潜在参与者的影响
    verificationStatus: z.enum(EVIDENCE_STATUSES),
    sourceIds: z.array(sourceId).default([]),
  })
  .superRefine((event, ctx) => {
    if (!event.announcedAt && !event.occurredAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['occurredAt'],
        message: '事件至少需要 announcedAt 或 occurredAt 之一',
      })
    }
  })
export type EventInput = z.output<typeof eventSchema>

// ---------- Assessment（判断与行动建议，与事实分开存储） ----------

export const assessmentSchema = z.strictObject({
  kind: z.enum(ASSESSMENT_KINDS),
  text: nonEmpty,
  asOf: isoDay,
  sourceIds: z.array(sourceId).default([]),
})
export type Assessment = z.output<typeof assessmentSchema>

// ---------- Project ----------

export const projectFileSchema = z.strictObject({
  id: projectId,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug 仅允许小写字母、数字与连字符'),
  name: nonEmpty,
  operatorName: nonEmpty,
  countryOrRegion: nonEmpty,
  description: nonEmpty,
  missionType: z.enum(MISSION_TYPES),
  participationPathways: z.array(z.enum(PARTICIPATION_PATHWAYS)).min(1),
  experienceDescription: z.string().optional(),
  targetCustomerSegments: z.array(z.enum(CUSTOMER_SEGMENTS)).default([]),
  developmentStage: z.enum(DEVELOPMENT_STAGES),
  commercialAvailability: z.enum(COMMERCIAL_AVAILABILITIES),
  // 阶段与商业状态的核实日期及依据
  classificationVerifiedAt: isoDay.optional(),
  classificationSourceIds: z.array(sourceId).default([]),
  officialWebsiteUrl: httpUrl.optional(),
  // 没有可靠的公开售票入口时必须留空，不得虚构
  officialBookingUrl: httpUrl.optional(),
  officialContactUrl: httpUrl.optional(),
  dependsOnProjectIds: z.array(projectId).default([]),
  firstPublishedAt: isoDay,
  archivedAt: isoDay.optional(), // 软删除：保留全部历史证据
  facts: z.array(factSchema).default([]),
  events: z.array(eventSchema).default([]),
  assessments: z.array(assessmentSchema).default([]),
})
export type ProjectFile = z.output<typeof projectFileSchema>
export type ProjectFileInput = z.input<typeof projectFileSchema>
