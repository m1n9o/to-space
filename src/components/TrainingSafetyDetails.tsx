export function TrainingSafetyDetails() {
  return (
    <section className="supplements">
      <h2>训练、健康与安全须知</h2>

      <details>
        <summary>训练与身体要求：普通人需要练成职业航天员吗？</summary>
        <div className="details-body">
          <p>
            对于亚轨道商业飞行，通常不需要达到职业航天员的选拔标准。但也绝不是坐普通客机。
          </p>
          <p>
            2026
            年发表的《亚轨道太空旅游安全与健康风险评估专家共识》总结了主要挑战：
          </p>
          <ul>
            <li>超重过载：通常 3–6 G</li>
            <li>短时微重力</li>
            <li>前庭刺激</li>
            <li>心血管压力</li>
            <li>心理应激</li>
          </ul>
          <p>建议关注：心血管、神经/前庭、心理/认知、肌肉骨骼、代谢与营养。</p>
          <p>
            共识还把离心机高 G
            耐受训练、应急反应训练列为重要训练项目，并把抛物线微重力体验列为推荐项目。
          </p>
          <h4>不同运营商的实际要求差异很大</h4>
          <ul>
            <li>Blue Origin：官方现场训练约 2 天</li>
            <li>Virgin Galactic：医学筛查 + 系统化飞前准备</li>
            <li>深蓝航天：公开方案要求至少提前约 1 个月进入安全培训</li>
            <li>Axiom / ISS：可能是数月甚至近一年的系统训练</li>
          </ul>
          <p>
            来源：
            <a
              href="https://xinyixue.cn/article/doi/10.12464/j.issn.0253-9802.2026-0503?viewType=HTML"
              target="_blank"
              rel="noopener noreferrer"
            >
              《亚轨道太空旅游安全与健康风险评估专家共识（2026版）》
            </a>
          </p>
        </div>
      </details>

      <details>
        <summary>一个必须理解的安全事实：商业航天 ≠ 民航安全认证模式</summary>
        <div className="details-body">
          <p>
            美国 FAA 当前商业载人航天采用的重要原则之一是{' '}
            <strong>informed consent</strong>。
          </p>
          <p>
            FAA
            明确说明：美国政府并没有把商业载人火箭/飞船认证成「像民航客机一样安全的载客工具」。
          </p>
          <p>运营商需要向乘员披露：</p>
          <ul>
            <li>launch / reentry risks</li>
            <li>known hazards</li>
            <li>unknown hazards</li>
            <li>运营商飞行器安全记录</li>
            <li>其他载人商业飞行器安全记录</li>
          </ul>
          <p>
            乘员理解风险后签署知情同意。美国当前限制 FAA 直接监管机上人员安全的
            legislative moratorium 延续到 <strong>2028 年 1 月 1 日</strong>。
          </p>
          <p>
            因此，今天购买商业载人航天，更准确的类比是「高风险探险活动」，而不是「昂贵的民航头等舱」。
          </p>
          <p>
            来源：
            <a
              href="https://www.faa.gov/space/human_spaceflight"
              target="_blank"
              rel="noopener noreferrer"
            >
              FAA — Human Space Flight
            </a>{' '}
            /{' '}
            <a
              href="https://www.faa.gov/space/additional_information/faq"
              target="_blank"
              rel="noopener noreferrer"
            >
              FAA FAQ
            </a>
          </p>
        </div>
      </details>
    </section>
  )
}
