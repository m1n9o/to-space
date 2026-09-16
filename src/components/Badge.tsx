import { BADGE_LABELS, type StatusBadge } from '../data/spaceOptions'

interface BadgeProps {
  statusKey: StatusBadge
}

export function Badge({ statusKey }: BadgeProps) {
  const badge = BADGE_LABELS[statusKey]
  return <span className={`badge badge--${badge.color}`}>{badge.text}</span>
}
