import { EVIDENCE_STATUS_LABELS, type EvidenceStatus } from '../domain/enums.ts'

const TONE: Record<EvidenceStatus, string> = {
  VERIFIED_OFFICIAL: 'good',
  CORROBORATED: 'good',
  REPORTED_UNCONFIRMED: 'warn',
  COMPANY_TARGET: 'info',
  DISPUTED: 'bad',
  OUTDATED: 'muted',
  UNKNOWN: 'muted',
}

export function StatusBadge({ status }: { status: EvidenceStatus }) {
  return (
    <span className={`badge badge-${TONE[status]}`} data-status={status}>
      {EVIDENCE_STATUS_LABELS[status]}
    </span>
  )
}

export function Tag({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' | 'muted'
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
