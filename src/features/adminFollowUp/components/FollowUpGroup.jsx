import FollowUpLearnerCard from './FollowUpLearnerCard'
import FollowUpReasonPill from './FollowUpReasonPill'

export default function FollowUpGroup({ group }) {
  const headingId = `follow-up-${group.reason.toLowerCase()}`

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={headingId}>
          <FollowUpReasonPill reason={group.reason} label={group.label} />
        </h2>
        <span className="text-sm font-medium text-slate-500">
          {group.count} {group.count === 1 ? 'learner' : 'learners'}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {group.learners.map((learner) => (
          <FollowUpLearnerCard
            key={`${learner.studentId}:${learner.quizId}`}
            learner={learner}
            reason={group.reason}
          />
        ))}
      </div>
    </section>
  )
}
