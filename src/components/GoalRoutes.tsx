export function GoalRoutes() {
  return (
    <section className="goal-routes">
      <h2>按目标分类：不是「哪家最好」，而是你想要什么</h2>
      <div className="goal-list">
        <div className="goal-card">
          <h3>Goal A：我只想说「我真的去过太空」</h3>
          <p>
            优先关注：Blue Origin、中国未来跨 100 km
            亚轨道项目。核心条件：越过卡门线。
          </p>
        </div>
        <div className="goal-card">
          <h3>Goal B：我更看重飞行体验和近期可能性</h3>
          <p>关注：Virgin Galactic Delta。接受 ~91 km，不跨 100 km。</p>
        </div>
        <div className="goal-card">
          <h3>Goal C：我希望把成本控制在几百万人民币</h3>
          <p>
            重点观察：深蓝航天、中科宇航、穿越者。但必须接受：技术与时间表风险明显高于已经完成大量载人任务的成熟系统。
          </p>
        </div>
        <div className="goal-card">
          <h3>Goal D：我想真正「在太空生活过」</h3>
          <p>
            关注：Axiom、SpaceX Dragon、Vast、Voyager（未来）。亚轨道 10
            分钟和轨道 10 天，本质上是两个完全不同的产品。
          </p>
        </div>
        <div className="goal-card">
          <h3>Goal E：我没有几百万/几千万，但仍想争取一次机会</h3>
          <p>
            长期关注：SERA、Space for Humanity、Research
            Astronaut、企业/大学/科研机构 sponsored mission。
          </p>
        </div>
      </div>
    </section>
  )
}
