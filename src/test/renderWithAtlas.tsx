import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AtlasContext } from '../app/atlasContext.ts'
import { Layout } from '../components/Layout.tsx'
import type { Atlas } from '../domain/model.ts'
import { ComparePage } from '../pages/ComparePage.tsx'
import { ProjectDetailPage } from '../pages/ProjectDetailPage.tsx'
import { ProjectListPage } from '../pages/ProjectListPage.tsx'

export function renderApp(atlas: Atlas, url: string, asOf = '2026-10-19') {
  return render(
    <AtlasContext.Provider value={{ atlas, asOf }}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<ProjectListPage />} />
            <Route path="projects/:slug" element={<ProjectDetailPage />} />
            <Route path="compare" element={<ComparePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AtlasContext.Provider>,
  )
}
