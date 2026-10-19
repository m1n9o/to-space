import { createContext, useContext } from 'react'
import type { Atlas } from '../domain/model.ts'

export interface AtlasContextValue {
  atlas: Atlas
  /** 判断"当前有效"与新鲜度的基准日期（默认今天） */
  asOf: string
}

export const AtlasContext = createContext<AtlasContextValue | null>(null)

export function useAtlas(): AtlasContextValue {
  const value = useContext(AtlasContext)
  if (!value) throw new Error('useAtlas 必须在 AtlasContext.Provider 内使用')
  return value
}

export function useProject(slug: string | undefined) {
  const { atlas } = useAtlas()
  return atlas.projects.find((p) => p.slug === slug && !p.archivedAt)
}
