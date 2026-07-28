import FollowUpGroup from './FollowUpGroup'

export default function FollowUpGroups({ groups }) {
  if (groups.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
        No learners need follow-up for this selection.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <FollowUpGroup group={group} key={group.reason} />
      ))}
    </div>
  )
}
