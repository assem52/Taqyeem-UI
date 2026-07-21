import { Link } from 'react-router-dom'
import StatusPill from './StatusPill'
import { formatClosesAt } from '../../../shared/utils/formatDate'

export default function QuizCard({ quiz }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{quiz.title}</h2>
        <StatusPill state={quiz.studentState} />
      </div>

      {quiz.description ? (
        <p className="mb-3 text-sm text-slate-600">{quiz.description}</p>
      ) : null}

      <p className="mb-3 text-sm text-slate-500">
        Closes: {formatClosesAt(quiz.closesAt)}
      </p>

      {quiz.score != null ? (
        <p className="mb-3 text-sm text-slate-600">Score: {quiz.score}</p>
      ) : null}

      {quiz.canStart ? (
        <Link
          to={`/quizzes/${quiz.quizId}`}
          className="inline-block rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
        >
          {quiz.studentState === 'In progress' ? 'Continue' : 'Start'}
        </Link>
      ) : (
        <p className="text-sm text-amber-800">
          {quiz.blockedReason ?? 'You cannot start this quiz.'}
        </p>
      )}
    </article>
  )
}
