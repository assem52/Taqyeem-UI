import { FOLLOW_UP_REASON } from '../../../shared/models/dto/adminFollowUp.dto'

function scoreLabel(learner, reason) {
  if (learner.score !== null && learner.score !== undefined) {
    return `${learner.score}%`
  }
  if (reason === FOLLOW_UP_REASON.DID_NOT_START) return 'No attempt'
  if (reason === FOLLOW_UP_REASON.STARTED_NOT_SUBMITTED) return 'In progress'
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
      label: 'Open access',
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
    <article className="border-border bg-surface rounded-card border px-4 py-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h3 className="text-heading font-semibold tracking-tight">{learner.studentName}</h3>
          <a className="text-muted hover:text-heading text-sm transition hover:underline" href={mailto}>
            {learner.studentEmail}
          </a>
        </div>
        <div className="sm:text-right">
          <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">Score</p>
          <p className="text-heading mt-0.5 text-sm font-semibold tabular-nums">
            {scoreLabel(learner, reason)}
          </p>
        </div>
      </div>

      <dl className="border-border mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">Quiz</dt>
          <dd className="text-body mt-1 text-sm">{learner.quizTitle}</dd>
        </div>
        <div>
          <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">Next step</dt>
          <dd className="text-heading mt-1 text-sm font-medium leading-snug">{learner.nextStep}</dd>
        </div>
      </dl>

      {learner.integrityReviewNote ? (
        <p className="border-warning/20 bg-warning/10 text-warning mt-3 rounded-button border px-3 py-2 text-sm">
          {learner.integrityReviewNote}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {action ? (
          <a
            href={action.href}
            className="bg-primary hover:bg-primary-hover rounded-button px-3 py-1.5 text-sm font-semibold text-white"
          >
            {action.label}
          </a>
        ) : null}
        <a
          href={mailto}
          className="border-border text-heading hover:bg-background rounded-button border px-3 py-1.5 text-sm font-medium"
        >
          Email
        </a>
        {learner.nextStep ? (
          <button
            type="button"
            className="border-border text-heading hover:bg-background rounded-button border px-3 py-1.5 text-sm font-medium"
            onClick={() => navigator.clipboard.writeText(learner.nextStep)}
          >
            Copy next step
          </button>
        ) : null}
      </div>
    </article>
  )
}
