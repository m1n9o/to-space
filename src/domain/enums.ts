// 受控值（枚举）与中文标签。所有可筛选字段都必须使用这里定义的值，不能依赖自由文本。
// 本文件被浏览器代码和 Node 脚本共享，不得引入平台相关依赖。

export const MISSION_TYPES = [
  'SUBORBITAL',
  'ORBITAL',
  'SPACE_STATION_MISSION',
  // 平流层气球/近太空：不进入太空，但与"上太空"常被混淆，需要显式区分而不是归入 OTHER
  'NEAR_SPACE',
  'OTHER',
] as const
export type MissionType = (typeof MISSION_TYPES)[number]

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  SUBORBITAL: '亚轨道飞行',
  ORBITAL: '轨道飞行',
  SPACE_STATION_MISSION: '空间站任务',
  NEAR_SPACE: '近太空（未进入太空）',
  OTHER: '其他',
}

// 研发/运营阶段：描述"能力已到哪一步"，不是严格线性流程。
// PAUSED / CANCELLED 是运营状态覆盖：一个已完成载人飞行的项目仍可能处于 PAUSED。
// 是否"演示过载人飞行"由事件（CREWED_FLIGHT_COMPLETED）回答，不由阶段推断。
/** 表格等窄空间使用的简称；完整含义见 MISSION_TYPE_LABELS */
export const MISSION_TYPE_SHORT_LABELS: Record<MissionType, string> = {
  SUBORBITAL: '亚轨道',
  ORBITAL: '轨道',
  SPACE_STATION_MISSION: '空间站',
  NEAR_SPACE: '近太空（非太空）',
  OTHER: '其他',
}

export const DEVELOPMENT_STAGES = [
  'CONCEPT',
  'DEVELOPMENT',
  'TESTING',
  'PREPARING_FIRST_CREWED_FLIGHT',
  'CREWED_FLIGHT_DEMONSTRATED',
  'COMMERCIAL_OPERATIONS',
  'PAUSED',
  'CANCELLED',
  'UNKNOWN',
] as const
export type DevelopmentStage = (typeof DEVELOPMENT_STAGES)[number]

export const DEVELOPMENT_STAGE_LABELS: Record<DevelopmentStage, string> = {
  CONCEPT: '概念阶段',
  DEVELOPMENT: '研发中',
  TESTING: '测试中',
  PREPARING_FIRST_CREWED_FLIGHT: '准备首次载人飞行',
  CREWED_FLIGHT_DEMONSTRATED: '已演示载人飞行',
  COMMERCIAL_OPERATIONS: '商业运营中',
  PAUSED: '暂停',
  CANCELLED: '已取消',
  UNKNOWN: '未知',
}

// 商业参与/购买状态。注意区分：
// NOT_YET_OFFERED（有商业化计划但尚未确认公开售票） ≠ NO_COMMERCIAL_PLAN（没有商业化计划）
// APPLICATION_OPEN（可提交申请）不等于获得飞行资格
export const COMMERCIAL_AVAILABILITIES = [
  'OPEN_FOR_PURCHASE',
  'PRE_SALE',
  'WAITLIST_OR_INTEREST',
  'CONTACT_SALES',
  'APPLICATION_OPEN',
  'APPLICATION_CLOSED',
  'SOLD_OUT',
  'SALES_PAUSED',
  'NOT_YET_OFFERED',
  'NO_COMMERCIAL_PLAN',
  'UNKNOWN',
] as const
export type CommercialAvailability = (typeof COMMERCIAL_AVAILABILITIES)[number]

export const COMMERCIAL_AVAILABILITY_LABELS: Record<
  CommercialAvailability,
  string
> = {
  OPEN_FOR_PURCHASE: '可公开购买',
  PRE_SALE: '预售中',
  WAITLIST_OR_INTEREST: '可登记意向/候补',
  CONTACT_SALES: '需联系销售',
  APPLICATION_OPEN: '申请开放（不保证入选）',
  APPLICATION_CLOSED: '申请已关闭',
  SOLD_OUT: '已售罄',
  SALES_PAUSED: '销售暂停',
  NOT_YET_OFFERED: '尚未确认公开售票渠道',
  NO_COMMERCIAL_PLAN: '无商业化计划',
  UNKNOWN: '未知',
}

