import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import AdminShell from '../../../shared/components/AdminShell';
import QuizDetailModal from '../components/QuizDetailModal';
import BulkInviteModal from '../components/BulkInviteModal';
import InvitationTrackerTable from '../components/InvitationTrackerTable';
import CohortOutcomesSnapshot from '../components/CohortOutcomesSnapshot';
import {
  useGetAdminQuizByIdQuery,
  useGetQuizAnalyticsQuery,
  useGetQuizAttemptsQuery,
  usePublishQuizMutation,
  useUnpublishQuizMutation,
} from '../adminQuizzesApi';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'questions', label: 'Questions' },
  { id: 'access', label: 'Access' },
  { id: 'results', label: 'Results' },
  { id: 'settings', label: 'Settings' },
];

function MetricCard({ label, value, hint }) {
  return (
    <div className="border-border/80 py-1">
      <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">{label}</p>
      <p className="font-display text-heading mt-1 text-2xl tabular-nums tracking-tight">{value}</p>
      {hint ? <p className="text-muted mt-0.5 text-xs">{hint}</p> : null}
    </div>
  );
}

export default function QuizWorkspacePage() {
  const { quizId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = params.get('tab') || 'overview';
  const view = params.get('view') || '';
  const setTab = (next) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('tab', next);
    if (next !== 'results') nextParams.delete('view');
    setParams(nextParams, { replace: true });
  };

  const { data: quiz, isLoading, isError, refetch } = useGetAdminQuizByIdQuery(quizId);
  const { data: analytics } = useGetQuizAnalyticsQuery(quizId, {
    skip: tab !== 'overview' && tab !== 'results',
  });
  const questionAnalytics = analytics?.questions ?? [];
  const { data: attempts = [] } = useGetQuizAttemptsQuery(quizId, {
    skip: tab !== 'results',
  });
  const [publishQuiz, { isLoading: isPublishing }] = usePublishQuizMutation();
  const [unpublishQuiz, { isLoading: isUnpublishing }] = useUnpublishQuizMutation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  if (isLoading) {
    return (
      <AdminShell title="Quiz workspace" subtitle="Loading…">
        <p className="text-sm text-muted">Loading quiz…</p>
      </AdminShell>
    );
  }

  if (isError || !quiz) {
    return (
      <AdminShell title="Quiz workspace" subtitle="Unavailable">
        <p className="text-sm text-danger">Could not load this quiz.</p>
        <button type="button" onClick={refetch} className="mt-3 text-sm font-medium text-heading underline">
          Retry
        </button>
      </AdminShell>
    );
  }

  const handlePublishToggle = async () => {
    setActionError('');
    try {
      if (quiz.status === 'PUBLISHED') {
        await unpublishQuiz(quiz.quizId).unwrap();
      } else {
        await publishQuiz(quiz.quizId).unwrap();
      }
    } catch (err) {
      setActionError(
        err?.data?.message ||
          (err?.data?.errors ? err.data.errors.join(', ') : 'Publish action failed.'),
      );
    }
  };

  return (
    <AdminShell
      title={quiz.title}
      subtitle={`${quiz.status} · ${quiz.duration} min · Pass ${quiz.passScore ?? '—'}%`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/quizzes"
            className="rounded-button border border-border px-3 py-2 text-sm font-medium text-heading hover:bg-background"
          >
            All quizzes
          </Link>
          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={
              isPublishing ||
              isUnpublishing ||
              (quiz.status !== 'PUBLISHED' && !quiz.isValid)
            }
            className="rounded-button bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {quiz.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      }
    >
      {actionError ? (
        <div className="mb-4 rounded-card border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {actionError}
        </div>
      ) : null}

      <div className="border-border mb-8 flex flex-wrap gap-1 border-b">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.id === 'questions') {
                navigate(`/admin/quizzes/${quizId}/questions`);
                return;
              }
              setTab(item.id);
            }}
            className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition ${
              tab === item.id
                ? 'border-primary text-heading'
                : 'text-muted hover:text-heading border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="border-border grid gap-6 border-b pb-8 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Invited" value={analytics?.invitedCount ?? '—'} />
            <MetricCard label="Enrolled" value={analytics?.enrolledCount ?? '—'} />
            <MetricCard label="Submitted" value={analytics?.submittedCount ?? '—'} />
            <MetricCard
              label="Completion"
              value={analytics ? `${analytics.completionRate}%` : '—'}
            />
          </div>

          {!quiz.isValid && quiz.validationErrors?.length ? (
            <div className="border-warning/25 bg-warning/5 text-warning rounded-card border px-4 py-3 text-sm">
              <p className="font-semibold">Cannot publish yet</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs opacity-90">
                {quiz.validationErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
              <Link
                to={`/admin/quizzes/${quizId}/questions`}
                className="mt-3 inline-block text-sm font-semibold underline"
              >
                Fix questions
              </Link>
            </div>
          ) : (
            <p className="text-muted text-sm leading-relaxed">
              Ready to publish when you are. Invite the cohort from Access.
            </p>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              to={`/admin/quizzes/${quizId}/questions`}
              className="text-primary font-semibold hover:underline"
            >
              Questions
            </Link>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="text-primary font-semibold hover:underline"
            >
              Invite
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="text-primary font-semibold hover:underline"
            >
              Settings
            </button>
          </div>
        </div>
      )}

      {tab === 'access' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-button bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Invite students
            </button>
          </div>
          <InvitationTrackerTable quizId={quizId} />
        </div>
      )}

      {tab === 'results' && (
        <div className="space-y-6">
          <CohortOutcomesSnapshot
            quiz={quiz}
            analytics={analytics}
            attempts={attempts}
            quizId={quizId}
            highlight={view === 'snapshot'}
          />

          <div className="border-border grid gap-6 border-b pb-8 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Average score" value={analytics ? `${analytics.averageScore}%` : '—'} />
            <MetricCard label="Pass rate" value={analytics ? `${analytics.passRate}%` : '—'} />
            <MetricCard label="Passed" value={analytics?.passedCount ?? '—'} />
            <MetricCard label="Started" value={analytics?.startedCount ?? '—'} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-heading">Hardest questions</h3>
            <div className="overflow-hidden rounded-card border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2">Question</th>
                    <th className="px-3 py-2">Answers</th>
                    <th className="px-3 py-2">Correct rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...questionAnalytics]
                    .sort((a, b) => a.correctRate - b.correctRate)
                    .slice(0, 8)
                    .map((row) => (
                      <tr key={row.questionId}>
                        <td className="px-3 py-2 text-heading">{row.text}</td>
                        <td className="px-3 py-2 text-muted">{row.totalAnswers}</td>
                        <td className="px-3 py-2 font-medium text-heading">{row.correctRate}%</td>
                      </tr>
                    ))}
                  {questionAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-muted">
                        No question analytics yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-heading">Learner attempts</h3>
              <a
                className="rounded-button border border-border px-3 py-1.5 text-sm font-medium text-heading hover:bg-background"
                href={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'}/analytics/quiz/${quizId}/export.csv`}
                onClick={(event) => {
                  event.preventDefault();
                  const token = localStorage.getItem('token');
                  fetch(
                    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'}/analytics/quiz/${quizId}/export.csv`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
                  )
                    .then((res) => res.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const anchor = document.createElement('a');
                      anchor.href = url;
                      anchor.download = `quiz-${quizId}-results.csv`;
                      anchor.click();
                      URL.revokeObjectURL(url);
                    })
                    .catch(() => {});
                }}
              >
                Export CSV
              </a>
            </div>
            <div className="overflow-hidden rounded-card border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2">Learner</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Integrity</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.map((row) => (
                    <tr key={row.attemptId}>
                      <td className="px-3 py-2">
                        <p className="font-medium text-heading">{row.learnerName}</p>
                        <p className="text-xs text-muted">{row.learnerEmail}</p>
                      </td>
                      <td className="px-3 py-2 text-heading">
                        {row.score != null ? `${row.score}%` : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {row.isFlagged ? (
                          <span className="rounded bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                            {row.badgeLabel || 'Needs review'}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">{row.eventCount} events</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="text-sm font-semibold text-primary hover:underline"
                          onClick={() => navigate(`/admin/attempts/${row.attemptId}`)}
                        >
                          Open attempt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted">
                        No attempts yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Instructions, integrity threshold, results policy, and schedule live in settings.
          </p>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-button bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Edit quiz settings
          </button>
        </div>
      )}

      <QuizDetailModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        quiz={quiz}
      />

      <BulkInviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        quiz={quiz}
      />
    </AdminShell>
  );
}
