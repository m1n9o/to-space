# Spaceflight Atlas

普通人如何上太空的**结构化决策数据库**：比较商业载人航天项目、追踪进展，并判断下一步能做什么。

每条价格、时间表、售票状态都关联来源和核实日期。官方确认、公司目标与媒体报道分开标注；历史记录不会被覆盖。

- 线上地址：GitHub Pages（`/to-space/`）
- 产品需求：[`new_plan.md`](new_plan.md)
- 首批数据的调研底稿：[`ordinary-person-spaceflight-options-2026.md`](ordinary-person-spaceflight-options-2026.md)（2026-09-16）

## 架构：为什么不用数据库

`new_plan.md` 建议使用 Next.js + PostgreSQL + Prisma，本项目第一阶段**有意选择了更简单的方案**：

| 需求               | 实现方式                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| 存储               | `data/` 下的 YAML 文件，纳入 Git 版本控制                                                               |
| 约束与引用完整性   | Zod schema + `src/domain/normalize.ts` 中的业务规则，构建和 CI 时强制执行                               |
| 历史不覆盖         | 事实只追加（`supersedes` 新版本 + 追加核实记录），CI 中的 `data:check-history` 拒绝修改或删除已发布事实 |
| 审计日志           | `git log` / `git blame`；PR 审查即核实流程                                                              |
| 管理后台与访问控制 | 生产环境**没有任何写入接口**；只有能向仓库提交 PR 的人才能修改数据                                      |
| 查询、筛选、分页   | 构建时把数据嵌入前端，用 `src/domain/query.ts` 完成查询                                                 |
| 部署               | 静态站点，GitHub Pages                                                                                  |

选择理由：数据量小（十几个项目、数百条记录），单人维护、写入频率低、只读访问为主，而产品最重要的资产是“可验证的数据及其历史”。Git 天然提供差异对比、审阅与回溯。以后需要多人在线编辑、用户账户或服务端搜索时，Zod schema 可以一一映射为 Prisma schema，YAML 数据也可以直接导入 PostgreSQL。

```
data/                    数据（唯一事实来源）
  sources.yaml           来源登记表
  projects/*.yaml        每个项目一个文件：档案 + 事实 + 事件 + 判断
src/domain/              纯函数业务层（浏览器与 Node 共用，均有单元测试）
  enums.ts               受控值与中文标签
  schema.ts              数据文件结构（Zod）
  normalize.ts           加载、规范化与跨记录业务规则
  facts.ts               当前有效事实 / 历史版本 / 核实日期（唯一实现）
  pricing.ts             价格语义与可比性
  query.ts               搜索、筛选、排序、分页、URL 参数
  compare.ts timeline.ts freshness.ts appendOnly.ts
build/                   Node 端：读取 YAML、Vite 虚拟模块 virtual:atlas
scripts/                 数据维护命令
src/pages src/components 页面与组件（只消费 domain 层的结果）
```

## 本地运行

需要 Node.js 22 或更高版本。不需要数据库或 Docker，也没有需要配置的环境变量或密钥。

```bash
npm install            # 安装依赖
npm run dev            # 开发服务器 http://localhost:5173 （修改 data/ 会自动刷新）
npm test               # 运行全部测试（Vitest）
npm run typecheck      # TypeScript 严格模式检查
npm run lint           # ESLint
npm run build          # 校验数据 + 类型检查 + 生产构建（输出 dist/）
npm run preview        # 预览生产构建 http://localhost:4173/to-space/
```

数据维护命令：

```bash
npm run data:validate                  # 校验全部数据文件；有错误时退出码为 1
npm run data:check-history -- main     # 对比基线分支，确认没有修改或删除已发布事实
npm run data:freshness -- 2026-12-01   # 输出需要复核的数据清单（默认基准日为今天）
```

数据在构建时由 `build/atlasPlugin.ts` 加载并校验；校验失败则构建失败。不存在单独的“导入/seed”步骤。加载过程是确定性的，可以重复执行（有测试保证）。

## 数据模型

