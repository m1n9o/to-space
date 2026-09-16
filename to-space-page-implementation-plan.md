---
title: "『普通人如何上太空』页面 — 实现文档"
purpose: "供新建独立仓库时直接实现使用，内容基于 ordinary-person-spaceflight-options-2026.md"
last_updated: "2026-09-16"
---

# 实现文档：How Can an Ordinary Person Go to Space (2026)

> 本文档是给新仓库的实现规格，不依赖 quad-daily 仓库的任何代码。数据来源为同目录下的
> `ordinary-person-spaceflight-options-2026.md`，若该文档更新，本文档中的数据结构也需要同步更新。

---

## 1. 目标与约束

- 做一个**独立站点**，与 quad-daily（看板 App）没有任何代码/路由/状态关联。
- 主题：太空风格（深色背景 + 星空/星云 + 发光强调色），信息密度高但可通过筛选器快速定位。
- 严格区分事实类型：**已发生的事实** vs **公司目标/预售价格/历史成交价**。页面上必须用 Badge 明确标注，不能把"公司目标"渲染成"确定可用"。
- 内容语言：中文（与源文档一致）。

## 2. 推荐技术栈

内容本质是"一份可筛选的静态数据 + 卡片 UI"，不需要复杂框架。推荐两种方案，任选其一：

**方案 A（推荐，最省事）**：纯静态 HTML + CSS + vanilla JS，无构建步骤。
- `index.html` + `style.css` + `data.js`（数据）+ `app.js`（筛选/渲染逻辑）
- 直接扔进新仓库根目录，GitHub Pages 用 `main` 分支 / `docs` 目录直接托管，零构建配置。

**方案 B**：Vite + 原生 TS（不用 React，页面本身没有复杂交互状态）。
- 更好的开发体验（热更新、类型检查数据结构），构建后仍是静态产物。
- 如果之后想加更多页面/路由，这个方案更方便扩展。

两种方案的数据结构、设计系统、页面结构完全一致，见下文。

## 3. 站点结构

```
/
├── index.html          # Hero + Filter + Card Grid + Footer
├── style.css
├── data.js / data.ts    # 见第 5 节，所有 Option 的结构化数据
└── app.js / main.ts     # 渲染卡片、筛选逻辑
```

单页应用，无需路由。

## 4. 设计系统（太空主题）

### 4.1 配色

深色背景为主，避免纯黑（用深蓝/深紫），强调色做发光效果。

```css
:root {
  --bg-void: #05070f;
  --bg-panel: #0c1024;
  --bg-panel-hover: #12173a;
  --border-subtle: rgba(148, 163, 255, 0.16);

  --text-primary: #eef1ff;
  --text-secondary: #9aa3c7;
  --text-muted: #5c6390;

  --accent-cyan: #5ee7ff;
  --accent-violet: #a78bfa;
  --accent-magenta: #ff7ad9;
  --accent-amber: #ffb454;   /* 用于警示/不确定性 badge */
  --accent-green: #4ade80;   /* 用于 FLIGHT PROVEN 等已验证事实 */
  --accent-red: #fb7185;     /* 用于 PAUSED / SOLD OUT / CLOSED */

  --gradient-nebula: radial-gradient(
      60% 60% at 20% 10%,
      rgba(167, 139, 250, 0.25),
      transparent 60%
    ),
    radial-gradient(50% 50% at 85% 20%, rgba(94, 231, 255, 0.18), transparent 60%),
    radial-gradient(70% 70% at 50% 100%, rgba(255, 122, 217, 0.12), transparent 60%);
}
```

### 4.2 星空背景

用 CSS 生成多层小圆点（box-shadow 打点法），无需图片资源，性能好：

```css
body {
  background-color: var(--bg-void);
  background-image: var(--gradient-nebula);
}

.starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.8;
}
/* 用 JS 生成 2~3 层不同大小/透明度/动画速度的星点 div，
   或用一个 <canvas> 绘制随机点 + 极慢的 twinkle opacity 动画。
   建议：canvas 方案，200~300 个点，随机 radius 0.5~1.5px，
   随机 twinkle 周期 3~6s，避免 GPU 负担。 */
```

### 4.3 字体

- 标题：等宽感/科技感字体，如 `"Space Grotesk", "IBM Plex Sans", system-ui`
- 正文：`"Inter", "PingFang SC", "Noto Sans SC", system-ui`（中文优先保证可读性，不必强求科技感字体覆盖中文）
- 数字/坐标类信息（高度、价格）可用等宽字体 `"JetBrains Mono", monospace` 增强"仪表盘"感

### 4.4 卡片样式

