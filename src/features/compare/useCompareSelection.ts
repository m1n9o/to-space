import { useCallback, useSyncExternalStore } from 'react'
import { MAX_COMPARE } from '../../domain/compare.ts'

// 对比选择保存在 localStorage，跨页面保持。

const KEY = 'atlas.compare'
const listeners = new Set<() => void>()
let cache: string[] | null = null

function read(): string[] {
  if (cache) return cache
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    cache = Array.isArray(parsed)
      ? parsed
          .filter((v): v is string => typeof v === 'string')
          .slice(0, MAX_COMPARE)
      : []
  } catch {
    cache = []
  }
  return cache
}

function write(ids: string[]) {
  cache = ids
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // 存储不可用时仅保留内存状态
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useCompareSelection() {
  const ids = useSyncExternalStore(subscribe, read, read)
  const toggle = useCallback((slug: string) => {
    const current = read()
    if (current.includes(slug)) write(current.filter((s) => s !== slug))
    else if (current.length < MAX_COMPARE) write([...current, slug])
  }, [])
  const set = useCallback(
    (slugs: string[]) => write(slugs.slice(0, MAX_COMPARE)),
    [],
  )
  return { ids, toggle, set, isFull: ids.length >= MAX_COMPARE }
}
