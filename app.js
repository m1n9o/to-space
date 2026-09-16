import {
  SPACE_OPTIONS,
  BADGE_LABELS,
  EXPERIENCE_LABELS,
  BUDGET_LABELS,
  BOUNDARY_LABELS
} from "./data.js"

// ---------- Starfield ----------

function initStarfield() {
  const canvas = document.querySelector(".starfield")
  const ctx = canvas.getContext("2d")
  let stars = []

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const count = Math.min(300, Math.floor((canvas.width * canvas.height) / 6000))
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
      period: 3 + Math.random() * 3
    }))
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#eef1ff"
    for (const star of stars) {
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((t / 1000) * (Math.PI * 2 / star.period) + star.phase))
      ctx.globalAlpha = twinkle
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    requestAnimationFrame(draw)
  }

  window.addEventListener("resize", resize)
  resize()
  requestAnimationFrame(draw)
}

// ---------- Filters ----------

const FILTER_DEFS = [
  { key: "experience", title: "按体验类型", options: Object.entries(EXPERIENCE_LABELS) },
  { key: "budget", title: "按预算", options: Object.entries(BUDGET_LABELS) },
  { key: "status", title: "按状态", options: Object.entries(BADGE_LABELS).map(([k, v]) => [k, v.text]) },
  { key: "boundary", title: "按卡门线", options: Object.entries(BOUNDARY_LABELS) }
]

const activeFilters = {
  experience: [],
  budget: [],
  status: [],
  boundary: []
}

function filterOptions(options, filters) {
  return options.filter((opt) => {
    if (filters.experience.length && !filters.experience.includes(opt.experienceType)) return false
    if (filters.budget.length && !filters.budget.includes(opt.budgetTier)) return false
    if (filters.status.length && !opt.badges.some((b) => filters.status.includes(b))) return false
    if (filters.boundary.length) {
      const boundaryKey =
        opt.crossesKarmanLine === true ? "crosses" : opt.crossesKarmanLine === false ? "not-crosses" : "target"
      if (!filters.boundary.includes(boundaryKey)) return false
    }
    return true
  })
}

function toggleFilter(dimension, value) {
  const list = activeFilters[dimension]
  const idx = list.indexOf(value)
  if (idx === -1) list.push(value)
  else list.splice(idx, 1)
  renderFilterChips()
  renderGrid()
}

function clearFilters() {
  for (const key of Object.keys(activeFilters)) activeFilters[key].length = 0
  renderFilterChips()
  renderGrid()
}

function renderFilters() {
  const root = document.querySelector(".filters-groups")
  root.innerHTML = FILTER_DEFS.map(
    (def) => `
    <div class="filter-group" data-dimension="${def.key}">
      <h3 class="filter-group__title">${def.title}</h3>
      <div class="filter-group__chips">
        ${def.options
          .map(
            ([value, label]) => `
          <button type="button" class="chip" data-dimension="${def.key}" data-value="${value}">${label}</button>
        `
          )
          .join("")}
      </div>
    </div>
  `
  ).join("")

  root.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleFilter(btn.dataset.dimension, btn.dataset.value)
    })
  })
}

function renderFilterChips() {
  document.querySelectorAll(".chip").forEach((btn) => {
    const isActive = activeFilters[btn.dataset.dimension].includes(btn.dataset.value)
    btn.classList.toggle("chip--active", isActive)
  })
  const hasAny = Object.values(activeFilters).some((list) => list.length)
  document.querySelector(".filters-clear").hidden = !hasAny
}

// ---------- Cards ----------

function renderBadge(key) {
  const badge = BADGE_LABELS[key]
  if (!badge) return ""
  return `<span class="badge badge--${badge.color}">${badge.text}</span>`
}

function renderSources(sources) {
  return sources
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`)
    .join("")
}

function renderCard(opt) {
  const boundaryText =
    opt.crossesKarmanLine === true
      ? "✅ 已验证跨越"
      : opt.crossesKarmanLine === false
        ? "❌ 不跨越"
        : "🎯 目标跨越（未验证）"

  return `
    <article class="card card--${opt.experienceType}">
      <div class="card__stripe"></div>
      <div class="card__body">
        <header class="card__header">
          <p class="card__provider">${opt.provider}</p>
          <h3 class="card__vehicle">${opt.vehicle}</h3>
          <div class="card__badges">${opt.badges.map(renderBadge).join("")}</div>
        </header>

        <dl class="card__facts">
          <div class="fact"><dt>体验类型</dt><dd>${EXPERIENCE_LABELS[opt.experienceType]}</dd></div>
          <div class="fact"><dt>高度</dt><dd>${opt.altitudeKm}</dd></div>
          <div class="fact"><dt>跨卡门线？</dt><dd>${boundaryText}</dd></div>
          <div class="fact"><dt>飞行时长</dt><dd>${opt.flightDuration}</dd></div>
          <div class="fact"><dt>失重时间</dt><dd>${opt.weightlessness}</dd></div>
          <div class="fact fact--wide"><dt>价格</dt><dd>${opt.price}</dd></div>
          <div class="fact fact--wide"><dt>价格状态</dt><dd>${opt.priceStatus.map(renderBadge).join("")}</dd></div>
          <div class="fact"><dt>订金</dt><dd>${opt.deposit ?? "无 / 不适用"}</dd></div>
          <div class="fact"><dt>预订状态</dt><dd>${opt.bookingStatus.map(renderBadge).join("")}</dd></div>
          <div class="fact fact--wide"><dt>目标/预计时间</dt><dd>${opt.targetDate}</dd></div>
          <div class="fact fact--wide"><dt>训练</dt><dd>${opt.training}</dd></div>
          <div class="fact fact--wide"><dt>体检要求</dt><dd>${opt.medicalRequirements}</dd></div>
          <div class="fact fact--wide"><dt>技术成熟度</dt><dd>${opt.technicalMaturity}</dd></div>
          <div class="fact fact--wide"><dt>载人飞行历史</dt><dd>${opt.crewedFlightHistory}</dd></div>
        </dl>

        <div class="card__risks">
          <h4>主要风险 / 不确定性</h4>
          <ul>${opt.mainRisks.map((r) => `<li>${r}</li>`).join("")}</ul>
        </div>

        <footer class="card__footer">
          <div class="card__sources">${renderSources(opt.sources)}</div>
          <p class="card__checked">Last checked: ${opt.lastChecked}</p>
        </footer>
      </div>
    </article>
  `
}

function renderGrid() {
  const grid = document.querySelector(".card-grid")
  const filtered = filterOptions(SPACE_OPTIONS, activeFilters)
  document.querySelector(".card-grid__count").textContent = `${filtered.length} / ${SPACE_OPTIONS.length} 个方案`
  grid.innerHTML = filtered.length
    ? filtered.map(renderCard).join("")
    : `<p class="card-grid__empty">没有符合当前筛选条件的方案，试试清空筛选器。</p>`
}

// ---------- Mobile filter drawer ----------

function initFilterDrawer() {
  const toggle = document.querySelector(".filters-toggle")
  const panel = document.querySelector(".filters-groups")
  toggle.addEventListener("click", () => {
    panel.classList.toggle("filters-groups--open")
    toggle.setAttribute("aria-expanded", panel.classList.contains("filters-groups--open"))
  })
}

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", () => {
  initStarfield()
  renderFilters()
  renderFilterChips()
  renderGrid()
  initFilterDrawer()
  document.querySelector(".filters-clear").addEventListener("click", clearFilters)
})
