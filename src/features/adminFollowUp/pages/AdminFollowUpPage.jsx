import { useGetAdminFollowUpQuery } from '../adminFollowUpApi'
import { formatDateTime } from '../../../shared/utils/formatDate'
import FollowUpGroups from '../components/FollowUpGroups'
import FollowUpSummary from '../components/FollowUpSummary'

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
        {data ? (
          <p className="mt-2 text-xs text-slate-400">
            Generated {formatDateTime(data.generatedAt)}
          </p>
        ) : null}
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

      {data ? (
        <>
          <FollowUpSummary summary={data.summary} />
          <FollowUpGroups groups={data.groups} />
        </>
      ) : null}
    </main>
  )
}
