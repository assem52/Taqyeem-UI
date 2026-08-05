import { Link } from 'react-router-dom';
import StatusPill from './StatusPill';
import { formatClosesAt } from '../../../shared/utils/formatDate';
import { Clock, Calendar, PlayCircle } from '../../../shared/components/Icons';

export default function QuizCard({ quiz }) {

  return (
    <article className="bg-surface text-body rounded-card shadow-soft border-border border flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md h-full">
      {/* Card Header */}
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <div className="flex items-start justify-between gap-3 mb-1">
          <StatusPill state={quiz.studentState} />
          {quiz.score != null && (
            <span className="text-xs font-semibold text-heading bg-primary-soft text-primary px-2 py-0.5 rounded border border-primary/10">
              Score: {quiz.score}
            </span>
          )}
        </div>
        <h2 className="text-heading font-semibold text-lg line-clamp-1 tracking-tight">{quiz.title}</h2>
      </div>

      {/* Card Body */}
      <div className="p-6 pt-0 flex-1 flex flex-col justify-between">
        {quiz.description ? (
          <p className="line-clamp-2 text-sm text-muted mb-4 leading-relaxed">{quiz.description}</p>
        ) : (
          <p className="text-sm text-muted italic mb-4">No description provided.</p>
        )}

        <div className="flex flex-col gap-2 text-xs text-muted mt-auto pt-2 border-t border-border/50">
          {quiz.durationMinutes != null && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-muted/70 shrink-0" />
              <span>Duration: {quiz.durationMinutes} minutes</span>
            </div>
          )}

          {quiz.opensAt && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted/70 shrink-0" />
              <span>Opens: {formatClosesAt(quiz.opensAt)}</span>
            </div>
          )}

          {quiz.closesAt && (
            <div className="flex items-center gap-2 text-danger">
              <Calendar size={14} className="shrink-0" />
              <span>Closes: {formatClosesAt(quiz.closesAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-background/50 border-t border-border flex items-center justify-between p-4 px-6 gap-3">
        {quiz.canStart ? (
          <Link
            to={`/quizzes/${quiz.quizId}`}
            className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out bg-primary text-surface hover:bg-primary-hover shadow-soft py-2 px-4"
          >
            <PlayCircle size={16} className="mr-2" />
            {quiz.studentState === 'In progress' ? 'Continue Quiz' : 'Start Quiz'}
          </Link>
        ) : quiz.blockedReason ? (
          <p className="text-xs font-medium text-warning bg-warning/10 p-2 px-3 rounded border border-warning/20 w-full text-center">
            {quiz.blockedReason}
          </p>
        ) : (
          <span className="text-xs text-muted italic">Quiz unavailable</span>
        )}
      </div>
    </article>
  );
}
