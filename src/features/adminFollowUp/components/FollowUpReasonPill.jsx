import { FOLLOW_UP_REASON } from '../../../shared/models/dto/adminFollowUp.dto'

const STYLES = {
  [FOLLOW_UP_REASON.FLAGGED_FOR_REVIEW]: 'bg-warning/15 text-warning',
  [FOLLOW_UP_REASON.STARTED_NOT_SUBMITTED]: 'bg-primary-soft text-primary',
  [FOLLOW_UP_REASON.DID_NOT_START]: 'bg-background text-muted border border-border',
  [FOLLOW_UP_REASON.FAILED]: 'bg-danger/10 text-danger',
  [FOLLOW_UP_REASON.LOW_SCORE]: 'bg-warning/10 text-warning',
}

export default function FollowUpReasonPill({ reason, label }) {
  const className = STYLES[reason] ?? 'bg-background text-muted border border-border'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
