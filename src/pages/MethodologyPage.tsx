import {
  COMMERCIAL_AVAILABILITY_LABELS,
  DEVELOPMENT_STAGE_LABELS,
  EVIDENCE_STATUS_LABELS,
  PRICE_KIND_LABELS,
} from '../domain/enums.ts'
import { FRESHNESS_RULES } from '../domain/freshness.ts'
import { PRICE_STATE_TEXT } from '../domain/pricing.ts'

const EVIDENCE_HELP: Record<keyof typeof EVIDENCE_STATUS_LABELS, string> = {
  VERIFIED_OFFICIAL: '在运营方官网、官方公告或监管文件中直接看到。',
  CORROBORATED: '至少两个相互独立的可靠来源支持（转载同一报道只算一个）。',
  REPORTED_UNCONFIRMED: '有媒体报道，但未找到官方确认。',
  COMPANY_TARGET: '运营方公布的目标或计划，不代表已确定或已发生。',
  DISPUTED: '来源之间相互矛盾，尚未解决；冲突记录会同时展示。',
  OUTDATED: '已确认不再适用，保留作历史参考，不作为当前信息展示。',
  UNKNOWN: '没有可用来源，不能视为已核实。',
}

function LabelList({ labels }: { labels: Record<string, string> }) {
  return <p>{Object.values(labels).join(' · ')}</p>
}

export function MethodologyPage() {
  return (
    <article className="prose">
      <h1>数据规则</h1>
      <p>
        本站最重要的资产是可以被验证的结构化数据及其历史。下面说明每个标签的含义，以及数据如何维护。
      </p>

      <h2>事实、判断与建议分开</h2>
      <p>
        “公司于某日公布了某个目标日期”是事实；“该日期实现存在不确定性”是判断；“付款前请再次核实退款条款”是建议。
        三者分开存储，项目页第 7 节中的内容均为编辑判断，不属于事实记录。
      </p>

      <h2>证据状态</h2>
      <dl className="kv">
        {Object.entries(EVIDENCE_STATUS_LABELS).map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{EVIDENCE_HELP[key as keyof typeof EVIDENCE_HELP]}</dd>
          </div>
        ))}
      </dl>
      <p>
        证据状态与项目阶段相互独立：一个商业运营中的项目，某条新票价信息仍可能是“已报道·未核实”。
      </p>

      <h2>项目阶段</h2>
      <LabelList labels={DEVELOPMENT_STAGE_LABELS} />
      <p>
        阶段描述“能力已经到哪一步”，不是严格的线性流程。“暂停”和“已取消”是运营状态：已完成载人飞行的项目也可能处于暂停。
        是否真正完成过载人飞行，以时间线中的“载人飞行完成”事件为准。
      </p>

      <h2>商业参与状态</h2>
      <LabelList labels={COMMERCIAL_AVAILABILITY_LABELS} />
      <p>
        “尚未确认公开售票渠道”不等于“没有商业化计划”；“申请开放”不等于获得飞行资格。
      </p>

      <h2>价格</h2>
      <p>
        价格以整数最小货币单位和明确币种存储。价格类型：
        {Object.values(PRICE_KIND_LABELS).join('、')}。
      </p>
      <ul>
        <li>“{PRICE_STATE_TEXT.UNDISCLOSED}”：确认运营方没有公开价格。</li>
        <li>“{PRICE_STATE_TEXT.UNKNOWN}”：数据集中尚无当前有效的价格记录。</li>
        <li>“{PRICE_STATE_TEXT.FREE}”：赞助或选拔项目，参与者无需付费。</li>
      </ul>
      <p>
        按价格排序时，只有同一币种的官方公开价或官方预售价参与数值排序，其余标记为“不可直接比较”。本站不做汇率换算。
      </p>

      <h2>历史不覆盖</h2>
      <p>
        价格、时间表、售票状态变化时，新增一条记录取代旧记录，旧记录保留在“历史记录”中；核实、标记过时或标记争议均以追加核实记录完成。
        每条记录区分三个时间：适用时间（validFrom/validUntil）、观察时间（何时在来源中看到）、录入时间（何时写入本数据集）。
      </p>

      <h2>数据新鲜度提示</h2>
      <ul>
        <li>票价/押金超过 {FRESHNESS_RULES.priceMaxAgeDays} 天未核实；</li>
        <li>
          售票状态、目标日期超过 {FRESHNESS_RULES.salesStatusMaxAgeDays}{' '}
          天未核实；
        </li>
        <li>
          项目阶段分类超过 {FRESHNESS_RULES.classificationMaxAgeDays} 天未核实；
        </li>
        <li>目标日期已过，但没有记录到相应的飞行结果（严重）；</li>
        <li>来源链接失效、存在未解决的争议、关键事实缺失或没有来源。</li>
      </ul>
      <p>
        任一项超过 {FRESHNESS_RULES.criticalAgeDays}{' '}
        天视为严重过期。本站不计算综合评分。
      </p>

      <h2>来源</h2>
      <p>
        来源保存原始链接、发布方、发布日期、访问日期与简短证据摘要，不复制全文。链接失效的来源保留并标记为失效。
        所有来源内容以纯文本展示。
      </p>
    </article>
  )
}
