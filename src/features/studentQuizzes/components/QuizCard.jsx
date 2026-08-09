import { Link } from 'react-router-dom';
import StatusPill from './StatusPill';
import { formatClosesAt } from '../../../shared/utils/formatDate';

export default function QuizCard({ quiz }) {
  const isSubmitted = quiz.studentState === 'Submitted';

  return (
    <article className="border-border bg-surface hover:border-primary/25 flex h-full flex-col rounded-card border transition">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <StatusPill state={quiz.studentState} />
          {quiz.score != null ? (
            <span className="text-heading text-xs font-semibold tabular-nums">
              {quiz.score}%
              {quiz.passed === true ? ' · Passed' : quiz.passed === false ? ' · Not yet' : ''}
            </span>
          ) : null}
        </div>

        <h2 className="font-display text-heading text-lg leading-snug tracking-tight">
          {quiz.title}
        </h2>

        {quiz.description ? (
          <p className="text-muted mt-2 line-clamp-2 text-sm leading-relaxed">{quiz.description}</p>
        ) : null}

        <div className="text-muted mt-auto space-y-1 pt-5 text-xs">
          {quiz.durationMinutes != null ? <p>{quiz.durationMinutes} min</p> : null}
          {quiz.closesAt ? <p>Closes {formatClosesAt(quiz.closesAt)}</p> : null}
        </div>
      </div>

      <div className="border-border border-t px-5 py-3.5">
        {quiz.canStart ? (
          <Link
            to={`/quizzes/${quiz.quizId}`}
            className="bg-primary hover:bg-primary-hover inline-flex w-full items-center justify-center rounded-button py-2.5 text-sm font-semibold text-white"
          >
            {quiz.studentState === 'In progress' ? 'Continue quiz' : 'Start quiz'}
          </Link>
        ) : isSubmitted ? (
          <Link
            to={`/quizzes/${quiz.quizId}/results`}
            className="border-border text-heading hover:bg-background inline-flex w-full items-center justify-center rounded-button border py-2.5 text-sm font-semibold"
          >
            View results
          </Link>
        ) : quiz.blockedReason ? (
          <p className="text-muted text-center text-xs leading-relaxed">{quiz.blockedReason}</p>
        ) : (
          <p className="text-muted text-center text-xs">Unavailable</p>
        )}
      </div>
    </article>
  );
}
