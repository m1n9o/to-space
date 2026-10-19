import { useAtlas } from '../app/atlasContext.ts'
import { projectLastVerifiedAt } from '../domain/facts.ts'

/** 首页简介区：地球边缘与卡门线示意背景（纯装饰）+ 数据集统计 */
export function Hero() {
  const { atlas, asOf } = useAtlas()
  const active = atlas.projects.filter((p) => !p.archivedAt)
  const factCount = active.reduce((n, p) => n + p.facts.length, 0)
  const latest = active
    .map((p) => projectLastVerifiedAt(p, asOf))
    .reduce<string | null>((max, d) => (d && (!max || d > max) ? d : max), null)

  return (
    <section className="hero">
      <HeroArt />
      <div className="container hero-inner">
        <h1>普通人如何上太空：项目档案与进展追踪</h1>
        <p>
          面向非职业航天员的载人航天参与路径。每条价格、时间表和售票状态都标注来源与核实日期；公司目标、媒体报道与官方确认分开显示。
        </p>
        <dl className="hero-stats">
          <div>
            <dt>收录项目</dt>
            <dd>{active.length}</dd>
          </div>
          <div>
            <dt>结构化事实</dt>
            <dd>{factCount}</dd>
          </div>
          <div>
            <dt>来源</dt>
            <dd>{Object.keys(atlas.sources).length}</dd>
          </div>
          <div>
            <dt>最近复核</dt>
            <dd>{latest ?? '未核实'}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 1280 220"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hero-planet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--limb)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--limb)" stopOpacity="0.04" />
        </linearGradient>
        <filter id="hero-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <circle
        cx="1060"
        cy="1060"
        r="905"
        fill="none"
        stroke="var(--limb)"
        strokeOpacity="0.35"
        strokeWidth="22"
        filter="url(#hero-blur)"
      />
      <circle
        cx="1060"
        cy="1060"
        r="900"
        fill="url(#hero-planet)"
        stroke="var(--limb)"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <circle
        cx="1060"
        cy="1060"
        r="940"
        fill="none"
        stroke="var(--limb)"
        strokeOpacity="0.5"
        strokeDasharray="3 6"
      />
      <text
        className="hero-art-detail"
        x="1250"
        y="112"
        textAnchor="end"
        fontSize="11"
        fill="var(--limb)"
      >
        100 km 卡门线
      </text>
      <path
        className="hero-art-detail"
        d="M842 205 C 880 40, 1000 20, 1062 170"
        fill="none"
        stroke="var(--traj)"
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
      <circle
        className="hero-art-detail"
        cx="958"
        cy="66"
        r="3.5"
        fill="var(--traj)"
        fillOpacity="0.7"
      />
    </svg>
  )
}