export const PARTICIPATION_PATHWAYS = [
  'PURCHASE',
  'APPLICATION_SELECTION',
  'SPONSORSHIP',
  'BROKER',
] as const
export type ParticipationPathway = (typeof PARTICIPATION_PATHWAYS)[number]

export const PARTICIPATION_PATHWAY_LABELS: Record<
  ParticipationPathway,
  string
> = {
  PURCHASE: '自费购买',
  APPLICATION_SELECTION: '申请/选拔',
  SPONSORSHIP: '赞助席位',
  BROKER: '经纪/中介安排',
}

export const CUSTOMER_SEGMENTS = [
  'INDIVIDUAL',
  'HIGH_NET_WORTH_INDIVIDUAL',
  'GOVERNMENT_OR_NATIONAL_AGENCY',
  'RESEARCH_INSTITUTION',
  'CORPORATE_OR_BRAND',
  'TRAVEL_AGENCY',
] as const
export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number]

export const CUSTOMER_SEGMENT_LABELS: Record<CustomerSegment, string> = {
  INDIVIDUAL: '普通个人',
  HIGH_NET_WORTH_INDIVIDUAL: '高净值个人',
  GOVERNMENT_OR_NATIONAL_AGENCY: '政府/国家航天机构',
  RESEARCH_INSTITUTION: '研究机构',
  CORPORATE_OR_BRAND: '企业/品牌',
  TRAVEL_AGENCY: '旅游服务商',
}

export const FACT_TYPES = [
  'PUBLIC_PRICE',
  'DEPOSIT_AMOUNT',
  'TARGET_FLIGHT_DATE',
  'TICKET_SALES_STATUS',
  'REFUND_POLICY',
  'FLIGHT_DURATION',
  'ALTITUDE',
  'WEIGHTLESSNESS_DURATION',
  'TRAINING_DURATION',
  'ELIGIBILITY_REQUIREMENTS',
  'OTHER',
] as const
export type FactType = (typeof FACT_TYPES)[number]

export const FACT_TYPE_LABELS: Record<FactType, string> = {
  PUBLIC_PRICE: '票价',
  DEPOSIT_AMOUNT: '押金/订金',
  TARGET_FLIGHT_DATE: '目标飞行时间',
  TICKET_SALES_STATUS: '售票状态',
  REFUND_POLICY: '退款政策',
  FLIGHT_DURATION: '飞行时长',
  ALTITUDE: '飞行高度',
  WEIGHTLESSNESS_DURATION: '失重时长',
  TRAINING_DURATION: '训练要求',
  ELIGIBILITY_REQUIREMENTS: '资格要求',
  OTHER: '其他',
}

// 价格语义：公司公布的票价 ≠ 历史成交价 ≠ 媒体报道 ≠ 第三方推算
export const PRICE_KINDS = [
  'OFFICIAL_LIST_PRICE',
  'PRE_SALE_PRICE',
  'HISTORICAL_PRICE',
  'MEDIA_REPORTED',
  'THIRD_PARTY_ESTIMATE',
] as const
export type PriceKind = (typeof PRICE_KINDS)[number]

export const PRICE_KIND_LABELS: Record<PriceKind, string> = {
  OFFICIAL_LIST_PRICE: '官方公开价',
  PRE_SALE_PRICE: '官方预售价',
  HISTORICAL_PRICE: '历史价格',
  MEDIA_REPORTED: '媒体报道价',
  THIRD_PARTY_ESTIMATE: '第三方估算',
}

export const EVIDENCE_STATUSES = [
  'VERIFIED_OFFICIAL',
  'CORROBORATED',
  'REPORTED_UNCONFIRMED',
  'COMPANY_TARGET',
  'DISPUTED',
  'OUTDATED',
  'UNKNOWN',
] as const
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number]

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  VERIFIED_OFFICIAL: '官方确认',
  CORROBORATED: '多方印证',
  REPORTED_UNCONFIRMED: '已报道·未核实',
  COMPANY_TARGET: '公司目标',
  DISPUTED: '来源冲突',
  OUTDATED: '已过时',
  UNKNOWN: '状态未知',
}

export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]