- 半透明面板 `background: var(--bg-panel)`，`border: 1px solid var(--border-subtle)`，`border-radius: 16px`
- hover 时轻微上浮 + 边框发光（`box-shadow: 0 0 24px rgba(94,231,255,0.15)`）
- 卡片顶部一条按 Experience Type 着色的细条（近太空=灰紫，亚轨道=青色，轨道=品红，空间站=金色），帮助用户扫视分类

### 4.5 响应式

- Desktop: 3 列卡片网格
- Tablet: 2 列
- Mobile: 1 列，筛选器折叠为下拉/抽屉

## 5. 数据结构

### 5.1 Option 字段（对应源文档第 28 节的建议字段）

```ts
type ExperienceType = 'near-space' | 'suborbital' | 'orbital' | 'station'

type StatusBadge =
  | 'FLIGHT_PROVEN'
  | 'CURRENTLY_PAUSED'
  | 'BOOKING_OPEN'
  | 'WAITLIST'
  | 'SOLD_OUT'
  | 'COMPANY_TARGET'
  | 'PRICE_UNDISCLOSED'
  | 'HISTORICAL_PRICE'
  | 'PRE_SALE'
  | 'UNDER_DEVELOPMENT'
  | 'SPONSORED'
  | 'APPLICATIONS_CLOSED'
  | 'NOT_ACTUAL_SPACE'

interface SpaceOption {
  id: string
  provider: string          // 运营方，如 "Blue Origin"
  vehicle: string           // 飞行器/项目名，如 "New Shepard"
  experienceType: ExperienceType
  altitudeKm: string        // 展示用字符串，如 "100+ km" / "25 km"
  crossesKarmanLine: boolean | 'target' // true=已验证跨越, 'target'=目标但未验证, false=不跨越
  flightDuration: string    // 如 "约 11 分钟"
  weightlessness: string    // 如 "数分钟" / "不适用"
  price: string             // 展示字符串，如 "$150,000（可退押金，非最终票价）"
  priceStatus: StatusBadge[] // 可多个，如 ['PRICE_UNDISCLOSED']
  deposit: string | null
  bookingStatus: StatusBadge[]
  targetDate: string        // 如 "公司目标 2027-02" 或 "已完成"
  dateConfidence: 'confirmed' | 'company-target' | 'unclear'
  training: string
  medicalRequirements: string
  technicalMaturity: string
  crewedFlightHistory: string
  mainRisks: string[]
  badges: StatusBadge[]      // 顶部展示的核心 badge（去重后的关键几个）
  budgetTier: 'sponsored' | 'lt-3m-cny' | '500k-1m-usd' | '1m-10m-usd' | '10m-usd-plus'
  sources: { label: string; url: string }[]
  lastChecked: string        // "2026-09-16"
}
```

### 5.2 全部 Option 数据（可直接改写为 JSON/TS 数组）

> 以下内容全部整理自源文档，字段值已经过事实/目标区分处理。实现时建议先做成 `data.js` 常量导出。

