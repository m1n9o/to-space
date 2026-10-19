import type { EvidenceStatus, MissionType } from '../domain/enums.ts'

// 线条图标：统一 24×24 视图、currentColor 描边。均为装饰性，旁边总有文字说明。

type IconProps = { className?: string }

function Svg({
  className = 'icon',
  children,
  strokeWidth = 1.75,
}: IconProps & { children: React.ReactNode; strokeWidth?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

const MISSION_PATHS: Record<MissionType, React.ReactNode> = {
  SUBORBITAL: (
    <>
      <path d="M2.5 20h19" />
      <path d="M5 20C7.5 5.5 16.5 5.5 19 20" strokeDasharray="2.2 2.4" />
      <circle cx="12" cy="9.2" r="1.7" fill="currentColor" stroke="none" />
    </>
  ),
  ORBITAL: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4.6" transform="rotate(-20 12 12)" />
      <circle cx="20.6" cy="8.6" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  SPACE_STATION_MISSION: (
    <>
      <rect x="9.5" y="7" width="5" height="10" rx="1.2" />
      <path d="M9.5 12H7.5M14.5 12h2" />
      <rect x="1.5" y="8" width="6" height="8" rx="0.6" />
      <rect x="16.5" y="8" width="6" height="8" rx="0.6" />
    </>
  ),
  NEAR_SPACE: (
    <>
      <path d="M12 2.5c-3.6 0-6 2.7-6 6 0 3 2.6 5.6 6 7.5 3.4-1.9 6-4.5 6-7.5 0-3.3-2.4-6-6-6z" />
      <path d="M9.6 15.2 10.6 19M14.4 15.2 13.4 19" />
      <rect x="10" y="19" width="4" height="2.6" rx="0.6" />
    </>
  ),
  OTHER: <circle cx="12" cy="12" r="8" />,
}

export function MissionIcon({
  type,
  className,
}: IconProps & { type: MissionType }) {
  return <Svg className={className}>{MISSION_PATHS[type]}</Svg>
}

const STATUS_PATHS: Record<EvidenceStatus, React.ReactNode> = {
  VERIFIED_OFFICIAL: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  CORROBORATED: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  REPORTED_UNCONFIRMED: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6" />
      <path d="M12 17h.01" />
    </>
  ),
  COMPANY_TARGET: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </>
  ),
  DISPUTED: (
    <>
      <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  OUTDATED: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  UNKNOWN: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6" />
      <path d="M12 17h.01" />
    </>
  ),
}

export function StatusIcon({ status }: { status: EvidenceStatus }) {
  return (
    <Svg className="icon icon-sm" strokeWidth={2}>
      {STATUS_PATHS[status]}
    </Svg>
  )
}

export function Logo() {
  return (
    <svg
      className="logo"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="16" r="15" fill="#1f5fbf" />
      <path
        d="M3 22c6-2.6 18-2.6 26 0"
        fill="none"
        stroke="#9cc2ff"
        strokeWidth="1.6"
      />
      <path
        d="M8 22C10.5 9 21.5 9 24 22"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeDasharray="2.2 2.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="12.3" r="2" fill="#fff" />
    </svg>
  )
}
