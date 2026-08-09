import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetAdminQuizzesQuery,
  usePublishQuizMutation,
  useUnpublishQuizMutation,
  useDeleteQuizMutation,
} from '../adminQuizzesApi';
import QuizDetailModal from '../components/QuizDetailModal';
import BulkInviteModal from '../components/BulkInviteModal';
import InvitationTrackerTable from '../components/InvitationTrackerTable';
import DuplicateQuizButton from '../../questionBank/components/DuplicateQuizButton';
import AdminShell from '../../../shared/components/AdminShell';

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
  const [expandedTrackerQuizId, setExpandedTrackerQuizId] = useState(null);
  const [actionError, setActionError] = useState('');

  const { data: quizzes = [], isLoading, isError, refetch } = useGetAdminQuizzesQuery({
    search: search.trim() || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const [publishQuiz, { isLoading: isPublishing }] = usePublishQuizMutation();
  const [unpublishQuiz, { isLoading: isUnpublishing }] = useUnpublishQuizMutation();
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();

  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setIsQuizModalOpen(true);
  };

  const handleOpenEdit = (quiz) => {
    setEditingQuiz(quiz);
    setIsQuizModalOpen(true);
  };

  const handleOpenBulkInvite = (quiz) => {
    setSelectedQuizForInvite(quiz);
    setIsBulkInviteOpen(true);
  };

  const handleTogglePublish = async (quiz) => {
    setActionError('');
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
    try {
      await deleteQuiz(quiz.quizId).unwrap();
    } catch (err) {
      setActionError(err?.data?.message || 'Failed to delete quiz.');
    }
  };

  return (
    <AdminShell
      title="Quizzes"
      subtitle="Create assessments, manage questions, publish, and invite students."
      actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white transition"
        >
          New quiz
        </button>
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
          {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((st) => (
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
              : 'Start by creating a draft quiz, then add questions before publishing.'}
          </p>
          {!search && statusFilter === 'ALL' && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="bg-primary hover:bg-primary-hover mt-6 rounded-button px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create quiz
            </button>
          )}
        </div>
      ) : (
        <ul className="border-border bg-surface divide-border divide-y overflow-hidden rounded-card border">
          {quizzes.map((quiz) => {
            const isTrackerExpanded = expandedTrackerQuizId === quiz.quizId;
            const questionCount = quiz.questions?.length ?? 0;

            return (
              <li key={quiz.quizId} className="px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="font-display text-heading text-xl tracking-tight">
                        {quiz.title}
                      </h2>
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

                    {!quiz.isValid && quiz.validationErrors?.length > 0 && (
                      <div className="border-warning/25 bg-warning/5 text-warning mt-4 rounded-button border px-3 py-2 text-sm">
                        <p className="font-medium">Cannot publish yet</p>
                        <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs opacity-90">
                          {quiz.validationErrors.map((err) => (
                            <li key={err}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap lg:max-w-xs lg:justify-end">
                    <Link
                      to={`/admin/quizzes/${quiz.quizId}/questions`}
                      className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-center text-sm font-semibold text-white transition"
                    >
                      {quiz.hasAttempts ? 'View questions' : 'Questions'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(quiz)}
                      disabled={
                        isPublishing ||
                        isUnpublishing ||
                        (quiz.status !== 'PUBLISHED' && !quiz.isValid)
                      }
                      title={
                        quiz.status !== 'PUBLISHED' && !quiz.isValid
                          ? 'Fix validation issues before publishing'
                          : undefined
                      }
                      className="border-border text-heading hover:bg-background rounded-button border px-3.5 py-2 text-sm font-medium transition disabled:opacity-50"
                    >
                      {quiz.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>

                <div className="border-border mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-sm">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(quiz)}
                    className="text-body hover:text-heading font-medium"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenBulkInvite(quiz)}
                    className="text-body hover:text-heading font-medium"
                  >
                    Invite students
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTrackerQuizId(isTrackerExpanded ? null : quiz.quizId)
                    }
                    className="text-body hover:text-heading font-medium"
                    aria-expanded={isTrackerExpanded}
                  >
                    {isTrackerExpanded ? 'Hide invitations' : 'Invitations'}
                  </button>
                  <DuplicateQuizButton
                    quiz={quiz}
                    onError={(message) =>
                      setActionError(message ? `${quiz.title}: ${message}` : '')
                    }
                    className="text-body hover:text-heading font-medium"
                  >
                    {quiz.hasAttempts ? 'Duplicate to edit' : 'Duplicate'}
                  </DuplicateQuizButton>
                  <button
                    type="button"
                    onClick={() => handleDelete(quiz)}
                    disabled={isDeleting || quiz.hasAttempts}
                    title={
                      quiz.hasAttempts
                        ? 'Cannot delete a quiz with student attempts'
                        : 'Delete quiz'
                    }
                    className="text-danger hover:text-danger ml-auto font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>

                {isTrackerExpanded && (
                  <div className="mt-4">
                    <InvitationTrackerTable quizId={quiz.quizId} quizTitle={quiz.title} />
                  </div>
                )}
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
            navigate(`/admin/quizzes/${created.quizId}/questions`);
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
