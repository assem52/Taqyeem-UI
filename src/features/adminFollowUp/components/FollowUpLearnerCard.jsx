import { FOLLOW_UP_REASON } from '../../../shared/models/dto/adminFollowUp.dto'

function scoreLabel(learner, reason) {
  if (learner.score !== null && learner.score !== undefined) {
    return `${learner.score}%`
  }
  if (reason === FOLLOW_UP_REASON.DID_NOT_START) return 'No attempt'
  if (reason === FOLLOW_UP_REASON.STARTED_NOT_SUBMITTED) return 'Awaiting submission'
  return 'No score'
}

function primaryAction(learner, reason) {
  if (learner.attemptId) {
    return {
      label: reason === FOLLOW_UP_REASON.FLAGGED_FOR_REVIEW ? 'Review attempt' : 'Open attempt',
      href: `/admin/attempts/${learner.attemptId}`,
    }
  }
  if (learner.quizId) {
    return {
      label: 'Open quiz access',
      href: `/admin/quizzes/${learner.quizId}?tab=access`,
    }
  }
  return null
}

export default function FollowUpLearnerCard({ learner, reason }) {
  const action = primaryAction(learner, reason)
  const mailto = `mailto:${learner.studentEmail}?subject=${encodeURIComponent(
    `Follow-up: ${learner.quizTitle || 'your quiz'}`,
  )}&body=${encodeURIComponent(
    `Hi ${learner.studentName || ''},\n\n${learner.nextStep || 'Checking in about your quiz.'}\n`,
  )}`

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-semibold text-slate-900">{learner.studentName}</h3>
          <a className="text-sm text-slate-500 hover:text-slate-800 hover:underline" href={mailto}>
            {learner.studentEmail}
          </a>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Score</p>
          <p className="text-sm font-semibold text-slate-800">{scoreLabel(learner, reason)}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Quiz</dt>
          <dd className="mt-1 text-sm text-slate-700">{learner.quizTitle}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Next step</dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">{learner.nextStep}</dd>
        </div>
      </dl>

      {learner.integrityReviewNote ? (
        <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Review note: {learner.integrityReviewNote}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {action ? (
          <a
            href={action.href}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
          >
            {action.label}
          </a>
        ) : null}
        <a
          href={mailto}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
        >
          Email learner
        </a>
        {learner.nextStep ? (
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
            onClick={() => navigator.clipboard.writeText(learner.nextStep)}
          >
            Copy next step
          </button>
        ) : null}
      </div>
    </article>
  )
}
