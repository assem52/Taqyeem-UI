import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminShell from '../../../shared/components/AdminShell';
import { useGetAdminAttemptReviewQuery } from '../adminQuizzesApi';
import { CheckCircle2, AlertCircle, Loader2 } from '../../../shared/components/Icons';

export default function AdminAttemptReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } =
    useGetAdminAttemptReviewQuery(attemptId);

  if (isLoading) {
    return (
      <AdminShell title="Attempt review" subtitle="Loading…">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} /> Loading attempt…
        </div>
      </AdminShell>
    );
  }

  if (isError || !data) {
    return (
      <AdminShell title="Attempt review" subtitle="Unavailable">
        <p className="text-sm text-danger">
          {error?.data?.message || 'Could not load this attempt.'}
        </p>
        <button type="button" onClick={refetch} className="mt-3 text-sm font-medium underline">
          Retry
        </button>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={data.learner.name}
      subtitle={`${data.quiz.title} · ${data.status}`}
      actions={
        <button
          type="button"
          onClick={() => navigate(`/admin/quizzes/${data.quiz.quizId}?tab=results`)}
          className="rounded-button border border-border px-3 py-2 text-sm font-medium"
        >
          Back to results
        </button>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs uppercase text-muted">Score</p>
          <p className="mt-1 text-2xl font-bold text-heading">
            {data.score != null ? `${data.score}%` : '—'}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs uppercase text-muted">Pass mark</p>
          <p className="mt-1 text-2xl font-bold text-heading">
            {data.passScore != null ? `${data.passScore}%` : '—'}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs uppercase text-muted">Result</p>
          <p className="mt-1 text-lg font-semibold text-heading">
            {data.passed === true ? 'Passed' : data.passed === false ? 'Not yet' : '—'}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs uppercase text-muted">Integrity</p>
          <p className="mt-1 text-lg font-semibold text-heading">
            {data.integrity.isFlagged
              ? data.integrity.badgeLabel
              : `${data.integrity.eventCount} events`}
          </p>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">
        {data.learner.email}
        {data.submittedAt
          ? ` · Submitted ${new Date(data.submittedAt).toLocaleString()}`
          : ' · In progress'}
      </p>

      {data.integrity.events?.length ? (
        <div className="mb-6 rounded-card border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-heading">Visibility events</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {data.integrity.events.map((event) => (
              <li key={event.id}>
                {event.type} · {new Date(event.occurredAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-3">
        {data.questions.map((question, index) => (
          <div key={question.questionId} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-heading">
                {index + 1}. {question.text}
              </p>
              {question.isCorrect === true ? (
                <CheckCircle2 size={18} className="text-success" />
              ) : question.isCorrect === false ? (
                <AlertCircle size={18} className="text-warning" />
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted">
              Answer:{' '}
              <span className="font-medium text-heading">
                {question.selectedOptionText || question.textAnswer || '—'}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Correct:{' '}
              <span className="font-medium text-heading">
                {question.correctOptionText || '—'}
              </span>
            </p>
          </div>
        ))}
      </div>

      <Link
        to={`/admin/follow-up`}
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        Open morning follow-up
      </Link>
    </AdminShell>
  );
}
