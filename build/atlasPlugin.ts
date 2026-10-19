import type { Plugin } from 'vite'
import { DATA_DIR, formatIssues, loadAtlas } from './loadAtlas.ts'

// 提供虚拟模块 virtual:atlas：构建时加载并校验 data/，校验失败则构建失败。
// 浏览器端拿到的只是规范化后的 JSON，不包含 YAML 解析器。

const VIRTUAL_ID = 'virtual:atlas'
const RESOLVED_ID = `\0${VIRTUAL_ID}`

export function atlasPlugin(): Plugin {
  return {
    name: 'atlas-data',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },
    async load(id) {
      if (id !== RESOLVED_ID) return undefined
      const result = await loadAtlas()
      if (!result.atlas) {
        throw new Error(`数据校验失败：\n${formatIssues(result)}`)
      }
      this.addWatchFile(DATA_DIR)
      return `export default ${JSON.stringify(result.atlas)}`
    },
    configureServer(server) {
      server.watcher.add(DATA_DIR)
      server.watcher.on('change', (file) => {
        if (!file.startsWith(DATA_DIR)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
