import FollowUpLearnerCard from './FollowUpLearnerCard'
import FollowUpReasonPill from './FollowUpReasonPill'

export default function FollowUpGroup({ group }) {
  const reasonStr = group?.reason ? String(group.reason).toLowerCase() : 'unknown'
  const headingId = `follow-up-${reasonStr}`
  const learnersList = group?.learners ?? []
  const count = group?.count ?? learnersList.length

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId}>
          <FollowUpReasonPill reason={group?.reason} label={group?.label} />
        </h2>
        <span className="text-muted text-sm tabular-nums">
          {count} {count === 1 ? 'learner' : 'learners'}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {learnersList.map((learner, idx) => (
          <FollowUpLearnerCard
            key={`${learner?.studentId ?? idx}:${learner?.quizId ?? idx}`}
            learner={learner}
            reason={group?.reason}
          />
        ))}
      </div>
    </section>
  )
}
