import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout.tsx'
import { ComparePage } from './pages/ComparePage.tsx'
import { MethodologyPage } from './pages/MethodologyPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { ProjectDetailPage } from './pages/ProjectDetailPage.tsx'
import { ProjectListPage } from './pages/ProjectListPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ProjectListPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="methodology" element={<MethodologyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