export const EVENT_TYPES = [
  'CREWED_FLIGHT_COMPLETED',
  'UNCREWED_FLIGHT_COMPLETED',
  'FLIGHT_DELAYED',
  'TARGET_DATE_CHANGED',
  'PRICE_CHANGED',
  'TICKET_SALES_OPENED',
  'TICKET_SALES_PAUSED',
  'REGULATORY_UPDATE',
  'VEHICLE_TEST_COMPLETED',
  'FUNDING_OR_OWNERSHIP_CHANGE',
  'PROGRAM_PAUSED',
  'PROGRAM_CANCELLED',
  'OTHER',
] as const
export type EventType = (typeof EVENT_TYPES)[number]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  CREWED_FLIGHT_COMPLETED: '载人飞行完成',
  UNCREWED_FLIGHT_COMPLETED: '无人飞行完成',
  FLIGHT_DELAYED: '飞行延期',
  TARGET_DATE_CHANGED: '目标日期调整',
  PRICE_CHANGED: '价格变化',
  TICKET_SALES_OPENED: '开放售票',
  TICKET_SALES_PAUSED: '暂停售票',
  REGULATORY_UPDATE: '监管动态',
  VEHICLE_TEST_COMPLETED: '飞行器测试完成',
  FUNDING_OR_OWNERSHIP_CHANGE: '融资/股权变化',
  PROGRAM_PAUSED: '项目暂停',
  PROGRAM_CANCELLED: '项目取消',
  OTHER: '其他',
}

// "已发生"类事件：必须有实际发生日期，且不能是公司目标
export const COMPLETION_EVENT_TYPES: readonly EventType[] = [
  'CREWED_FLIGHT_COMPLETED',
  'UNCREWED_FLIGHT_COMPLETED',
  'VEHICLE_TEST_COMPLETED',
]

export const SOURCE_TYPES = [
  'OFFICIAL_ANNOUNCEMENT',
  'REGULATORY_DOCUMENT',
  'OFFICIAL_PRODUCT_PAGE',
  'REPUTABLE_MEDIA',
  'INDUSTRY_RESEARCH',
  'OTHER',
] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  OFFICIAL_ANNOUNCEMENT: '官方公告',
  REGULATORY_DOCUMENT: '监管文件',
  OFFICIAL_PRODUCT_PAGE: '官方产品页',
  REPUTABLE_MEDIA: '可靠媒体',
  INDUSTRY_RESEARCH: '行业研究',
  OTHER: '其他',
}

export const OFFICIAL_SOURCE_TYPES: readonly SourceType[] = [
  'OFFICIAL_ANNOUNCEMENT',
  'REGULATORY_DOCUMENT',
  'OFFICIAL_PRODUCT_PAGE',
]

export const LINK_STATUSES = ['OK', 'BROKEN', 'UNCHECKED'] as const
export type LinkStatus = (typeof LINK_STATUSES)[number]

export const ASSESSMENT_KINDS = [
  'RISK',
  'INFO_GAP',
  'JUDGMENT',
  'ACTION_ADVICE',
] as const
export type AssessmentKind = (typeof ASSESSMENT_KINDS)[number]

export const ASSESSMENT_KIND_LABELS: Record<AssessmentKind, string> = {
  RISK: '风险',
  INFO_GAP: '信息缺口',
  JUDGMENT: '判断',
  ACTION_ADVICE: '行动建议',
}

export const CURRENCIES = ['USD', 'CNY', 'EUR', 'GBP', 'JPY'] as const
export type Currency = (typeof CURRENCIES)[number]

export const CURRENCY_MINOR_DIGITS: Record<Currency, number> = {
  USD: 2,
  CNY: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
}

export const QUANTITY_UNITS = ['KM', 'SECOND', 'MINUTE', 'HOUR', 'DAY'] as const
export type QuantityUnit = (typeof QUANTITY_UNITS)[number]

export const QUANTITY_UNIT_LABELS: Record<QuantityUnit, string> = {
  KM: 'km',
  SECOND: '秒',
  MINUTE: '分钟',
  HOUR: '小时',
  DAY: '天',
}

// 数量限定：约、至少、至多、目标值
export const QUANTITY_QUALIFIERS = ['EXACT', 'APPROX', 'MIN', 'MAX'] as const
export type QuantityQualifier = (typeof QUANTITY_QUALIFIERS)[number]
