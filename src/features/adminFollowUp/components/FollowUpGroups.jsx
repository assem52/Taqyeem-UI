import FollowUpGroup from './FollowUpGroup'

export default function FollowUpGroups({ groups }) {
  const groupsList = groups ?? []
  if (groupsList.length === 0) {
    return (
      <p className="border-border bg-surface text-muted rounded-card border px-5 py-8 text-center text-sm">
        No learners need follow-up for this selection.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {groupsList.map((group, idx) => (
        <FollowUpGroup group={group} key={group?.reason ?? idx} />
      ))}
    </div>
  )
}
