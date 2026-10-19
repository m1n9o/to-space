import { useAtlas } from '../app/atlasContext.ts'
import { altitudeScale, type AltitudeMark } from '../domain/altitude.ts'
import type { Project } from '../domain/model.ts'

const PREFIX: Record<AltitudeMark['qualifier'], string> = {
  EXACT: '',
  APPROX: '约 ',
  MIN: '≥',
  MAX: '≤',
}

const kmText = (m: AltitudeMark) => `${PREFIX[m.qualifier]}${m.km} km`

/** 飞行高度对数标尺；没有以 km 为单位的高度记录时不渲染 */
export function AltitudeRuler({ project }: { project: Project }) {
  const { atlas, asOf } = useAtlas()
  const scale = altitudeScale(project, atlas, asOf)
  if (!scale) return null
  const { current, karman, references, belowKarman } = scale
  const summary = `高度标尺：本项目${kmText(current)}，${
    belowKarman ? '低于' : '达到或高于'
  } 100 km 卡门线`

  return (
    <figure className="altitude" role="img" aria-label={summary}>
      <div className="altitude-track" aria-hidden="true">
        <div
          className="altitude-fill"
          style={{ width: `${current.position}%` }}
        />
        {references.map((r) => (
          <div
            key={r.km}
            className="altitude-ref"
            style={{ left: `${r.position}%` }}
          >
            <span className="altitude-ref-text">
              {kmText(r)}
              <br />
              {r.label}
            </span>
          </div>
        ))}
        <div
          className="altitude-karman"
          style={{ left: `${karman.position}%` }}
        >
          <span>100 km 卡门线</span>
        </div>
        <div
          className="altitude-current"
          style={{ left: `${current.position}%` }}
        >
          <span>本项目 {kmText(current)}</span>
        </div>
      </div>
      <figcaption className="small text-muted">
        对数刻度（10–500
        km）。本项目数据来自“飞行高度”记录；参照点为其他项目当前的高度记录。
      </figcaption>
    </figure>
  )
}
