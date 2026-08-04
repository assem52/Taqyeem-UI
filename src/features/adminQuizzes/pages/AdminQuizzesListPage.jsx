import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetAdminQuizzesQuery,
  usePublishQuizMutation,
  useUnpublishQuizMutation,
  useDeleteQuizMutation,
} from '../adminQuizzesApi';
import QuizDetailModal from '../components/QuizDetailModal';
import BulkInviteModal from '../components/BulkInviteModal';
import InvitationTrackerTable from '../components/InvitationTrackerTable';

export default function AdminQuizzesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
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
      setActionError(`[Quiz: "${quiz.title}"] ${msg}`);
    }
  };

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${quiz.title}"?`)) {
      return;
    }
    setActionError('');
    try {
      await deleteQuiz(quiz.quizId).unwrap();
    } catch (err) {
      setActionError(err?.data?.message || 'Failed to delete quiz.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              Q
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 leading-tight">
                Assessment Portal
              </h1>
              <p className="text-xs text-slate-400">Sprint 4 — Admin Quiz & Invitations Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Student View
            </Link>
            <Link
              to="/admin/quizzes"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 transition"
            >
              Quizzes & Invitations
            </Link>
            <Link
              to="/admin/follow-up"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Integrity Review
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner & Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Quiz Administration Dashboard
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Create, configure, publish quizzes, and dispatch bulk invitations to candidates.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span className="text-lg mr-2">+</span> Create New Quiz
          </button>
        </div>

        {/* Global Action Error Alert */}
        {actionError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex justify-between items-center animate-in fade-in duration-200">
            <div>
              <strong>Action Blocked:</strong> {actionError}
            </div>
            <button
              onClick={() => setActionError('')}
              className="text-rose-400 hover:text-rose-200 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search & Status Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quizzes by title or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-blue-500 transition"
            />
            <span className="absolute left-3.5 top-3 text-slate-500 text-sm">🔍</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Quizzes List / Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3"></div>
            <div>Loading quizzes...</div>
          </div>
        ) : isError ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
            <p className="text-rose-400 mb-4">Error loading quizzes from backend server.</p>
            <button
              onClick={refetch}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition"
            >
              Retry
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-12 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-bold text-slate-200">No Quizzes Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'No quizzes matched your search or status filter criteria.'
                : 'Click "Create New Quiz" to set up your first assessment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {quizzes.map((quiz) => {
              const isTrackerExpanded = expandedTrackerQuizId === quiz.quizId;

              return (
                <div
                  key={quiz.quizId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-slate-100">{quiz.title}</h3>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            quiz.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : quiz.status === 'ARCHIVED'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {quiz.status}
                        </span>

                        {!quiz.isValid && (
                          <span
                            title={quiz.validationErrors?.join(' | ')}
                            className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-help"
                          >
                            ⚠️ Unpublishable
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 max-w-2xl line-clamp-2">
                        {quiz.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        ⏱️ <span className="text-slate-300 font-semibold">{quiz.duration} mins</span>
                      </div>

                      <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        🎯 Pass: <span className="text-slate-300 font-semibold">{quiz.passScore !== null ? `${quiz.passScore}%` : 'N/A'}</span>
                      </div>

                      <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        ❓ Questions: <span className="text-slate-300 font-semibold">{quiz.questions?.length ?? 0}</span>
                      </div>

                      <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        👥 Attempts: <span className="text-slate-300 font-semibold">{quiz.attemptCount ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Schedule Bar */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div>
                      📅 Opens: <span className="text-slate-200 font-medium">{new Date(quiz.openDate).toLocaleString()}</span>
                    </div>
                    <div>
                      ⏳ Closes: <span className="text-slate-200 font-medium">{new Date(quiz.closesAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Question Validation Warning if invalid */}
                  {!quiz.isValid && quiz.validationErrors && quiz.validationErrors.length > 0 && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                      <strong>Cannot publish until resolved:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {quiz.validationErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Toolbar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(quiz)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        ✏️ Edit Settings
                      </button>

                      <button
                        onClick={() => handleOpenBulkInvite(quiz)}
                        className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        ✉️ Bulk Invite Students
                      </button>

                      <button
                        onClick={() =>
                          setExpandedTrackerQuizId(isTrackerExpanded ? null : quiz.quizId)
                        }
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                          isTrackerExpanded
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        📊 {isTrackerExpanded ? 'Hide Invitations' : 'View Invitations'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePublish(quiz)}
                        disabled={isPublishing || isUnpublishing}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                          quiz.status === 'PUBLISHED'
                            ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        }`}
                      >
                        {quiz.status === 'PUBLISHED' ? 'Unpublish' : 'Publish Quiz'}
                      </button>

                      <button
                        onClick={() => handleDelete(quiz)}
                        disabled={isDeleting || quiz.hasAttempts}
                        title={quiz.hasAttempts ? 'Cannot delete quiz with student attempts' : 'Delete Quiz'}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 disabled:opacity-40 border border-rose-500/20 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded Invitation Tracker Section */}
                  {isTrackerExpanded && (
                    <div className="pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">
                      <div className="mb-3 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-200">
                          Invitation Tracking & Lifecycle Log
                        </h4>
                        <span className="text-xs text-slate-400">Real-time status updates</span>
                      </div>
                      <InvitationTrackerTable quizId={quiz.quizId} quizTitle={quiz.title} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      <QuizDetailModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quiz={editingQuiz}
      />

      <BulkInviteModal
        isOpen={isBulkInviteOpen}
        onClose={() => setIsBulkInviteOpen(false)}
        quiz={selectedQuizForInvite}
      />
    </div>
  );
}
