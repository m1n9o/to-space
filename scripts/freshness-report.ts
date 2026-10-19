import { formatIssues, loadAtlas } from '../build/loadAtlas.ts'
import { todayIso } from '../src/domain/dates.ts'
import { projectFreshness } from '../src/domain/freshness.ts'

// 输出需要复核的数据清单。用法：npm run data:freshness -- [YYYY-MM-DD]

const asOf = process.argv[2] ?? todayIso()
const result = await loadAtlas()
if (!result.atlas) {
  console.log(formatIssues(result))
  process.exit(1)
}
const icon = { OK: '✓', REVIEW: '!', CRITICAL: '✗' } as const
console.log(`数据新鲜度报告（基准日 ${asOf}）\n`)
for (const project of result.atlas.projects) {
  const report = projectFreshness(project, result.atlas, asOf)
  console.log(`${icon[report.level]} ${project.slug} [${report.level}]`)
  for (const issue of report.issues)
    console.log(`    - [${issue.level}] ${issue.message}`)
}
