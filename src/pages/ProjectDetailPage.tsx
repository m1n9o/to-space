import { Link, useParams } from 'react-router'
import { useAtlas, useProject } from '../app/atlasContext.ts'
import { CheckedAt } from '../components/CheckedAt.tsx'
import { AltitudeRuler } from '../components/AltitudeRuler.tsx'
import { FactBlock } from '../components/FactBlock.tsx'
import { MissionIcon } from '../components/icons.tsx'
import { SourceLink, SourceRefs } from '../components/SourceLink.tsx'
import { StatusBadge, Tag } from '../components/StatusBadge.tsx'
import { formatPartialDate } from '../domain/dates.ts'
import {
  ASSESSMENT_KINDS,
  ASSESSMENT_KIND_LABELS,
  COMMERCIAL_AVAILABILITY_LABELS,
  CUSTOMER_SEGMENT_LABELS,
  DEVELOPMENT_STAGE_LABELS,
  EVENT_TYPE_LABELS,
  FACT_TYPE_LABELS,
  MISSION_TYPE_LABELS,
  PARTICIPATION_PATHWAY_LABELS,
} from '../domain/enums.ts'
import { effectiveStatus, projectLastVerifiedAt } from '../domain/facts.ts'
import { projectFreshness } from '../domain/freshness.ts'
import type { Project } from '../domain/model.ts'
import { projectTimeline } from '../domain/timeline.ts'
import { useCompareSelection } from '../features/compare/useCompareSelection.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="detail-section" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  )
}

function ExternalLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

function Freshness({ project }: { project: Project }) {
  const { atlas, asOf } = useAtlas()
  const report = projectFreshness(project, atlas, asOf)
  if (report.level === 'OK') return null
  return (
    <div
      className={`notice ${report.level === 'CRITICAL' ? 'notice-bad' : 'notice-warn'}`}
      role="note"
    >
      <strong>
        {report.level === 'CRITICAL'
          ? '部分数据可能已严重过期'
          : '部分数据需要复核'}
      </strong>
      <ul>
        {report.issues.map((issue, i) => (
          <li key={i}>{issue.message}</li>
        ))}
      </ul>
    </div>
  )
}