```js
export const SPACE_OPTIONS = [
  {
    id: "blue-origin-new-shepard",
    provider: "Blue Origin",
    vehicle: "New Shepard",
    experienceType: "suborbital",
    altitudeKm: "100+ km（越过卡门线）",
    crossesKarmanLine: true,
    flightDuration: "约 11 分钟",
    weightlessness: "数分钟",
    price: "正式票价未公开；进入订购流程需 $150,000 可退押金",
    priceStatus: ["PRICE_UNDISCLOSED"],
    deposit: "$150,000 USD（全额可退）",
    bookingStatus: ["CURRENTLY_PAUSED"],
    targetDate: "理论最早 2028+（暂停≥2年推导），无官方复飞日期",
    dateConfidence: "unclear",
    training: "2 天现场训练（mission profile / safety systems / zero-G protocol / mission simulation）",
    medicalRequirements: "未见严格职业航天员标准，但需完成安全培训",
    technicalMaturity: "已执行 38 次飞行，98 人次跨越卡门线",
    crewedFlightHistory: "已大量商业载人飞行（含孙宇晨 NS-34，2025-08-03）",
    mainRisks: ["复飞时间未知", "最终票价不公开", "已有多年 customer backlog", "意向登记不等于确定座位"],
    badges: ["FLIGHT_PROVEN", "CURRENTLY_PAUSED", "PRICE_UNDISCLOSED"],
    budgetTier: "10m-usd-plus",
    sources: [
      { label: "New Shepard Experience / deposit", url: "https://www.blueorigin.com/new-shepard/experience" },
      { label: "Pause announcement", url: "https://www.blueorigin.com/zh-HK/news/new-shepard-to-pause-flights" },
      { label: "New Shepard overview", url: "https://www.blueorigin.com/new-shepard" },
      { label: "Training", url: "https://www.blueorigin.com/en-US/new-shepard/fly" },
      { label: "NS-34 / Justin Sun", url: "https://www.blueorigin.com/missions/ns-34" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "virgin-galactic-delta",
    provider: "Virgin Galactic",
    vehicle: "Delta",
    experienceType: "suborbital",
    altitudeKm: "约 91 km（不跨卡门线）",
    crossesKarmanLine: false,
    flightDuration: "全流程含母机带飞，滑翔跑道降落",
    weightlessness: "数分钟",
    price: "最近一批 $750,000/seat，已售罄；下一批计划更贵",
    priceStatus: ["SOLD_OUT", "HISTORICAL_PRICE"],
    deposit: null,
    bookingStatus: ["SOLD_OUT"],
    targetDate: "公司目标：2027-02 恢复商业飞行",
    dateConfidence: "company-target",
    training: "医学问卷 + 现场体检 + 飞行准备/安全培训",
    medicalRequirements: "详细 pre-flight medical questionnaire + in-person checkup",
    technicalMaturity: "上一代飞船已有商业载人经验；Delta 新飞船测试阶段（计划 2026-10 flight test）",
    crewedFlightHistory: "上一代系统已完成商业载人飞行",
    mainRisks: ["Delta 是新一代飞船，尚需完成测试", "2027-02 为公司目标非确定日期", "当前批次已售罄", "不跨 100km 卡门线"],
    badges: ["SOLD_OUT", "COMPANY_TARGET", "NOT_ACTUAL_SPACE"],
    budgetTier: "500k-1m-usd",
    sources: [
      { label: "Q2 2026 business update", url: "https://www.virgingalactic.com/news/virgin-galactic-announces-second-quarter-2026-financial-results-and-provides-business-update" },
      { label: "Spaceflight brochure", url: "https://www.virgingalactic.com/virgin-galactic-brochure" },
      { label: "FAA — no legal definition of space boundary", url: "https://www.faa.gov/space/additional_information/faq" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "deep-blue-aerospace",
    provider: "深蓝航天",
    vehicle: "亚轨道可回收火箭",
    experienceType: "suborbital",
    altitudeKm: "目标 100+ km（未验证载人）",
    crossesKarmanLine: "target",
    flightDuration: "约 12 分钟",
    weightlessness: "不少于 5 分钟（目标）",
    price: "标价 ¥1,500,000；首批直播优惠价 ¥1,000,000；订金 ¥50,000",
    priceStatus: ["PRE_SALE", "HISTORICAL_PRICE"],
    deposit: "¥50,000",
    bookingStatus: ["PRE_SALE"],
    targetDate: "公司目标 2027，高度不确定",
    dateConfidence: "company-target",
    training: "建议年龄 18–60；健康检测；飞行前至少约 1 个月安全培训",
    medicalRequirements: "专业健康检测，特殊情况需医学评估",
    technicalMaturity: "尚未商业载人；2026 需完成大量船箭组合试验",
    crewedFlightHistory: "无",
    mainRisks: ["尚无商业载人记录", "时间表依赖火箭/飞船/逃逸/生保等大量工程验证", "2027 是公司目标非确定班期"],
    badges: ["PRE_SALE", "UNDER_DEVELOPMENT", "COMPANY_TARGET"],
    budgetTier: "lt-3m-cny",
    sources: [
      { label: "科创板日报", url: "https://www.cls.cn/detail/1836569" },
      { label: "Reuters", url: "https://www.reuters.com/technology/space/chinese-startup-sell-tickets-2027-space-tourism-flights-2024-10-24/" },
      { label: "中国科学报/科学网", url: "https://news.sciencenet.cn/htmlnews/2024/10/532478.shtm" },
      { label: "澎湃新闻", url: "https://m.thepaper.cn/newsDetail_forward_29148643" },
      { label: "每日经济新闻", url: "https://www.nbd.com.cn/articles/2024-10-24/3605077.html" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "cas-space",
    provider: "中科宇航 CAS Space",
    vehicle: "力鸿二号 PH-2",
    experienceType: "suborbital",
    altitudeKm: "目标 ≥100 km（PH-1 无人验证已达 120 km）",
    crossesKarmanLine: "target",
    flightDuration: "早期方案约 30 分钟",
    weightlessness: "目标 ≥180 秒",
    price: "初期目标 ≤¥2,000,000；远期目标 ¥700,000 甚至 ¥200,000–300,000（均为远期愿景非现价）",
    priceStatus: ["COMPANY_TARGET", "UNDER_DEVELOPMENT"],
    deposit: null,
    bookingStatus: ["UNDER_DEVELOPMENT"],
    targetDate: "公司最新目标：2028 年游客上太空",
    dateConfidence: "company-target",
    training: "早期方案含短期飞前专业培训（具体产品仍可能变化）",
    medicalRequirements: "未公开具体标准",
    technicalMaturity: "PH-1 已完成 120km 无人亚轨道验证与伞降回收；PH-2 载人系统仍在开发",
    crewedFlightHistory: "无（PH-1 为无人验证，不等于 PH-2 载人能力）",
    mainRisks: ["无人验证 ≠ 载人旅游能力", "商业载人环节仍处于开发阶段", "价格远期目标不能当作现价"],
    badges: ["UNDER_DEVELOPMENT", "COMPANY_TARGET"],
    budgetTier: "lt-3m-cny",
    sources: [
      { label: "董事长采访 2026-07", url: "https://finance.sina.com.cn/wm/2026-07-06/doc-inifwwms8534037.shtml" },
      { label: "PH-2 官方参数", url: "https://www.cas-space.com/list/43.html" },
      { label: "PH-1 120km 试验", url: "https://www.cas-space.com/article/177.html" },
      { label: "科技日报 早期方案", url: "https://www.stdaily.com/web/gdxw/2024-05/15/content_1960467.html" },
      { label: "可回收推进研发", url: "https://www.cas-space.com/article/382.html" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "interstellor-cyz1",
    provider: "穿越者 interstellOr",
    vehicle: "CYZ1",
    experienceType: "suborbital",
    altitudeKm: "目标约 100 km",
    crossesKarmanLine: "target",
    flightDuration: "20–30 分钟",
    weightlessness: "目标 5–10 分钟",
    price: "总票价 ¥3,000,000；预订费 10%（¥300,000）",
    priceStatus: ["PRE_SALE"],
    deposit: "¥300,000（10%）",
    bookingStatus: ["PRE_SALE"],
    targetDate: "公司目标 2028 年前后首飞",
    dateConfidence: "company-target",
    training: "未公开具体标准（飞船仍在工程研制阶段）",
    medicalRequirements: "未公开具体标准",
    technicalMaturity: "全尺寸试验舱展示、着陆缓冲验证；载人飞船进入工程研制；尚需无人验证",
    crewedFlightHistory: "无",
    mainRisks: ["售票进度领先于完整载人飞行验证进度", "属于 Early Access 而非成熟航班购买"],
    badges: ["PRE_SALE", "UNDER_DEVELOPMENT", "COMPANY_TARGET"],
    budgetTier: "lt-3m-cny",
    sources: [
      { label: "穿越者官网", url: "https://www.interstellor.com/" },
      { label: "产品路线", url: "https://en.interstellor.com/products-and-services" },
      { label: "科创板日报 定价/预订", url: "https://www.cls.cn/detail/2267177" },
      { label: "科创板日报 首飞报道", url: "https://www.cls.cn/detail/2266549" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "axiom-spacex",
    provider: "Axiom Space + SpaceX",
    vehicle: "Crew Dragon → ISS",
    experienceType: "station",
    altitudeKm: "约 400 km（ISS 轨道）",
    crossesKarmanLine: true,
    flightDuration: "最多约 14 天驻留",
    weightlessness: "持续（数天至数周）",
    price: "当前不公开、询价制；Ax-1 历史报道约 $55M/人（历史价格，非现行标准报价）",
    priceStatus: ["PRICE_UNDISCLOSED", "HISTORICAL_PRICE"],
    deposit: null,
    bookingStatus: ["BOOKING_OPEN"],
    targetDate: "Ax-5：NET 2027-01",
    dateConfidence: "confirmed",
    training: "约 700–1,000 小时，跨度约 10 个月（含健康安全/ISS系统/发射场操作/Dragon流程/科研载荷/任务运营）",
    medicalRequirements: "系统性长周期训练与健康评估",
    technicalMaturity: "已完成 Ax-1/2/3/4，Ax-5 已进入 NASA 正式规划",
    crewedFlightHistory: "已执行 4 次 ISS Private Astronaut Mission",
    mainRisks: ["价格询价制，个人很难直接购买", "客户结构越来越偏向国家/机构/科研", "不是在线购票模式"],
    badges: ["FLIGHT_PROVEN", "BOOKING_OPEN", "PRICE_UNDISCLOSED"],
    budgetTier: "10m-usd-plus",
    sources: [
      { label: "NASA Ax-5 selected", url: "https://www.nasa.gov/news-release/nasa-selects-axiom-space-for-fifth-private-mission-to-space-station/" },
      { label: "NASA Private Astronaut Missions", url: "https://www.nasa.gov/humans-in-space/private-astronaut-missions/" },
      { label: "Axiom Ax-1 training", url: "https://www.axiomspace.com/missions/ax1" },
      { label: "Axiom Ax-1 crew release", url: "https://www.axiomspace.com/release/ax1-crew" },
      { label: "Space.com Ax-1 $55M reference", url: "https://www.space.com/spacex-axiom-space-ax-3-international-space-station-launch-date" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "spacex-dragon-custom",
    provider: "SpaceX",
    vehicle: "Crew Dragon（定制轨道任务）",
    experienceType: "orbital",
    altitudeKm: "近地轨道（依任务而定）",
    crossesKarmanLine: true,
    flightDuration: "数天（依任务而定）",
    weightlessness: "持续",
    price: "无公开标准消费者票价，报价制/商业合同",
    priceStatus: ["PRICE_UNDISCLOSED"],
    deposit: null,
    bookingStatus: ["BOOKING_OPEN"],
    targetDate: "任务制，无固定档期",
    dateConfidence: "unclear",
    training: "依任务而定（历史任务含科研/影像/太空行走等专项训练）",
    medicalRequirements: "依任务而定",
    technicalMaturity: "Crew Dragon 近地轨道已成熟；Starship 月球/深空载人尚不成熟",
    crewedFlightHistory: "Inspiration4 / Polaris Dawn / Fram2 等已证明私人自由飞行任务可行",
    mainRisks: ["不是标准零售产品，需整体任务定制", "价格不公开，容易被误导性引用固定票价"],
    badges: ["FLIGHT_PROVEN", "PRICE_UNDISCLOSED"],
    budgetTier: "10m-usd-plus",
    sources: [
      { label: "SpaceX Human Spaceflight", url: "https://new.spacex.com/humanspaceflight" },
      { label: "Reuters Fram2", url: "https://www.reuters.com/science/private-spacex-crew-set-launch-novel-polar-orbit-around-earth-2025-03-31/" },
      { label: "Reuters Polaris Dawn", url: "https://www.reuters.com/technology/space/spacex-polaris-crew-poised-attempt-first-private-spacewalk-2024-09-11/" },
      { label: "SpaceX Moon inquiry", url: "https://new.spacex.com/humanspaceflight/moon" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "vast",
    provider: "Vast + SpaceX",
    vehicle: "Dragon → ISS / Haven-1",
    experienceType: "station",
    altitudeKm: "约 425 km（Haven-1）/ ISS 轨道",
    crossesKarmanLine: true,
    flightDuration: "约 2 周",
    weightlessness: "持续",
    price: "未公开，询价制",
    priceStatus: ["PRICE_UNDISCLOSED"],
    deposit: null,
    bookingStatus: ["BOOKING_OPEN"],
    targetDate: "ISS 任务 NET summer 2027；Haven-1 目标 2027 发射",
    dateConfidence: "company-target",
    training: "未公开具体标准（依任务而定）",
    medicalRequirements: "未公开具体标准",
    technicalMaturity: "Dragon 运输已成熟；Haven-1 站体仍在开发，尚未完成首次载人任务",
    crewedFlightHistory: "NASA 已选择 Vast 执行第六次 ISS Private Astronaut Mission",
    mainRisks: ["Haven-1 站体尚未验证载人任务", "需区分 Dragon 运输成熟度 与 Haven-1 站体成熟度"],
    badges: ["COMPANY_TARGET", "UNDER_DEVELOPMENT", "PRICE_UNDISCLOSED"],
    budgetTier: "10m-usd-plus",
    sources: [
      { label: "Vast Haven-1", url: "https://www.vastspace.com/haven-1" },
      { label: "Create Your Mission", url: "https://www.vastspace.com/create-your-mission" },
      { label: "Private Astronaut Mission", url: "https://www.vastspace.com/private-astronaut-mission" },
      { label: "NASA PAM-6 selection", url: "https://www.nasa.gov/news-release/nasa-selects-vast-for-sixth-private-mission-to-space-station/" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "voyager-technologies",
    provider: "Voyager Technologies",
    vehicle: "VOYG-1 / ISS PAM-7",
    experienceType: "station",
    altitudeKm: "ISS 轨道",
    crossesKarmanLine: true,
    flightDuration: "未公开",
    weightlessness: "持续",
    price: "未公开，无个人票务系统",
    priceStatus: ["PRICE_UNDISCLOSED"],
    deposit: null,
    bookingStatus: ["UNDER_DEVELOPMENT"],
    targetDate: "NET 2028",
    dateConfidence: "company-target",
    training: "未公开，crew 需 NASA 与国际空间站伙伴审核",
    medicalRequirements: "未公开",
    technicalMaturity: "已进入 NASA 正式私人载人任务供应体系，尚无个人消费者购买通道",
    crewedFlightHistory: "无（NASA 第七次 ISS Private Astronaut Mission 供应商）",
    mainRisks: ["无公开标准票价", "没有成熟的个人票务系统", "更适合作为 2028+ watch list"],
    badges: ["UNDER_DEVELOPMENT", "PRICE_UNDISCLOSED"],
    budgetTier: "10m-usd-plus",
    sources: [
      { label: "NASA Voyager PAM-7", url: "https://www.nasa.gov/news-release/nasa-selects-voyager-for-seventh-private-mission-to-space-station/" },
      { label: "NASA Private Astronaut Missions", url: "https://www.nasa.gov/humans-in-space/private-astronaut-missions/" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "sera",
    provider: "SERA (Space Exploration & Research Agency)",
    vehicle: "Blue Origin New Shepard（选拔席位）",
    experienceType: "suborbital",
    altitudeKm: "100+ km（依赖 Blue Origin）",
    crossesKarmanLine: true,
    flightDuration: "约 11 分钟（同 New Shepard）",
    weightlessness: "数分钟",
    price: "不是传统买票；通过选拔/社区投票获得席位",
    priceStatus: ["SPONSORED"],
    deposit: null,
    bookingStatus: ["BOOKING_OPEN"],
    targetDate: "受 Blue Origin 停飞影响，时间不确定",
    dateConfidence: "unclear",
    training: "需满足 Blue Origin 实际飞行要求",
    medicalRequirements: "依 Blue Origin 标准",
    technicalMaturity: "已预留 6 个未来 New Shepard 席位，此前已成功送出 Victor Hespanha (NS-21)",
    crewedFlightHistory: "有已完成案例（Victor Hespanha）",
    mainRisks: ["依赖 Blue Origin New Shepard 复飞", "选拔制，非确定购买"],
    badges: ["SPONSORED", "CURRENTLY_PAUSED"],
    budgetTier: "sponsored",
    sources: [
      { label: "SERA Registration", url: "https://www.sera.space/registration" },
      { label: "SERA astronaut selection", url: "https://www.sera.space/astronauts" },
      { label: "SERA Blue Origin partnership", url: "https://sera.space/pressrelease/articles/blueorigin" },
      { label: "Blue Origin pause", url: "https://www.blueorigin.com/zh-HK/news/new-shepard-to-pause-flights" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "space-for-humanity",
    provider: "Space for Humanity",
    vehicle: "赞助 Citizen Astronaut（依承运商而定）",
    experienceType: "suborbital",
    altitudeKm: "取决于承运商",
    crossesKarmanLine: "target",
    flightDuration: "取决于承运商",
    weightlessness: "取决于承运商",
    price: "获选者由项目赞助（含票价/训练/travel/住宿等）",
    priceStatus: ["SPONSORED"],
    deposit: null,
    bookingStatus: ["APPLICATIONS_CLOSED"],
    targetDate: "当前申请关闭，未公布下一批时间",
    dateConfidence: "unclear",
    training: "依赖最终承运商标准",
    medicalRequirements: "依赖最终承运商标准",
    technicalMaturity: "非营利选拔项目，历史上已送出入选者",
    crewedFlightHistory: "有历史案例",
    mainRisks: ["当前申请关闭", "竞争极大，选拔标准偏重领导力/社会影响力而非付费能力"],
    badges: ["SPONSORED", "APPLICATIONS_CLOSED"],
    budgetTier: "sponsored",
    sources: [
      { label: "Citizen Astronaut application", url: "https://spaceforhumanity.org/apply" },
      { label: "Space for Humanity 官网", url: "https://spaceforhumanity.org/" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "space-adventures",
    provider: "Space Adventures",
    vehicle: "历史 Soyuz / 私人 ISS 中介",
    experienceType: "station",
    altitudeKm: "ISS 轨道（历史任务）",
    crossesKarmanLine: true,
    flightDuration: "历史任务约 12 天（前泽友作案例）",
    weightlessness: "持续",
    price: "当前无清晰公开标准价",
    priceStatus: ["PRICE_UNDISCLOSED", "HISTORICAL_PRICE"],
    deposit: null,
    bookingStatus: ["WAITLIST"],
    targetDate: "官网存在过期页面（如 'Mission to ISS 2025'），不构成确定班期",
    dateConfidence: "unclear",
    training: "历史任务参照 Soyuz 训练标准",
    medicalRequirements: "历史任务参照标准",
    technicalMaturity: "历史上多次成功案例（Dennis Tito / Anousheh Ansari / Guy Laliberté / Yusaku Maezawa 等）",
    crewedFlightHistory: "已有丰富历史私人航天中介记录，但当前公开计划陈旧",
    mainRisks: ["网站信息存在过期内容", "不应仅凭官网旧页面当作确定现役航班", "建议直接询价确认最新情况"],
    badges: ["WAITLIST", "PRICE_UNDISCLOSED"],
    budgetTier: "10m-usd-plus",
    sources: [
      { label: "Maezawa ISS mission", url: "https://spaceadventures.com/mzmission/" },
      { label: "ISS guide", url: "https://spaceadventures.com/experiences/guide-to-space-station/" },
      { label: "过期 ISS 2025 页面", url: "https://spaceadventures.com/mission_to_iss_2025/" },
      { label: "私人 Dragon 概念", url: "https://spaceadventures.com/private-mission-available-on-the-spacex-dragon/" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "zephalto",
    provider: "Zephalto",
    vehicle: "平流层气球",
    experienceType: "near-space",
    altitudeKm: "25 km（未跨卡门线，非真正太空）",
    crossesKarmanLine: false,
    flightDuration: "约 6 小时（上升1.5h+顶部3h+下降1.5h）",
    weightlessness: "无",
    price: "€180,000/人",
    priceStatus: ["BOOKING_OPEN"],
    deposit: null,
    bookingStatus: ["WAITLIST"],
    targetDate: "已售首批窗口排到2027秋；下一批约2027-11起，延伸到2028",
    dateConfidence: "confirmed",
    training: "无需特殊专业训练，可正常乘坐商业飞机即可参加",
    medicalRequirements: "接近高端航空旅行标准，非火箭发射标准",
    technicalMaturity: "商业运营中的气球体验产品",
    crewedFlightHistory: "已有商业运营记录",
    mainRisks: ["不是真正意义的太空（未跨100km）", "无失重体验"],
    badges: ["NOT_ACTUAL_SPACE", "WAITLIST"],
    budgetTier: "500k-1m-usd",
    sources: [
      { label: "Zephalto FAQ", url: "https://www.zephalto.com/faq" },
      { label: "Zephalto Terms", url: "https://www.zephalto.com/legals/cgv" },
      { label: "Zephalto 对比说明", url: "https://www.zephalto.com/article-page/how-to-get-to-space-when-youre-not-an-astronaut" }
    ],
    lastChecked: "2026-09-16"
  },
  {
    id: "halo-space",
    provider: "HALO Space",
    vehicle: "平流层气球/舱体",
    experienceType: "near-space",
    altitudeKm: "约 35 km（未跨卡门线，非真正太空）",
    crossesKarmanLine: false,
    flightDuration: "约 6 小时",
    weightlessness: "无",
    price: "€150,000 / $165,000",
    priceStatus: ["WAITLIST"],
    deposit: null,
    bookingStatus: ["WAITLIST"],
    targetDate: "尚不能正式 book flight，可加入 waitlist（无需订金）",
    dateConfidence: "unclear",
    training: "无需复杂航天训练",
    medicalRequirements: "未公开具体标准",
    technicalMaturity: "FAQ 中的商业首飞目标（2026）尚需观察是否已开始运营",
    crewedFlightHistory: "未确认已开始商业运营",
    mainRisks: ["不是真正意义的太空（未跨100km）", "无失重体验", "商业运营开始时间待确认"],
    badges: ["NOT_ACTUAL_SPACE", "WAITLIST"],
    budgetTier: "500k-1m-usd",
    sources: [
      { label: "HALO Space FAQ", url: "https://www.halospaceflight.com/faq" },
      { label: "HALO Ground/Flight Experience", url: "https://www.halospaceflight.com/ground-experience" }
    ],
    lastChecked: "2026-09-16"
  }
]
```

