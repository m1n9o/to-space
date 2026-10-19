import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section>
      <h1>未找到该页面</h1>
      <p>
        项目可能已更名或不存在。<Link to="/">返回项目列表</Link>
      </p>
    </section>
  )
}
