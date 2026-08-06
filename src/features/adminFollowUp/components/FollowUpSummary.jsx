import { FOLLOW_UP_REASON } from '../../../shared/models/dto/adminFollowUp.dto'

const REASONS = [
  {
    reason: FOLLOW_UP_REASON.FLAGGED_FOR_REVIEW,
    label: 'Flagged for review',
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
      <div className="mb-3 rounded-lg bg-slate-900 p-4 text-white">
        <p className="text-sm text-slate-300">Total requiring follow-up</p>
        <p className="mt-1 text-3xl font-semibold">{summary?.total ?? 0}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {REASONS.map(({ reason, label }) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-3"
            key={reason}
          >
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900">
              {summary?.byReason?.[reason] ?? 0}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
