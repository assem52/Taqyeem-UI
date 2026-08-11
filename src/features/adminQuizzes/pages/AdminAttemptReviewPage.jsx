import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminShell from '../../../shared/components/AdminShell';
import {
  useGetAdminAttemptReviewQuery,
  useOverrideEssayGradeMutation,
} from '../adminQuizzesApi';
import { CheckCircle2, AlertCircle, Loader2 } from '../../../shared/components/Icons';

function EssayGradeEditor({ question, attemptId }) {
  const [points, setPoints] = useState(
    question.awardedPoints != null ? String(question.awardedPoints) : '',
  );
  const [feedback, setFeedback] = useState(question.aiFeedback ?? '');
  const [overrideGrade, { isLoading, isError, error, isSuccess }] =
    useOverrideEssayGradeMutation();

  const save = async () => {
    const awardedPoints = Number(points);
    if (!Number.isFinite(awardedPoints) || awardedPoints < 0) return;
    await overrideGrade({
      attemptId,
      questionId: question.questionId,
      awardedPoints,
      feedback: feedback.trim() || undefined,
    }).unwrap();
  };

  return (
    <div className="mt-3 space-y-2 rounded-button border border-border bg-background p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Essay grade · {question.gradingStatus || 'UNGRADED'}
      </p>
      {question.explanation ? (
        <p className="text-xs text-muted">
          Rubric: <span className="text-heading">{question.explanation}</span>
        </p>
      ) : null}
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-muted">
          Points (max {question.points})
          <input
            type="number"
            min={0}
            max={question.points}
            step={0.5}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="mt-1 block w-24 rounded-input border border-border bg-surface px-2 py-1.5 text-sm text-heading"
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={isLoading}
          className="rounded-button bg-primary px-3 py-2 text-xs font-medium text-surface disabled:opacity-50"
        >
          {isLoading ? 'Saving…' : 'Save human grade'}
        </button>
      </div>
      <textarea
        rows={2}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback for the learner…"
        className="w-full rounded-input border border-border bg-surface px-2 py-1.5 text-sm text-heading"
      />
      {isSuccess ? (
        <p className="text-xs text-success">Grade saved and attempt score updated.</p>
      ) : null}
      {isError ? (
        <p className="text-xs text-danger">
          {error?.data?.message || 'Could not save grade.'}
        </p>
      ) : null}
    </div>
  );
}

export default function AdminAttemptReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } =
    useGetAdminAttemptReviewQuery(attemptId);

  const essayCount = useMemo(
    () => data?.questions?.filter((q) => q.type === 'OPEN_ENDED').length ?? 0,
    [data],
  );

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
        {essayCount > 0 ? ` · ${essayCount} essay(s) for review` : ''}
        {data.scoreDetail?.ungradedCount
          ? ` · ${data.scoreDetail.ungradedCount} still ungraded`
          : ''}
      </p>

      {data.integrity.events?.length ? (
        <div className="mb-6 rounded-card border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-heading">Visibility events</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {data.integrity.events.map((event) => (
              <li key={event.id}>
                {event.type === 'VISIBILITY_LOST' ? 'Visibility lost' : event.type} ·{' '}
                {new Date(event.occurredAt).toLocaleString()}
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
                {question.type === 'OPEN_ENDED' ? (
                  <span className="ml-2 text-xs font-medium text-muted">Essay</span>
                ) : null}
              </p>
              {question.isCorrect === true ? (
                <CheckCircle2 size={18} className="text-success" />
              ) : question.isCorrect === false ? (
                <AlertCircle size={18} className="text-warning" />
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted">
              Answer:{' '}
              <span className="font-medium text-heading whitespace-pre-wrap">
                {question.selectedOptionText || question.textAnswer || '—'}
              </span>
            </p>
            {question.type !== 'OPEN_ENDED' ? (
              <p className="mt-1 text-sm text-muted">
                Correct:{' '}
                <span className="font-medium text-heading">
                  {question.correctOptionText || '—'}
                </span>
              </p>
            ) : (
              <EssayGradeEditor question={question} attemptId={data.attemptId} />
            )}
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
