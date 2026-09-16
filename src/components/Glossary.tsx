interface Term {
  term: string
  definition: string
}

const TERMS: Term[] = [
  {
    term: '卡门线（Kármán Line）',
    definition:
      '国际上常用的"太空边界"参考线，高度约 100 km。但美国法律上并没有统一规定"太空必须从哪里开始"，FAA 明确表示无此类法律定义。',
  },
  {
    term: '亚轨道（Suborbital）',
    definition:
      '飞行器达到一定高度、体验短暂失重后直接返回地面，速度不足以进入围绕地球运行的稳定轨道。',
  },
  {
    term: '轨道 / 近地轨道（Orbital / LEO）',
    definition:
      '飞行器达到足够速度，进入围绕地球运行的稳定轨道，可以持续飞行数天甚至更久（如国际空间站任务）。',
  },
  {
    term: '近太空（Near Space）',
    definition:
      '高度只到平流层（约 25–35 km），远低于卡门线，不会产生真正的失重体验，严格来说不算"进入太空"。',
  },
  {
    term: '失重 / 微重力（Weightlessness / Microgravity）',
    definition:
      '飞行器处于自由落体或轨道运行状态时，乘员感受不到重力的现象。亚轨道飞行只能维持数分钟，轨道飞行可以持续整个任务期间。',
  },
  {
    term: 'G 力过载（G-force）',
    definition:
      '加速或减速阶段身体承受的额外重力倍数。亚轨道发射与再入阶段通常达到 3–6 G，这也是为什么运营商要做安全培训和体检筛查。',
  },
  {
    term: 'NET（No Earlier Than）',
    definition:
      '"不早于"，航天界常用来标注计划日期，表示这只是一个下限估计，实际时间大概率会延后，不代表确定档期。',
  },
  {
    term: '知情同意（Informed Consent）',
    definition:
      '美国现行监管下，商业载人航天并未按民航标准认证安全性。运营商需要向乘员披露已知/未知风险，乘员理解风险后自愿签署同意书才能登机。',
  },
  {
    term: '可退押金（Refundable Deposit）',
    definition:
      '预订席位时先交的一笔钱，如果未能成行或改变主意可以申请全额退还。它只是"进入订购流程"的门槛，不等于最终票价。',
  },
  {
    term: 'Private Astronaut Mission（PAM，私人航天员任务）',
    definition:
      'NASA 授权私营公司（如 Axiom、Vast、Voyager）组织非职业航天员进入国际空间站执行的商业任务。',
  },
  {
    term: 'Customer Backlog（订单积压）',
    definition:
      '已经付费或登记意向、但尚未被安排上具体飞行班期的客户队列。Backlog 越长，新客户等待时间通常越久。',
  },
]

export function Glossary() {
  return (
    <section className="glossary-section">
      <details>
        <summary>看不懂术语？这里有一份速查表</summary>
        <div className="details-body">
          <dl className="glossary-list">
            {TERMS.map(({ term, definition }) => (
              <div className="glossary-item" key={term}>
                <dt>{term}</dt>
                <dd>{definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>
    </section>
  )
}