### 5.3 Badge 展示文案（中英对照，供 UI 使用）

```js
export const BADGE_LABELS = {
  FLIGHT_PROVEN: { text: "已验证载人飞行", color: "green" },
  CURRENTLY_PAUSED: { text: "当前暂停", color: "red" },
  BOOKING_OPEN: { text: "可预订/询价", color: "cyan" },
  WAITLIST: { text: "等待名单", color: "amber" },
  SOLD_OUT: { text: "已售罄", color: "red" },
  COMPANY_TARGET: { text: "公司目标（非确定）", color: "amber" },
  PRICE_UNDISCLOSED: { text: "价格未公开", color: "violet" },
  HISTORICAL_PRICE: { text: "历史价格参考", color: "violet" },
  PRE_SALE: { text: "预售中", color: "cyan" },
  UNDER_DEVELOPMENT: { text: "开发阶段", color: "amber" },
  SPONSORED: { text: "赞助/选拔制", color: "magenta" },
  APPLICATIONS_CLOSED: { text: "申请已关闭", color: "red" },
  NOT_ACTUAL_SPACE: { text: "非真正太空", color: "muted" }
}
```

## 6. 筛选器逻辑

```js
const FILTERS = {
  experience: ['near-space', 'suborbital', 'orbital', 'station'],
  budget: ['sponsored', 'lt-3m-cny', '500k-1m-usd', '1m-10m-usd', '10m-usd-plus'],
  status: Object.keys(BADGE_LABELS), // 用户可多选任意 badge 进行筛选
  boundary: ['crosses', 'not-crosses', 'target'] // 对应 crossesKarmanLine 的 true/false/'target'
}

// 渲染逻辑：多个筛选维度之间是 AND，同一维度内多选是 OR
function filterOptions(options, activeFilters) {
  return options.filter(opt => {
    if (activeFilters.experience.length && !activeFilters.experience.includes(opt.experienceType)) return false
    if (activeFilters.budget.length && !activeFilters.budget.includes(opt.budgetTier)) return false
    if (activeFilters.status.length && !opt.badges.some(b => activeFilters.status.includes(b))) return false
    if (activeFilters.boundary.length) {
      const boundaryKey = opt.crossesKarmanLine === true ? 'crosses'
        : opt.crossesKarmanLine === false ? 'not-crosses' : 'target'
      if (!activeFilters.boundary.includes(boundaryKey)) return false
    }
    return true
  })
}
```

