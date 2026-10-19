import { execFileSync } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'yaml'
import { DATA_DIR } from '../build/loadAtlas.ts'
import { checkAppendOnly, rawFacts } from '../src/domain/appendOnly.ts'

// 对比基线提交（默认 origin/main）与工作区，确保已发布事实未被修改或删除。
// 用法：npm run data:check-history -- [base-ref]

const base = process.argv[2] ?? 'origin/main'
const git = (...args: string[]) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

let baseFiles: string[]
try {
  baseFiles = git('ls-tree', '--name-only', `${base}:data/projects`)
    .split('\n')
    .filter((f) => f.endsWith('.yaml'))
} catch {
  console.log(`基线 ${base} 中没有 data/projects，跳过检查`)
  process.exit(0)
}

const headFiles = new Set(await readdir(path.join(DATA_DIR, 'projects')))
const violations = []
for (const file of baseFiles) {
  const rel = `data/projects/${file}`
  const before = rawFacts(parse(git('show', `${base}:${rel}`)))
  if (!headFiles.has(file)) {
    if (before.length)
      violations.push({
        factId: '*',
        path: rel,
        message: '项目文件被删除；请使用 archivedAt 软删除',
      })
    continue
  }
  const after = rawFacts(
    parse(await readFile(path.join(DATA_DIR, 'projects', file), 'utf8')),
  )
  violations.push(...checkAppendOnly(rel, before, after))
}

for (const v of violations) console.log(`✗ ${v.path} ${v.factId}: ${v.message}`)
console.log(
  violations.length
    ? `${violations.length} 处违反只追加规则`
    : `✓ 相对 ${base} 未修改任何已发布事实`,
)
process.exit(violations.length ? 1 : 0)
