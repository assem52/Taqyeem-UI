import { FOLLOW_UP_REASON } from '../../../shared/models/dto/adminFollowUp.dto'

const STYLES = {
  [FOLLOW_UP_REASON.FLAGGED_FOR_REVIEW]: 'bg-amber-100 text-amber-900',
  [FOLLOW_UP_REASON.STARTED_NOT_SUBMITTED]: 'bg-sky-100 text-sky-800',
  [FOLLOW_UP_REASON.DID_NOT_START]: 'bg-slate-100 text-slate-700',
  [FOLLOW_UP_REASON.FAILED]: 'bg-rose-100 text-rose-800',
  [FOLLOW_UP_REASON.LOW_SCORE]: 'bg-orange-100 text-orange-800',
}

export default function FollowUpReasonPill({ reason, label }) {
  const className = STYLES[reason] ?? 'bg-slate-100 text-slate-700'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