## 7. 页面结构（HTML 骨架示意）

```html
<body>
  <canvas class="starfield"></canvas>

  <header class="hero">
    <p class="hero-eyebrow">Last updated: 16 Sep 2026</p>
    <h1>普通人如何上太空？</h1>
    <p class="hero-subtitle">
      从 ¥1.5M 的未来亚轨道船票，到 $50M+ 的轨道任务——
      2026 年所有可信、正在销售或正在开发中的真实路径。
    </p>
  </header>

  <section class="overview-table"><!-- 对应源文档第4节总览表 --></section>

  <section class="filters"><!-- Experience / Budget / Status / Boundary --></section>

  <section class="card-grid"><!-- SPACE_OPTIONS.map(renderCard) --></section>

  <section class="budget-routes"><!-- 源文档第22节：路线 A~E --></section>

  <section class="goal-routes"><!-- 源文档第26节：Goal A~E --></section>

  <section class="conclusion"><!-- 源文档第29节结论 --></section>

  <footer class="sources-index"><!-- 源文档第30节核心来源索引 --></footer>
</body>
```

## 8. 内容补充（非卡片数据，静态文本区块）

以下内容直接照抄源文档对应章节即可，不需要结构化：

- **总览表**（第4节）：可直接渲染为一个可横向滚动的 `<table>`，作为卡片网格上方的"速览"。
- **按预算分类**（第22节）：路线 A（不靠财富）/ B（¥1M–3M）/ C（$750k+）/ D（Blue Origin）/ E（数千万美元级）。
- **按目标分类**（第26节）：Goal A~E，帮助用户按"我想要什么"而不是"哪家最好"做选择。
- **训练与健康要求**（第23节）、**商业航天 ≠ 民航安全认证**（第24节）：建议做成两个可展开的 `<details>` 区块，不占首屏空间但保留重要免责信息。
- **购买前必须调查的18个问题**（第25节）：建议做成一个可下载/复制的 checklist 区块。
- **最终结论**（第29节）+ **核心来源索引**（第30节）：放在页面底部。

