export function BudgetRoutes() {
  return (
    <section className="budget-routes">
      <h2>按预算分类</h2>
      <div className="route-list">
        <div className="route-card">
          <h3>路线 A：基本不靠个人财富</h3>
          <p>
            重点关注：SERA、Space for Humanity、Research Astronaut、企业 / 大学
            / 国家项目赞助。
          </p>
          <p>代价不是钱，而是：</p>
          <ul>
            <li>竞争极大</li>
            <li>需要项目价值、故事、专业能力或社会影响力</li>
            <li>时间不可控</li>
          </ul>
        </div>
        <div className="route-card">
          <h3>路线 B：约 ¥1M–¥3M 级</h3>
          <p>
            未来几年最值得观察的是中国亚轨道项目：深蓝航天（历史标价
            ¥1.5M）、中科宇航（最新初期目标 ≤¥2M）、穿越者（当前预售 ¥3M）。
          </p>
          <p>
            共同特点：都以 100 km
            左右亚轨道为目标，价格远低于美国成熟项目，都尚未形成成熟、持续的商业载人运营。
          </p>
          <p>
            核心问题不是「便不便宜」，而是「什么时候真正达到足够的工程成熟度」。
          </p>
        </div>
        <div className="route-card">
          <h3>路线 C：约 $750k+ 级</h3>
          <p>
            Virgin Galactic：最近一批 $750k，已售罄，新批次计划更高价格，Delta
            目标 2027-02 商业飞行。
          </p>
          <p>但没有跨越 100 km 卡门线。</p>
        </div>
        <div className="route-card">
          <h3>路线 D：Blue Origin</h3>
          <p>
            最成熟的纯亚轨道体验之一。但正式票价未公开，$150k 只是 refundable
            deposit，当前停飞至少两年，customer backlog 已存在多年。
          </p>
        </div>
        <div className="route-card">
          <h3>路线 E：数千万美元级</h3>
          <p>
            Axiom / SpaceX 进入轨道和
            ISS。这已经不是「体验几分钟太空」，而是真正作为一个轨道任务乘员在太空生活和工作。
          </p>
        </div>
      </div>
    </section>
  )
}