| 实体             | 作用                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project**      | 项目档案。`id`（稳定，`prj_` 前缀）与 `slug`（URL，唯一）分开；`missionType`（飞行类型）与 `developmentStage`（阶段）分开；`commercialAvailability`（购买状态）；`participationPathways`（购买 / 申请选拔 / 赞助 / 经纪）；`targetCustomerSegments`；官方链接（缺失时留空，不虚构）；`dependsOnProjectIds`（例如 SERA 依赖 New Shepard）；`archivedAt`（软删除） |
| **Fact**         | 结构化事实，只追加。`value` 按类型区分：`money`（整数最小货币单位 + 币种 + `priceKind`）、`undisclosed`、`free`、`date`（可为部分精度）、`quantity`、`availability`、`text`。三种时间分开：`validFrom/validUntil`（适用时间）、`observedAt`（何时在来源中看到）、`recordedAt`（何时录入）。`supersedes` 指向被取代的旧版本                                       |
| **Verification** | 追加在事实下的核实记录：日期、核实人、结论（证据状态）、依据、来源。标记过时或争议也通过追加核实记录完成                                                                                                                                                                                                                                                         |
| **Event**        | 已发生或已公告的事件。`announcedAt`（公告日）与 `occurredAt`（发生日）分开；可选 `previousValue/newValue` 和 `businessImpact`                                                                                                                                                                                                                                    |
| **Assessment**   | 编辑判断：风险、信息缺口、判断、行动建议。与事实分开存储                                                                                                                                                                                                                                                                                                         |
| **Source**       | 来源：原始 URL、发布方、类型、发布与访问日期、简短证据摘要、`linkStatus`（OK / BROKEN / UNCHECKED）、`republishedFromId`（转载或同源报道，不计为独立证据）                                                                                                                                                                                                       |

关系：事实/事件与来源之间是多对多，通过 `sourceIds` 引用 `sources.yaml` 中的 ID 实现，引用完整性由校验保证。客户群体和标签的使用频率不高，暂用枚举数组，没有单独建表。

### 状态语义

- **研发/运营阶段**描述“能力已经到哪一步”，不是线性流程。`PAUSED` 和 `CANCELLED` 是运营状态，可以出现在已完成载人飞行的项目上。是否真正载人飞行过，以 `CREWED_FLIGHT_COMPLETED` 事件为准。
- **证据状态**与阶段相互独立。`VERIFIED_OFFICIAL`（官方确认）、`CORROBORATED`（至少两个独立来源）、`REPORTED_UNCONFIRMED`（已报道，未核实）、`COMPANY_TARGET`（公司目标）、`DISPUTED`（来源冲突）、`OUTDATED`（已过时）、`UNKNOWN`（状态未知）。
- **价格**：`UNDISCLOSED`（确认未公开）≠ `UNKNOWN`（数据集中没有记录）≠ `FREE`（赞助，参与者无需付费），三者都不会显示为 0。价格类型分为官方公开价、官方预售价、历史价格、媒体报道价、第三方估算。只有**同币种的官方公开价/预售价**参与数值排序，其余显示“不可直接比较”。本站不做汇率换算。
- **购买状态**：`NOT_YET_OFFERED`（尚未确认公开售票）≠ `NO_COMMERCIAL_PLAN`（没有商业化计划）；`APPLICATION_OPEN` 不等于获得飞行资格。

### 校验规则（自动执行）

- slug、各类 ID 唯一；所有引用必须存在；未知字段直接报错。
- 金额为非负十进制字符串，并且符合币种精度；必须带币种。
- 日期合法；`validFrom ≤ validUntil`；`observedAt ≤ recordedAt`；核实记录按时间顺序排列。
- 没有来源的记录只能标为 `UNKNOWN`；`VERIFIED_OFFICIAL` 需要官方来源；`CORROBORATED` 需要两个独立来源（转载链会被追溯）。
- 一条事实只能被一个新版本取代，且只能取代同类型的事实。
- 已完成类事件必须有发生日期，不能是 `COMPANY_TARGET`，也不能晚于录入日期。未来计划只能记录为 `TARGET_FLIGHT_DATE` 事实。
- 同一 URL 不能登记为两个来源。
- 已发布事实不得修改或删除，由 CI 中的 `data:check-history` 检查。

### 当前有效事实与数据新鲜度

“当前有效”的判定只在 `src/domain/facts.ts` 里实现：未被取代、最新核实状态不是 `OUTDATED`、处在适用时间范围内。冲突记录会同时返回，不会静默选取其中一条。

新鲜度不计算综合评分，而是逐条列出问题（阈值在 `src/domain/freshness.ts`）：

- 票价/押金超过 180 天未核实；
- 售票状态或目标日期超过 90 天未核实；
- 阶段分类超过 180 天未核实；
- 目标日期已过，但没有对应的载人飞行事件（严重）；
- 来源链接失效、存在未解决的争议、关键事实缺失或没有来源。

任一项超过 365 天视为严重。

## 如何维护数据

所有修改都通过 PR 提交，CI 会运行校验、只追加检查和测试。