## 9. 免责声明（必须保留）

页面底部必须保留源文档开头的重要说明，明确区分：

> 已实际载人飞行 / 正在销售但未来才能飞 / 公司公布的目标日期 / 历史成交价格 / 当前官方价格 / 近太空但未真正进入太空

不能把公司目标渲染成确定事实。

## 10. 部署（新仓库）

1. 新建仓库（建议命名如 `to-space` 或类似语义化名称）。
2. 若选方案 A（纯静态）：仓库根目录直接放 `index.html/style.css/data.js/app.js`，GitHub 仓库 Settings → Pages → Source 选 `main` 分支 `/`（root），即可获得 `https://<用户名>.github.io/<仓库名>/`。由于是独立仓库，天然获得独立的顶层路径。
3. 若选方案 B（Vite）：`vite.config.ts` 设置 `base: '/<仓库名>/'`（同 quad-daily 的写法），走 GitHub Actions 构建部署，可直接参考 quad-daily 现有的 `.github/workflows/deploy.yml` 复制过去改 repo 名。
4. 数据更新时，只需要更新 `data.js` 里的字段和 `lastChecked`，不涉及页面结构改动。

---

（本文档由 Claude Code 根据 `ordinary-person-spaceflight-options-2026.md` 整理生成，供新仓库实现参考。）
