import type {
  EventInput,
  FactInput,
  FactValueInput,
  ProjectFile,
  Source,
} from './schema.ts'

// 规范化后的数据模型：由数据文件加载、校验后生成，浏览器端只消费这个结构。

export type FactValue =
  | Exclude<FactValueInput, { kind: 'money' }>
  | (Extract<FactValueInput, { kind: 'money' }> & { amountMinor: number })

export interface Fact extends Omit<FactInput, 'value'> {
  projectId: string
  value: FactValue
  /** 由加载器根据其他事实的 supersedes 反向计算 */
  supersededById?: string
}

export interface ProjectEvent extends EventInput {
  projectId: string
}

export interface Project extends Omit<ProjectFile, 'facts' | 'events'> {
  facts: Fact[]
  events: ProjectEvent[]
}

export interface Atlas {
  projects: Project[]
  sources: Record<string, Source>
}

export type { Source }

export interface DataIssue {
  severity: 'error' | 'warning'
  path: string
  message: string
}
