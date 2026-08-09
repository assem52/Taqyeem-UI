import { useState } from 'react'
import { useGetAdminFollowUpQuery } from '../adminFollowUpApi'
import { formatDateTime } from '../../../shared/utils/formatDate'
import AdminShell from '../../../shared/components/AdminShell'
import FollowUpGroups from '../components/FollowUpGroups'
import FollowUpSummary from '../components/FollowUpSummary'
import QuizFilter from '../components/QuizFilter'
import { deriveQuizOptions } from '../utils/deriveQuizOptions'

export default function AdminFollowUpPage() {
  const [selectedQuizId, setSelectedQuizId] = useState('')
  const allFollowUps = useGetAdminFollowUpQuery()
  const filteredFollowUps = useGetAdminFollowUpQuery(
    { quizId: selectedQuizId },
    { skip: selectedQuizId === '' },
  )
  const activeQuery = selectedQuizId ? filteredFollowUps : allFollowUps
  const { data, isLoading, isFetching, isError, refetch } = activeQuery
  const quizOptions = deriveQuizOptions(allFollowUps.data?.groups ?? [])

  return (
    <AdminShell
      title="Follow-up"
      subtitle={
        data
          ? `Updated ${formatDateTime(data.generatedAt)}. Act on people who need a next step.`
          : 'Act on people who need a next step across published quizzes.'
      }
    >

      <QuizFilter
        disabled={allFollowUps.isLoading || allFollowUps.isError}
        onChange={setSelectedQuizId}
        options={quizOptions}
        selectedQuizId={selectedQuizId}
      />

      {isLoading ? <p className="text-muted text-sm">Loading follow-up list…</p> : null}

      {isFetching && !isLoading ? (
        <p className="text-muted mb-3 text-xs" role="status">
          Refreshing…
        </p>
      ) : null}

      {isError ? (
        <div className="border-danger/20 bg-danger/5 rounded-card border p-4" role="alert">
          <p className="text-danger mb-3 text-sm">Unable to load the follow-up list.</p>
          <button
            className="bg-primary hover:bg-primary-hover rounded-button px-3 py-1.5 text-sm font-semibold text-white"
            onClick={refetch}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isError && data ? (
        <>
          <FollowUpSummary summary={data.summary} />
          <FollowUpGroups groups={data.groups} />
        </>
      ) : null}
    </AdminShell>
  )
}
