import { useState } from 'react'

const CHECKLIST_ITEMS = [
  'Deposit 是否 refundable？',
  '如果目标从 2027 延迟到 2030，是否可以退款？',
  '退款条件写进合同还是只出现在营销页面？',
  '如果公司停止项目或清算，预付款如何处理？',
  '资金进入普通公司账户还是 escrow？',
  '体检失败是否可退？',
  '座位是否可以转让？',
  '可以免费改签几次？',
  '发射因天气或技术原因连续取消怎么办？',
  '合同保证的高度是多少？',
  '「亚轨道」是否明确写了 >100 km？',
  '最少要完成多少次无人试飞才能进入载人？',
  '逃逸系统测试完成到什么程度？',
  '环控与生命保障系统完成哪些测试？',
  '是否有独立监管机构或第三方安全审核？',
  '是否强制购买特殊保险？',
  '出现伤亡时责任和赔付条款是什么？',
  '你的国籍是否受出口管制、制裁或飞行许可限制？',
]

const COPY_LABEL = '复制清单'
const COPIED_LABEL = '已复制 ✓'

export function Checklist() {
  const [copyLabel, setCopyLabel] = useState(COPY_LABEL)

  const handleCopy = (): void => {
    const text = CHECKLIST_ITEMS.map(
      (item, index) => `${index + 1}. ${item}`,
    ).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopyLabel(COPIED_LABEL)
      setTimeout(() => setCopyLabel(COPY_LABEL), 1500)
    })
  }

  return (
    <section className="checklist-section">
      <h2>如果真的准备购买，应该调查什么？</h2>
      <p className="section-note">
        对于任何尚未成熟运营的项目，至少要问清楚以下 18 个问题：
      </p>
      <div className="checklist">
        <ol>
          {CHECKLIST_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <button type="button" className="checklist-copy" onClick={handleCopy}>
          {copyLabel}
        </button>
      </div>
    </section>
  )
}
