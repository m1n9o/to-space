interface OverviewRow {
  option: string
  type: string
  crossesKarman: string
  price: string
  status: string
  timing: string
}

const OVERVIEW_ROWS: OverviewRow[] = [
  {
    option: 'Blue Origin New Shepard',
    type: '亚轨道',
    crossesKarman: '✅',
    price: '正式票价未公开；进入订购流程需 $150,000 可退押金',
    status: '已大量载人，但暂停飞行',
    timing: '最早理论上 2028+，实际待官方确认',
  },
  {
    option: 'Virgin Galactic Delta',
    type: '亚轨道',
    crossesKarman: '❌，约 91 km',
    price: '最近一批 $750,000，已售罄；下一批计划更贵',
    status: '新一代飞船测试阶段',
    timing: '公司目标：2027-02 恢复商业飞行',
  },
  {
    option: '深蓝航天',
    type: '亚轨道',
    crossesKarman: '🎯 目标 >100 km',
    price: '标价 ¥1.5M；首批直播价 ¥1M',
    status: '预售过，尚未商业载人',
    timing: '公司目标：2027',
  },
  {
    option: '中科宇航 CAS Space',
    type: '亚轨道',
    crossesKarman: '🎯 目标 ≥100 km',
    price: '公司最新目标：初期 ≤¥2M',
    status: '工程验证阶段',
    timing: '公司目标：2028',
  },
  {
    option: '穿越者 CYZ1',
    type: '亚轨道',
    crossesKarman: '🎯 目标 100 km',
    price: '¥3M；预订费 10%',
    status: '当前公开预售',
    timing: '公司目标：2028 前后',
  },
  {
    option: 'Axiom Space + SpaceX',
    type: 'ISS / 轨道',
    crossesKarman: '✅',
    price: '当前不公开；Ax-1 历史报道约 $55M/人',
    status: '已执行 4 次 ISS 私人任务',
    timing: 'Ax-5：NET 2027-01',
  },
  {
    option: 'SpaceX Dragon 定制任务',
    type: '轨道',
    crossesKarman: '✅',
    price: '报价制，未公开标准票价',
    status: 'Crew Dragon 已成熟',
    timing: '任务制',
  },
  {
    option: 'Vast + SpaceX',
    type: 'ISS / Haven-1',
    crossesKarman: '✅',
    price: '未公开，询价制',
    status: 'ISS 任务已获 NASA 选择；Haven-1 在建',
    timing: 'ISS：NET summer 2027；Haven-1 目标 2027',
  },
  {
    option: 'Voyager Technologies',
    type: 'ISS',
    crossesKarman: '✅',
    price: '未公开',
    status: 'NASA 已选择为 PAM-7 服务商',
    timing: 'NET 2028',
  },
  {
    option: 'SERA',
    type: 'Blue Origin 亚轨道选拔',
    crossesKarman: '✅',
    price: '不是传统买票',
    status: '已预留 6 个 New Shepard 席位',
    timing: '受 Blue Origin 停飞影响',
  },
  {
    option: 'Space for Humanity',
    type: '赞助航天员',
    crossesKarman: '取决于承运商',
    price: '获选者由项目赞助',
    status: '当前申请关闭',
    timing: '未公布下一批时间',
  },
  {
    option: 'Space Adventures',
    type: 'ISS / 私人航天中介',
    crossesKarman: '✅',
    price: '当前无清晰公开标准价',
    status: '有历史成功记录，但当前公开计划陈旧',
    timing: '暂不建议视为确定班期',
  },
]

export function OverviewTable() {
  return (
    <section className="overview-table">
      <h2>总览：2026 年主要 Option</h2>
      <p className="section-note">
        「价格」列必须注意状态。当前公开价、历史成交价、预售价格和未公开不是一回事。
      </p>
      <table>
        <caption>可横向滚动查看全部列</caption>
        <thead>
          <tr>
            <th>Option</th>
            <th>类型</th>
            <th>跨 100km？</th>
            <th>当前/公开价格</th>
            <th>当前状态</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {OVERVIEW_ROWS.map((row) => (
            <tr key={row.option}>
              <td>{row.option}</td>
              <td>{row.type}</td>
              <td>{row.crossesKarman}</td>
              <td>{row.price}</td>
              <td>{row.status}</td>
              <td>{row.timing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
