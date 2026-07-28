import { FOLLOW_UP_REASON } from '../../../shared/models/dto/adminFollowUp.dto'

function scoreLabel(learner, reason) {
  if (learner.score !== null) {
    return `${learner.score}%`
  }

  if (reason === FOLLOW_UP_REASON.DID_NOT_START) {
    return 'No attempt'
  }

  if (reason === FOLLOW_UP_REASON.STARTED_NOT_SUBMITTED) {
    return 'Awaiting submission'
  }

  return 'No score'
}

export default function FollowUpLearnerCard({ learner, reason }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-semibold text-slate-900">
            {learner.studentName}
          </h3>
          <a
            className="text-sm text-slate-500 hover:text-slate-800 hover:underline"
            href={`mailto:${learner.studentEmail}`}
          >
            {learner.studentEmail}
          </a>
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Score
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {scoreLabel(learner, reason)}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Quiz
          </dt>
          <dd className="mt-1 text-sm text-slate-700">{learner.quizTitle}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Next step
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            {learner.nextStep}
          </dd>
        </div>
      </dl>

      {learner.integrityReviewNote ? (
        <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Review note: {learner.integrityReviewNote}
        </p>
      ) : null}
    </article>
  )
}
