import { formatIssues, loadAtlas } from '../build/loadAtlas.ts'

// 校验 data/ 下全部数据文件：结构、引用完整性与业务规则。有错误时退出码为 1。

const result = await loadAtlas()
const errors = result.issues.filter((i) => i.severity === 'error').length
const warnings = result.issues.length - errors
if (result.issues.length) console.log(formatIssues(result))
if (result.atlas) {
  const facts = result.atlas.projects.reduce((n, p) => n + p.facts.length, 0)
  const events = result.atlas.projects.reduce((n, p) => n + p.events.length, 0)
  console.log(
    `✓ ${result.atlas.projects.length} 个项目，${facts} 条事实，${events} 条事件，${Object.keys(result.atlas.sources).length} 个来源`,
  )
}
console.log(`${errors} 个错误，${warnings} 个警告`)
process.exit(errors > 0 ? 1 : 0)
