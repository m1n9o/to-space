interface SourceLink {
  label: string
  url: string
}

interface SourceGroup {
  title: string
  links: SourceLink[]
}

const SOURCE_GROUPS: SourceGroup[] = [
  {
    title: '美国监管',
    links: [
      {
        label: 'FAA Human Space Flight',
        url: 'https://www.faa.gov/space/human_spaceflight',
      },
      {
        label: 'FAA Commercial Space FAQ',
        url: 'https://www.faa.gov/space/additional_information/faq',
      },
    ],
  },
  {
    title: 'Blue Origin',
    links: [
      { label: 'New Shepard', url: 'https://www.blueorigin.com/new-shepard' },
      {
        label: 'New Shepard Experience / deposit',
        url: 'https://www.blueorigin.com/new-shepard/experience',
      },
      {
        label: 'Training',
        url: 'https://www.blueorigin.com/en-US/new-shepard/fly',
      },
      {
        label: 'Pause announcement',
        url: 'https://www.blueorigin.com/zh-HK/news/new-shepard-to-pause-flights',
      },
      {
        label: 'NS-34 / Justin Sun',
        url: 'https://www.blueorigin.com/missions/ns-34',
      },
    ],
  },
  {
    title: 'Virgin Galactic',
    links: [
      {
        label: 'Q2 2026 business update',
        url: 'https://www.virgingalactic.com/news/virgin-galactic-announces-second-quarter-2026-financial-results-and-provides-business-update',
      },
      {
        label: 'Spaceflight brochure',
        url: 'https://www.virgingalactic.com/virgin-galactic-brochure',
      },
      { label: 'Research', url: 'https://www.virgingalactic.com/research' },
    ],
  },
  {
    title: 'Deep Blue Aerospace',
    links: [
      { label: '科创板日报', url: 'https://www.cls.cn/detail/1836569' },
      {
        label: 'Reuters',
        url: 'https://www.reuters.com/technology/space/chinese-startup-sell-tickets-2027-space-tourism-flights-2024-10-24/',
      },
      {
        label: '中国科学报 / 科学网',
        url: 'https://news.sciencenet.cn/htmlnews/2024/10/532478.shtm',
      },
    ],
  },
  {
    title: 'CAS Space',
    links: [
      { label: 'PH-2', url: 'https://www.cas-space.com/list/43.html' },
      { label: 'PH-1 test', url: 'https://www.cas-space.com/article/177.html' },
      {
        label: '2026 最新定价/时间表采访',
        url: 'https://finance.sina.com.cn/wm/2026-07-06/doc-inifwwms8534037.shtml',
      },
    ],
  },
  {
    title: 'interstellOr',
    links: [
      { label: '官方网站', url: 'https://www.interstellor.com/' },
      {
        label: '产品路线',
        url: 'https://en.interstellor.com/products-and-services',
      },
      { label: '2026 售票报道', url: 'https://www.cls.cn/detail/2267177' },
    ],
  },
  {
    title: 'Axiom / NASA',
    links: [
      { label: 'Ax-1', url: 'https://www.axiomspace.com/missions/ax1' },
      {
        label: 'NASA Ax-5',
        url: 'https://www.nasa.gov/news-release/nasa-selects-axiom-space-for-fifth-private-mission-to-space-station/',
      },
      {
        label: 'NASA Private Astronaut Missions',
        url: 'https://www.nasa.gov/humans-in-space/private-astronaut-missions/',
      },
    ],
  },
  {
    title: 'SpaceX',
    links: [
      {
        label: 'Human Spaceflight',
        url: 'https://new.spacex.com/humanspaceflight',
      },
      { label: 'Moon', url: 'https://new.spacex.com/humanspaceflight/moon' },
    ],
  },
  {
    title: 'Vast',
    links: [
      { label: 'Haven-1', url: 'https://www.vastspace.com/haven-1' },
      {
        label: 'Create Your Mission',
        url: 'https://www.vastspace.com/create-your-mission',
      },
      {
        label: 'NASA PAM-6',
        url: 'https://www.nasa.gov/news-release/nasa-selects-vast-for-sixth-private-mission-to-space-station/',
      },
    ],
  },
  {
    title: 'Voyager',
    links: [
      {
        label: 'NASA PAM-7',
        url: 'https://www.nasa.gov/news-release/nasa-selects-voyager-for-seventh-private-mission-to-space-station/',
      },
    ],
  },
  {
    title: 'SERA',
    links: [
      { label: 'Registration', url: 'https://www.sera.space/registration' },
      {
        label: 'Astronaut selection',
        url: 'https://www.sera.space/astronauts',
      },
    ],
  },
  {
    title: 'Space for Humanity',
    links: [
      {
        label: 'Citizen Astronaut application',
        url: 'https://spaceforhumanity.org/apply',
      },
    ],
  },
  {
    title: 'Near Space',
    links: [
      { label: 'Zephalto FAQ', url: 'https://www.zephalto.com/faq' },
      { label: 'Zephalto Terms', url: 'https://www.zephalto.com/legals/cgv' },
      { label: 'HALO Space FAQ', url: 'https://www.halospaceflight.com/faq' },
      {
        label: 'HALO Space Experience',
        url: 'https://www.halospaceflight.com/ground-experience',
      },
    ],
  },
  {
    title: 'China Manned Space / Tiangong',
    links: [
      {
        label: '2026 mission plan',
        url: 'https://www.cmse.gov.cn/xwzx/202602/t20260227_57278.html',
      },
      {
        label: '2026 research/application program',
        url: 'https://www.cmse.gov.cn/xwzx/202607/t20260720_57699.html',
      },
    ],
  },
  {
    title: 'Medical / preparation',
    links: [
      {
        label: '亚轨道太空旅游安全与健康风险评估专家共识（2026版）',
        url: 'https://xinyixue.cn/article/doi/10.12464/j.issn.0253-9802.2026-0503?viewType=HTML',
      },
    ],
  },
]

export function SourcesFooter() {
  return (
    <footer className="sources-index">
      <h2>核心来源索引</h2>
      <div className="sources-index__grid">
        {SOURCE_GROUPS.map((group) => (
          <div className="sources-index__group" key={group.title}>
            <h4>{group.title}</h4>
            <ul>
              {group.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="footer-meta">
        数据整理自 ordinary-person-spaceflight-options-2026.md · 页面内容截至
        2026-09-16，请以各官方渠道最新信息为准。
      </p>
    </footer>
  )
}
