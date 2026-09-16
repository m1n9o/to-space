import { Badge } from './Badge'
import { EXPERIENCE_LABELS, type SpaceOption } from '../data/spaceOptions'

interface OptionCardProps {
  option: SpaceOption
}

export function OptionCard({ option }: OptionCardProps) {
  const boundaryText =
    option.crossesKarmanLine === true
      ? '✅ 已验证跨越'
      : option.crossesKarmanLine === false
        ? '❌ 不跨越'
        : '🎯 目标跨越（未验证）'

  return (
    <article className={`card card--${option.experienceType}`}>
      <div className="card__stripe" />
      <div className="card__body">
        <header className="card__header">
          <p className="card__provider">{option.provider}</p>
          <h3 className="card__vehicle">{option.vehicle}</h3>
          <div className="card__badges">
            {option.badges.map((statusKey) => (
              <Badge statusKey={statusKey} key={statusKey} />
            ))}
          </div>
        </header>

        <dl className="card__facts">
          <div className="fact">
            <dt>国家/地区</dt>
            <dd>{option.country}</dd>
          </div>
          <div className="fact">
            <dt>体验类型</dt>
            <dd>{EXPERIENCE_LABELS[option.experienceType]}</dd>
          </div>
          <div className="fact">
            <dt>高度</dt>
            <dd>{option.altitudeKm}</dd>
          </div>
          <div className="fact">
            <dt>跨卡门线？</dt>
            <dd>{boundaryText}</dd>
          </div>
          <div className="fact">
            <dt>飞行时长</dt>
            <dd>{option.flightDuration}</dd>
          </div>
          <div className="fact">
            <dt>失重时间</dt>
            <dd>{option.weightlessness}</dd>
          </div>
          <div className="fact fact--wide">
            <dt>价格</dt>
            <dd>{option.price}</dd>
          </div>
          <div className="fact fact--wide">
            <dt>价格状态</dt>
            <dd>
              {option.priceStatus.map((statusKey) => (
                <Badge statusKey={statusKey} key={statusKey} />
              ))}
            </dd>
          </div>
          <div className="fact">
            <dt>订金</dt>
            <dd>{option.deposit ?? '无 / 不适用'}</dd>
          </div>
          <div className="fact">
            <dt>预订状态</dt>
            <dd>
              {option.bookingStatus.map((statusKey) => (
                <Badge statusKey={statusKey} key={statusKey} />
              ))}
            </dd>
          </div>
          <div className="fact fact--wide">
            <dt>目标/预计时间</dt>
            <dd>{option.targetDate}</dd>
          </div>
          <div className="fact fact--wide">
            <dt>训练</dt>
            <dd>{option.training}</dd>
          </div>
          <div className="fact fact--wide">
            <dt>体检要求</dt>
            <dd>{option.medicalRequirements}</dd>
          </div>
          <div className="fact fact--wide">
            <dt>技术成熟度</dt>
            <dd>{option.technicalMaturity}</dd>
          </div>
          <div className="fact fact--wide">
            <dt>载人飞行历史</dt>
            <dd>{option.crewedFlightHistory}</dd>
          </div>
        </dl>

        <div className="card__risks">
          <h4>主要风险 / 不确定性</h4>
          <ul>
            {option.mainRisks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>

        <footer className="card__footer">
          <div className="card__sources">
            {option.sources.map((source) => (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                key={source.url}
              >
                {source.label}
              </a>
            ))}
          </div>
          <p className="card__checked">Last checked: {option.lastChecked}</p>
        </footer>
      </div>
    </article>
  )
}
