import { NavLink, Outlet } from 'react-router'
import { useCompareSelection } from '../features/compare/useCompareSelection.ts'
import { Logo } from './icons.tsx'

export function Layout() {
  const { ids } = useCompareSelection()
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            <Logo />
            <span className="brand-text">
              Spaceflight Atlas
              <span className="brand-sub">普通人上太空 · 结构化决策数据库</span>
            </span>
          </NavLink>
          <nav aria-label="主导航">
            <NavLink to="/" end>
              项目
            </NavLink>
            <NavLink
              to={`/compare${ids.length ? `?ids=${ids.join(',')}` : ''}`}
            >
              对比{ids.length > 0 && `（${ids.length}）`}
            </NavLink>
            <NavLink to="/methodology">数据规则</NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>
            本站数据由人工整理并经 AI
            辅助复核（标注为“待人工复审”的核实记录尚未经人工确认），可能滞后于实际情况。价格、日期与售票状态请以运营方最新官方信息为准；
            付款前请自行核实飞行安排与退款条款。本站不提供任何购票服务，也不对项目作推荐排名。
          </p>
        </div>
      </footer>
    </div>
  )
}
