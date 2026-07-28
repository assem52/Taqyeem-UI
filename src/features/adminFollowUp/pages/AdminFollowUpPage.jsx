import { useGetAdminFollowUpQuery } from '../adminFollowUpApi'

export default function AdminFollowUpPage() {
  const { data, isLoading, isError, refetch } = useGetAdminFollowUpQuery()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Morning follow-up
        </h1>
        <p className="text-sm text-slate-500">
          Learners who need an actionable follow-up across published quizzes.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading follow-up list…</p>
      ) : null}

      {isError ? (
        <div
          className="rounded border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="mb-3 text-sm text-red-800">
            Unable to load the follow-up list. Please try again.
          </p>
          <button
            className="rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
            onClick={refetch}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : null}

      {data?.summary.total === 0 ? (
        <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No learners need follow-up.
        </p>
      ) : null}

      {data && data.summary.total > 0 ? (
        <section aria-label="Follow-up overview">
          <p className="mb-4 text-sm font-medium text-slate-700">
            {data.summary.total} learner follow-up
            {data.summary.total === 1 ? '' : 's'}
          </p>
          <ul className="flex list-none flex-col gap-2 p-0">
            {data.groups.map((group) => (
              <li
                className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-700"
                key={group.reason}
              >
                {group.label}: {group.count}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
