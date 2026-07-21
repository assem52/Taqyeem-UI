import { Link, useParams } from 'react-router-dom'
import { useGetStudentQuizzesQuery } from '../studentQuizzesApi'
import StatusPill from '../components/StatusPill'
import { formatClosesAt } from '../../../shared/utils/formatDate'

export default function QuizGatewayPage() {
  const { quizId } = useParams()
  const { data, isLoading, isError } = useGetStudentQuizzesQuery()

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-red-700">Could not load quiz details.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-slate-700 underline">
          Back to dashboard
        </Link>
      </main>
    )
  }

  const quiz = data?.quizzes.find((q) => q.quizId === quizId)

  if (!quiz) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-slate-700">Quiz not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-slate-700 underline">
          Back to dashboard
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="mb-4 inline-block text-sm text-slate-600 underline">
        ← Back to dashboard
      </Link>

      <div className="rounded border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900">{quiz.title}</h1>
          <StatusPill state={quiz.studentState} />
        </div>

        {quiz.description ? (
          <p className="mb-3 text-sm text-slate-600">{quiz.description}</p>
        ) : null}

        <p className="mb-4 text-sm text-slate-500">
          Closes: {formatClosesAt(quiz.closesAt)}
        </p>

        {quiz.canStart ? (
          <p className="text-sm text-slate-800">
            You can start this quiz. Taking the quiz will be available in a
            later sprint.
          </p>
        ) : (
          <p className="text-sm text-amber-800">
            {quiz.blockedReason ?? 'You cannot start this quiz.'}
          </p>
        )}
      </div>
    </main>
  )
}
