import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetAdminQuizzesQuery,
  usePublishQuizMutation,
  useUnpublishQuizMutation,
  useDeleteQuizMutation,
} from '../adminQuizzesApi';
import QuizDetailModal from '../components/QuizDetailModal';
import BulkInviteModal from '../components/BulkInviteModal';
import DuplicateQuizButton from '../../questionBank/components/DuplicateQuizButton';
import AdminShell from '../../../shared/components/AdminShell';
import { useGetAdminFollowUpQuery } from '../../adminFollowUp/adminFollowUpApi';

function formatWhen(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusLabel(status) {
  if (status === 'PUBLISHED') return 'Published';
  if (status === 'ARCHIVED') return 'Archived';
  return 'Draft';
}

function statusClass(status) {
  if (status === 'PUBLISHED') return 'text-success';
  if (status === 'ARCHIVED') return 'text-muted';
  return 'text-warning';
}

export default function AdminQuizzesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [isBulkInviteOpen, setIsBulkInviteOpen] = useState(false);
  const [selectedQuizForInvite, setSelectedQuizForInvite] = useState(null);
  const [menuQuizId, setMenuQuizId] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: quizzes = [], isLoading, isError, refetch } = useGetAdminQuizzesQuery({
    search: search.trim() || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });
  const { data: followUp } = useGetAdminFollowUpQuery();

  const followUpTotal = useMemo(() => {
    if (!followUp) return null;
    if (typeof followUp.summary?.total === 'number') return followUp.summary.total;
    const groups = followUp.groups || [];
    return groups.reduce((sum, g) => sum + (g.count ?? g.learners?.length ?? 0), 0);
  }, [followUp]);

  const [publishQuiz, { isLoading: isPublishing }] = usePublishQuizMutation();
  const [unpublishQuiz, { isLoading: isUnpublishing }] = useUnpublishQuizMutation();
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();

  const handleOpenEdit = (quiz) => {
    setEditingQuiz(quiz);
    setIsQuizModalOpen(true);
    setMenuQuizId('');
  };

  const handleTogglePublish = async (quiz) => {
    setActionError('');
    setMenuQuizId('');
    try {
      if (quiz.status === 'PUBLISHED') {
        await unpublishQuiz(quiz.quizId).unwrap();
      } else {
        await publishQuiz(quiz.quizId).unwrap();
      }
    } catch (err) {
      const msg =
        err?.data?.message ||
        (err?.data?.errors ? err.data.errors.join(', ') : 'Publish failed.');
      setActionError(`${quiz.title}: ${msg}`);
    }
  };

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Delete “${quiz.title}”? This cannot be undone.`)) return;
    setActionError('');
    setMenuQuizId('');
    try {
      await deleteQuiz(quiz.quizId).unwrap();
    } catch (err) {
      setActionError(err?.data?.message || 'Failed to delete quiz.');
    }
  };

  return (
    <AdminShell
      title="Quizzes"
      subtitle="Create, publish, invite learners, and review results."
      actions={
        <Link
          to="/admin/quizzes/launch"
          className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-sm font-semibold text-white transition"
        >
          New quiz
        </Link>
      }
    >
      {actionError && (
        <div
          role="alert"
          className="border-danger/20 bg-danger/5 text-danger mb-6 flex items-start justify-between gap-3 rounded-card border px-4 py-3 text-sm"
        >
          <p>{actionError}</p>
          <button type="button" onClick={() => setActionError('')} className="font-medium" aria-label="Dismiss">
            Close
          </button>
        </div>
      )}

      {followUpTotal != null && followUpTotal > 0 ? (
        <div className="border-border bg-primary-soft/60 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border px-4 py-3">
          <p className="text-heading text-sm">
            <span className="font-semibold tabular-nums">{followUpTotal}</span>
            {' '}learner{followUpTotal === 1 ? '' : 's'} need a next step today.
          </p>
          <Link
            to="/admin/follow-up"
            className="text-primary text-sm font-semibold hover:underline"
          >
            Review follow-ups
          </Link>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="quiz-search">
          Search quizzes
        </label>
        <input
          id="quiz-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or description"
          className="border-border bg-surface text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full max-w-md rounded-input border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
        />

        <div className="border-border bg-surface flex overflow-hidden rounded-input border text-sm" role="group" aria-label="Filter by status">
          {['ALL', 'DRAFT', 'PUBLISHED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 transition ${
                statusFilter === st
                  ? 'bg-primary-soft text-heading font-medium'
                  : 'text-muted hover:text-heading hover:bg-background'
              }`}
            >
              {st === 'ALL' ? 'All' : statusLabel(st)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted py-16 text-center text-sm">Loading quizzes…</p>
      ) : isError ? (
        <div className="border-border bg-surface rounded-card border px-6 py-10 text-center">
          <p className="text-danger text-sm">Could not load quizzes.</p>
          <button
            type="button"
            onClick={refetch}
            className="border-border text-heading hover:bg-background mt-4 rounded-button border px-4 py-2 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="border-border bg-surface rounded-card border px-6 py-14 text-center">
          <h2 className="font-display text-heading text-xl">No quizzes yet</h2>
          <p className="text-muted mx-auto mt-2 max-w-sm text-sm">
            {search || statusFilter !== 'ALL'
              ? 'Nothing matched your search or filter.'
              : 'Start with a guided setup: details, questions, publish, then invite.'}
          </p>
          {!search && statusFilter === 'ALL' && (
            <Link
              to="/admin/quizzes/launch"
              className="bg-primary hover:bg-primary-hover mt-6 inline-flex rounded-button px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create first quiz
            </Link>
          )}
        </div>
      ) : (
        <ul className="border-border bg-surface divide-border divide-y overflow-hidden rounded-card border">
          {quizzes.map((quiz) => {
            const questionCount = quiz.questions?.length ?? 0;
            const menuOpen = menuQuizId === quiz.quizId;

            return (
              <li key={quiz.quizId} className="px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <Link
                        to={`/admin/quizzes/${quiz.quizId}`}
                        className="font-display text-heading hover:text-primary text-xl tracking-tight transition"
                      >
                        {quiz.title}
                      </Link>
                      <span className={`text-xs font-semibold tracking-wide uppercase ${statusClass(quiz.status)}`}>
                        {statusLabel(quiz.status)}
                      </span>
                      {!quiz.isValid && (
                        <span className="text-danger text-xs font-medium">Needs questions</span>
                      )}
                    </div>

                    {quiz.description && (
                      <p className="text-body mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed">
                        {quiz.description}
                      </p>
                    )}

                    <p className="text-muted mt-3 text-sm">
                      {quiz.duration} min
                      {' · '}
                      Pass {quiz.passScore != null ? `${quiz.passScore}%` : 'not set'}
                      {' · '}
                      {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                      {' · '}
                      {quiz.attemptCount ?? 0} {(quiz.attemptCount ?? 0) === 1 ? 'attempt' : 'attempts'}
                    </p>
                    <p className="text-muted mt-1 text-sm">
                      Opens {formatWhen(quiz.openDate)} · Closes {formatWhen(quiz.closesAt)}
                    </p>
                  </div>

                  <div className="relative flex shrink-0 items-center justify-end gap-2">
                    <Link
                      to={`/admin/quizzes/${quiz.quizId}`}
                      className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-center text-sm font-semibold text-white transition"
                    >
                      Manage
                    </Link>
                    <Link
                      to={`/admin/quizzes/${quiz.quizId}?tab=results`}
                      className="border-border text-heading hover:bg-background rounded-button border px-3.5 py-2 text-center text-sm font-medium"
                    >
                      Results
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMenuQuizId(menuOpen ? '' : quiz.quizId)}
                      className="border-border text-heading hover:bg-background rounded-button border px-2.5 py-2 text-sm font-medium leading-none"
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      aria-label={`Actions for ${quiz.title}`}
                      title="Actions"
                    >
                      ···
                    </button>
                    {menuOpen ? (
                      <div
                        role="menu"
                        className="border-border bg-surface absolute top-full right-0 z-20 mt-1 min-w-[11.5rem] rounded-card border py-1 shadow-soft"
                      >
                        <Link
                          role="menuitem"
                          to={`/admin/quizzes/${quiz.quizId}/questions`}
                          className="hover:bg-background block px-3 py-2 text-sm"
                          onClick={() => setMenuQuizId('')}
                        >
                          Edit questions
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          className="hover:bg-background block w-full px-3 py-2 text-left text-sm"
                          onClick={() => {
                            setSelectedQuizForInvite(quiz);
                            setIsBulkInviteOpen(true);
                            setMenuQuizId('');
                          }}
                        >
                          Invite learners
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="hover:bg-background block w-full px-3 py-2 text-left text-sm disabled:opacity-50"
                          disabled={
                            isPublishing ||
                            isUnpublishing ||
                            (quiz.status !== 'PUBLISHED' && !quiz.isValid)
                          }
                          onClick={() => handleTogglePublish(quiz)}
                        >
                          {quiz.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="hover:bg-background block w-full px-3 py-2 text-left text-sm"
                          onClick={() => handleOpenEdit(quiz)}
                        >
                          Settings
                        </button>
                        <div className="border-border my-1 border-t" />
                        <div className="px-3 py-1">
                          <DuplicateQuizButton
                            quiz={quiz}
                            onError={(message) =>
                              setActionError(message ? `${quiz.title}: ${message}` : '')
                            }
                            className="text-body hover:text-heading text-sm font-medium"
                          >
                            Duplicate
                          </DuplicateQuizButton>
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          className="text-danger hover:bg-background block w-full px-3 py-2 text-left text-sm disabled:opacity-40"
                          disabled={isDeleting || quiz.hasAttempts}
                          onClick={() => handleDelete(quiz)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <QuizDetailModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quiz={editingQuiz}
        onCreated={(created) => {
          if (created?.quizId) {
            navigate(`/admin/quizzes/launch?quizId=${created.quizId}&step=questions`);
          }
        }}
      />

      <BulkInviteModal
        isOpen={isBulkInviteOpen}
        onClose={() => setIsBulkInviteOpen(false)}
        quiz={selectedQuizForInvite}
      />
    </AdminShell>
  );
}