function Timeline({ project }: { project: Project }) {
  const { atlas, asOf } = useAtlas()
  const { events, plans } = projectTimeline(project, asOf)
  return (
    <>
      {plans.length > 0 && (
        <div className="plans">
          <h3>计划中（尚未发生）</h3>
          <ul>
            {plans.map((fact) => (
              <li key={fact.id}>
                目标：
                {fact.value.kind === 'date'
                  ? formatPartialDate(fact.value.date)
                  : '未公布'}{' '}
                <StatusBadge status={effectiveStatus(fact)} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {events.length === 0 ? (
        <p className="text-muted">暂未收录事件。</p>
      ) : (
        <ol className="timeline">
          {events.map((e) => (
            <li key={e.id} className="timeline-item">
              <div className="timeline-date">
                {e.occurredAt ? (
                  <>
                    <span className="date-kind">发生</span>{' '}
                    {formatPartialDate(e.occurredAt)}
                  </>
                ) : (
                  <>
                    <span className="date-kind">公告</span>{' '}
                    {formatPartialDate(e.announcedAt!)}
                  </>
                )}
                {e.occurredAt &&
                  e.announcedAt &&
                  e.announcedAt !== e.occurredAt && (
                    <span className="text-muted">
                      （公告 {formatPartialDate(e.announcedAt)}）
                    </span>
                  )}
              </div>
              <div className="timeline-body">
                <div className="timeline-head">
                  <Tag>{EVENT_TYPE_LABELS[e.eventType]}</Tag>
                  <StatusBadge status={e.verificationStatus} />
                </div>
                <h3>{e.title}</h3>
                {e.summary && <p>{e.summary}</p>}
                {(e.previousValue || e.newValue) && (
                  <p className="change">
                    {e.previousValue && <span>原计划：{e.previousValue}</span>}
                    {e.newValue && <span>调整为：{e.newValue}</span>}
                  </p>
                )}
                {e.businessImpact && (
                  <p className="impact">
                    <strong>对潜在参与者的影响：</strong>
                    {e.businessImpact}
                  </p>
                )}
                <SourceRefs ids={e.sourceIds} sources={atlas.sources} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  )
}

function Verifications({ project }: { project: Project }) {
  const rows = [
    ...(project.classificationVerifiedAt
      ? [
          {
            at: project.classificationVerifiedAt,
            what: '项目阶段与商业状态',
            status: undefined,
            basis: '分类依据见来源',
            by: '',
          },
        ]
      : []),
    ...project.facts.flatMap((f) =>
      f.verifications.map((v) => ({
        at: v.at,
        what: FACT_TYPE_LABELS[f.factType],
        status: v.status,
        basis: v.basis,
        by: v.by,
      })),
    ),
  ].sort((a, b) => (a.at < b.at ? 1 : -1))
  if (rows.length === 0) return <p className="text-muted">暂无核实记录。</p>
  return (
    <table className="simple-table">
      <thead>
        <tr>
          <th scope="col">日期</th>
          <th scope="col">对象</th>
          <th scope="col">结论</th>
          <th scope="col">依据</th>
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 20).map((r, i) => (
          <tr key={i}>
            <td>{r.at}</td>
            <td>{r.what}</td>
            <td>{r.status ? <StatusBadge status={r.status} /> : '—'}</td>
            <td>
              {r.basis}
              {r.by && <span className="text-muted">（{r.by}）</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ProjectDetailPage() {
  const { slug } = useParams()
  const project = useProject(slug)
  const { atlas, asOf } = useAtlas()
  const compare = useCompareSelection()
  if (!project) return <NotFoundPage />

  const referencedSources = [
    ...new Set([
      ...project.classificationSourceIds,
      ...project.facts.flatMap((f) => [
        ...f.sourceIds,
        ...f.verifications.flatMap((v) => v.sourceIds),
      ]),
      ...project.events.flatMap((e) => e.sourceIds),
      ...project.assessments.flatMap((a) => a.sourceIds),
    ]),
  ]
    .map((id) => atlas.sources[id])
    .filter(Boolean)
  const dependsOn = project.dependsOnProjectIds
    .map((id) => atlas.projects.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p))
  const inCompare = compare.ids.includes(project.slug)

  return (
    <article className="detail">
      <nav className="breadcrumb" aria-label="面包屑">
        <Link to="/">项目</Link> / {project.name}
      </nav>
      <header className="detail-header">
        <div>
          <h1>{project.name}</h1>
          <p className="detail-operator">
            {project.operatorName} · {project.countryOrRegion} ·{' '}
            <span className="mission">
              <MissionIcon type={project.missionType} />
              {MISSION_TYPE_LABELS[project.missionType]}
            </span>
          </p>
        </div>
        <div className="detail-actions">
          <CheckedAt date={projectLastVerifiedAt(project, asOf)} />
          <button
            type="button"
            className="button"
            disabled={!inCompare && compare.isFull}
            onClick={() => compare.toggle(project.slug)}
          >
            {inCompare ? '移出对比' : '加入对比'}
          </button>
        </div>
      </header>

      <Freshness project={project} />

      <Section id="overview" title="1. 项目概览">
        <p>{project.description}</p>
        <dl className="kv">
          <dt>飞行类型</dt>
          <dd>{MISSION_TYPE_LABELS[project.missionType]}</dd>
          <dt>参与方式</dt>
          <dd>
            {project.participationPathways
              .map((p) => PARTICIPATION_PATHWAY_LABELS[p])
              .join('、')}
          </dd>
          <dt>目标客户</dt>
          <dd>
            {project.targetCustomerSegments.length
              ? project.targetCustomerSegments
                  .map((s) => CUSTOMER_SEGMENT_LABELS[s])
                  .join('、')
              : '未知'}
          </dd>
          {dependsOn.length > 0 && (
            <>
              <dt>依赖的飞行项目</dt>
              <dd>
                {dependsOn.map((p) => (
                  <Link key={p.id} to={`/projects/${p.slug}`}>
                    {p.name}
                  </Link>
                ))}
              </dd>
            </>
          )}
          <dt>官方网站</dt>
          <dd>
            {project.officialWebsiteUrl ? (
              <ExternalLink href={project.officialWebsiteUrl}>
                {project.officialWebsiteUrl}
              </ExternalLink>
            ) : (
              '官方来源尚未找到'
            )}
          </dd>
          <dt>购买/申请入口</dt>
          <dd>
            {project.officialBookingUrl ? (
              <>
                <ExternalLink href={project.officialBookingUrl}>
                  {project.officialBookingUrl}
                </ExternalLink>
                <span className="text-muted">
                  （提交申请或登记不等于获得飞行资格）
                </span>
              </>
            ) : (
              '尚未确认公开购买渠道'
            )}
          </dd>
          <dt>联系渠道</dt>
          <dd>
            {project.officialContactUrl ? (
              <ExternalLink href={project.officialContactUrl}>
                {project.officialContactUrl}
              </ExternalLink>
            ) : (
              '未找到官方联系渠道'
            )}
          </dd>
        </dl>
      </Section>

      <Section id="experience" title="2. 飞行体验与参与方式">
        {project.experienceDescription && (
          <p>{project.experienceDescription}</p>
        )}
        <AltitudeRuler project={project} />
        <div className="fact-grid">
          <FactBlock project={project} type="ALTITUDE" />
          <FactBlock project={project} type="FLIGHT_DURATION" />
          <FactBlock project={project} type="WEIGHTLESSNESS_DURATION" />
        </div>
      </Section>

      <Section id="status" title="3. 当前阶段与商业可用性">
        <dl className="kv">
          <dt>研发/运营阶段</dt>
          <dd>{DEVELOPMENT_STAGE_LABELS[project.developmentStage]}</dd>
          <dt>商业参与状态</dt>
          <dd>
            {COMMERCIAL_AVAILABILITY_LABELS[project.commercialAvailability]}
          </dd>
          <dt>分类核实</dt>
          <dd>
            <CheckedAt date={project.classificationVerifiedAt} />
            <SourceRefs
              ids={project.classificationSourceIds}
              sources={atlas.sources}
            />
          </dd>
        </dl>
        <FactBlock project={project} type="TICKET_SALES_STATUS" />
      </Section>

      <Section id="price" title="4. 价格与费用">
        <div className="fact-grid">
          <FactBlock
            project={project}
            type="PUBLIC_PRICE"
            emptyText="暂无可靠公开价格"
          />
          <FactBlock
            project={project}
            type="DEPOSIT_AMOUNT"
            emptyText="未找到公开押金信息"
          />
        </div>
      </Section>

      <Section id="schedule" title="5. 时间表">
        <p className="text-muted">
          目标日期均为运营方计划，不代表已确认的班期；实际发生的飞行见时间线。
        </p>
        <FactBlock
          project={project}
          type="TARGET_FLIGHT_DATE"
          emptyText="没有公开的目标日期"
        />
        <FactBlock
          project={project}
          type="OTHER"
          title="其他计划与里程碑"
          emptyText="无"
        />
      </Section>

      <Section id="requirements" title="6. 资格要求与训练">
        <div className="fact-grid">
          <FactBlock project={project} type="ELIGIBILITY_REQUIREMENTS" />
          <FactBlock project={project} type="TRAINING_DURATION" />
          <FactBlock
            project={project}
            type="REFUND_POLICY"
            emptyText="未找到公开退款政策（不代表不可退款）"
          />
        </div>
      </Section>

      <Section id="risks" title="7. 主要风险与信息缺口">
        {project.assessments.length === 0 ? (
          <p className="text-muted">暂无编辑判断。</p>
        ) : (
          ASSESSMENT_KINDS.map((kind) => {
            const items = project.assessments.filter((a) => a.kind === kind)
            if (items.length === 0) return null
            return (
              <div key={kind} className="assessment-group">
                <h3>{ASSESSMENT_KIND_LABELS[kind]}</h3>
                <ul>
                  {items.map((a, i) => (
                    <li key={i}>
                      {a.text} <span className="text-muted">（{a.asOf}）</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })
        )}
        <p className="text-muted small">
          以上为编辑判断与建议，与事实记录分开维护。
        </p>
      </Section>

      <Section id="timeline" title="8. 项目历史时间线">
        <Timeline project={project} />
      </Section>

      <Section id="sources" title="9. 来源列表">
        {referencedSources.length === 0 ? (
          <p className="text-muted">暂无来源。</p>
        ) : (
          <ul className="source-list">
            {referencedSources.map((s) => (
              <li key={s.id}>
                <SourceLink source={s} />
                <span className="text-muted small"> 访问于 {s.accessedAt}</span>
                {s.excerptOrEvidence && (
                  <p className="excerpt">{s.excerptOrEvidence}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="verifications" title="10. 最近核实记录">
        <Verifications project={project} />
      </Section>
    </article>
  )
}
