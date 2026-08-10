import { FOLLOW_UP_REASON } from '../../../shared/models/dto/adminFollowUp.dto'

const REASONS = [
  {
    reason: FOLLOW_UP_REASON.FLAGGED_FOR_REVIEW,
    label: 'Needs review',
  },
  {
    reason: FOLLOW_UP_REASON.STARTED_NOT_SUBMITTED,
    label: 'Not submitted',
  },
  { reason: FOLLOW_UP_REASON.DID_NOT_START, label: 'Did not start' },
  { reason: FOLLOW_UP_REASON.FAILED, label: 'Failed' },
  { reason: FOLLOW_UP_REASON.LOW_SCORE, label: 'Low score' },
]

export default function FollowUpSummary({ summary }) {
  return (
    <section aria-label="Follow-up summary" className="mb-8">
      <div className="border-border bg-surface mb-4 flex items-end justify-between gap-4 rounded-card border px-5 py-4">
        <div>
          <p className="text-muted text-xs font-semibold tracking-wider uppercase">
            Needs a next step
          </p>
          <p className="font-display text-heading mt-1 text-3xl tabular-nums">
            {summary?.total ?? 0}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {REASONS.map(({ reason, label }) => (
          <div
            className="border-border bg-surface rounded-card border px-3.5 py-3"
            key={reason}
          >
            <dt className="text-muted text-xs font-medium leading-snug">{label}</dt>
            <dd className="font-display text-heading mt-1 text-xl tabular-nums">
              {summary?.byReason?.[reason] ?? 0}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