- **新增项目**：复制一个 `data/projects/*.yaml`，修改 `id`、`slug` 等字段。`firstPublishedAt` 填当天日期。
- **新增来源**：在 `data/sources.yaml` 追加一条，`accessedAt` 填实际访问日期，`excerptOrEvidence` 只写简短摘要。转载同一报道时填写 `republishedFromId`。
- **价格/日期/状态变化**：**不要修改旧事实**。新增一条事实，设置 `supersedes: <旧 id>`，`observedAt` 填看到新信息的日期。如果变化本身值得记录（例如延期公告），再在 `events` 里加一条事件，用 `previousValue/newValue` 写明变化前后的内容。
- **复核**：在事实的 `verifications` 末尾追加 `{ at, by, status, basis, sourceIds }`。确认信息仍然有效，就追加一条同状态的记录；发现过时，追加 `status: OUTDATED`；来源之间冲突，追加 `status: DISPUTED`，并在 `notes` 里说明冲突内容。
- **来源失效**：把来源的 `linkStatus` 改为 `BROKEN` 并更新 `linkCheckedAt`。来源记录本身保留，不删除。
- **下线项目**：设置 `archivedAt`，不要删除文件。
- 提交前运行 `npm run data:validate && npm run data:freshness`。

## 首批数据的可信度与覆盖范围

- 共 14 个项目：亚轨道 7 个（含 3 个中国项目和 2 个赞助/选拔路径）、轨道 1 个、空间站任务 4 个（含 1 个经纪商）、近太空气球 2 个（明确标注为“未进入太空”）。
- **2026-09-16**：来自 `ordinary-person-spaceflight-options-2026.md` 调研快照。迁移时的事实与来源对应关系由迁移者整理，这些事实的 `observedAt` 均为 2026-09-16。
- **2026-10-19**：由 AI（Claude 子代理，通过 WebFetch 访问网页）逐项复核，结果记录为 `by: Claude 辅助复核（待人工复审）` 的核实记录。值有变化时新增了版本，旧版本保留在历史中。复核时的限制：
  - 网页搜索工具不可用，媒体覆盖依赖新闻 RSS，可能遗漏 2026-09 至 10 月间的报道；
  - Reuters、AP 拒绝自动访问，相关来源的链接状态标为 `UNCHECKED`；
  - Blue Origin 官网通过阅读代理获取；SpaceX 新官网为纯 JS 页面，无法读取，相关事实已标为状态未知；
  - 没有直接检查中国公司的官方微信/微博。
- 复核中发现并更正的主要问题：
  - Zephalto 旧数据称“商业运营中”，实际尚未开始载客；
  - HALO Space 商业首飞目标由 2026 年变为 2029 年；
  - Virgin Galactic 由“已售罄”变为开放新一批预订（新价格仅见媒体报道）；
  - 力鸿二号首飞推迟至 2027 年一季度；
  - 穿越者票价只见媒体报道，由“官方预售价”更正为“媒体报道价”；
  - 若干“已确认”日期更正为公司目标；
  - SpaceX 旧官网链接失效。
- **建议在正式对外前，由人工逐条复审标注为“待人工复审”的记录。**

## 安全

- 生产环境是纯静态站点，没有 API，也没有写入接口；数据修改只能通过仓库 PR。
- 来源标题与摘要都以纯文本渲染（React 默认转义），不渲染任何外部 HTML。外链带 `rel="noopener noreferrer"`。
- 所有 URL 在校验时要求是 `http(s)`，`javascript:` 等协议会被拒绝。
- URL 查询参数只接受白名单中的枚举值与排序键。
- 没有环境变量或密钥，所以不需要 `.env.example`。

## 已知限制

- 只有一个维护入口（编辑 YAML）。没有图形化的管理后台，不适合非技术人员维护。
- 搜索在前端完成，数据量达到数千项目级别时需要迁移到服务端查询。
- 没有汇率换算，不同币种的价格不做比较。
- 详情页是客户端渲染，没有为每个项目预渲染静态 HTML，对 SEO 不友好。
- 没有自动链接检查。`linkStatus` 需要人工或脚本更新。
- 没有 Playwright 端到端测试。页面流程由 Testing Library 组件测试覆盖，并在本地用无头浏览器做过截图检查。

## 后续可扩展方向

1. 本地运行的数据录入工具（表单生成符合 schema 的 YAML，再提交 PR）。
2. 定时的链接可访问性检查，自动提交 `linkStatus` 更新的 PR。
3. 为详情页预渲染静态 HTML（SSG），改善 SEO 与首屏速度。
4. 需要多人协作或用户功能时，迁移到 PostgreSQL + Prisma（schema 与 `src/domain/schema.ts` 一一对应）。
5. 带来源与换算日期的汇率换算。
