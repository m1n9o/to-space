import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import atlas from 'virtual:atlas'
import App from './App.tsx'
import { AtlasContext } from './app/atlasContext.ts'
import { todayIso } from './domain/dates.ts'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AtlasContext.Provider value={{ atlas, asOf: todayIso() }}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </AtlasContext.Provider>
  </StrictMode>,
)
