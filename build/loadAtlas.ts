import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'yaml'
import {
  normalizeAtlas,
  type NormalizeResult,
  type RawProjectFile,
} from '../src/domain/normalize.ts'

// 仅在 Node 环境运行：读取 data/ 目录下的 YAML 数据文件并校验。

export const DATA_DIR = path.resolve(import.meta.dirname, '..', 'data')

export async function readRawData(dataDir = DATA_DIR): Promise<{
  projects: RawProjectFile[]
  sources: unknown
}> {
  const projectDir = path.join(dataDir, 'projects')
  const files = (await readdir(projectDir))
    .filter((f) => f.endsWith('.yaml'))
    .sort()
  const projects = await Promise.all(
    files.map(async (file) => ({
      path: `data/projects/${file}`,
      data: parse(await readFile(path.join(projectDir, file), 'utf8')),
    })),
  )
  const sources = parse(
    await readFile(path.join(dataDir, 'sources.yaml'), 'utf8'),
  )
  return { projects, sources }
}

export async function loadAtlas(dataDir = DATA_DIR): Promise<NormalizeResult> {
  const raw = await readRawData(dataDir)
  return normalizeAtlas(raw.projects, raw.sources)
}

export function formatIssues(result: NormalizeResult): string {
  return result.issues
    .map((i) => `${i.severity === 'error' ? '✗' : '!'} ${i.path}: ${i.message}`)
    .join('\n')
}
