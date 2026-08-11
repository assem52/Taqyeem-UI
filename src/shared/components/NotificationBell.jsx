import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from './Icons';
import { useGetStudentQuizzesQuery } from '../../features/studentQuizzes/studentQuizzesApi';
import { useGetAdminFollowUpQuery } from '../../features/adminFollowUp/adminFollowUpApi';
import { useGetRecentSubmissionsQuery } from '../../features/adminQuizzes/adminQuizzesApi';

const SEEN_KEY = 'taqyem.notif.seenQuizIds';
const SEEN_SUBMISSIONS_KEY = 'taqyem.notif.seenSubmissionIds';

function readSeen(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSeen(key, ids) {
  localStorage.setItem(key, JSON.stringify([...ids]));
}

function formatWhen(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function useStudentInviteState(enabled) {
  const { data } = useGetStudentQuizzesQuery(undefined, {
    skip: !enabled,
    pollingInterval: 60_000,
  });
  const [seen, setSeen] = useState(() => readSeen(SEEN_KEY));

  const invites = useMemo(() => {
    const quizzes = data?.quizzes ?? [];
    return quizzes.filter(
      (q) =>
        q.studentState === 'Not started' || q.studentState === 'In progress',
    );
  }, [data]);

  const unreadCount = invites.filter((q) => !seen.has(q.quizId)).length;

  const markAllSeen = () => {
    const next = new Set(seen);
    invites.forEach((q) => next.add(q.quizId));
    setSeen(next);
    writeSeen(SEEN_KEY, next);
  };

  const markOne = (quizId) => {
    const next = new Set(seen);
    next.add(quizId);
    setSeen(next);
    writeSeen(SEEN_KEY, next);
  };

  return { invites, seen, unreadCount, markAllSeen, markOne };
}

function useAdminSubmissionState(enabled) {
  const { data = [], isLoading } = useGetRecentSubmissionsQuery(undefined, {
    skip: !enabled,
    pollingInterval: 60_000,
  });
  const followUp = useGetAdminFollowUpQuery(undefined, {
    skip: !enabled,
    pollingInterval: 120_000,
  });
  const [seen, setSeen] = useState(() => readSeen(SEEN_SUBMISSIONS_KEY));

  const submissions = Array.isArray(data) ? data : [];
  const unreadCount = submissions.filter((row) => !seen.has(row.attemptId)).length;
  const followUpTotal = followUp.data?.summary?.total ?? 0;

  const markAllSeen = () => {
    const next = new Set(seen);
    submissions.forEach((row) => next.add(row.attemptId));
    setSeen(next);
    writeSeen(SEEN_SUBMISSIONS_KEY, next);
  };

  const markOne = (attemptId) => {
    const next = new Set(seen);
    next.add(attemptId);
    setSeen(next);
    writeSeen(SEEN_SUBMISSIONS_KEY, next);
  };

  return {
    submissions,
    seen,
    unreadCount,
    followUpTotal,
    isLoading,
    markAllSeen,
    markOne,
  };
}

export default function NotificationBell({ variant = 'student' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const student = useStudentInviteState(variant === 'student');
  const admin = useAdminSubmissionState(variant === 'admin');
  const badge =
    variant === 'admin'
      ? admin.unreadCount + (admin.followUpTotal > 0 ? 1 : 0)
      : student.unreadCount;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition ${
          open
            ? 'bg-primary-soft text-primary'
            : 'text-muted hover:bg-background hover:text-heading'
        }`}
        aria-expanded={open}
        aria-label={
          badge > 0 ? `Notifications, ${badge} unread` : 'Notifications'
        }
      >
        <Bell size={20} />
        <span className="text-[10px] font-medium leading-none">Alerts</span>
        {badge > 0 ? (
          <span className="bg-danger absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="border-border bg-surface fixed inset-x-3 bottom-20 z-[60] flex h-[min(70vh,36rem)] w-auto flex-col overflow-hidden rounded-card border shadow-soft sm:inset-x-auto sm:top-4 sm:bottom-4 sm:left-[5.25rem] sm:h-auto sm:w-72"
        >
          {variant === 'admin' ? (
            <div className="flex h-full min-h-0 flex-col">
              <div className="border-border flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5">
                <p className="text-heading text-sm font-semibold">Notifications</p>
                {admin.unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={admin.markAllSeen}
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2.5">
                {admin.followUpTotal > 0 ? (
                  <div className="border-border bg-background mb-3 rounded-button border px-3 py-2.5">
                    <p className="text-heading text-xs font-semibold">Follow-up</p>
                    <p className="text-body mt-1 text-xs leading-relaxed">
                      <span className="font-semibold tabular-nums">{admin.followUpTotal}</span>{' '}
                      learner{admin.followUpTotal === 1 ? '' : 's'} need a next step.
                    </p>
                    <Link
                      to="/admin/follow-up"
                      onClick={() => setOpen(false)}
                      className="text-primary mt-1.5 inline-block text-xs font-semibold hover:underline"
                    >
                      Open follow-up
                    </Link>
                  </div>
                ) : null}

                <p className="text-muted mb-2 text-[11px] font-semibold tracking-wide uppercase">
                  Recent submissions
                </p>
                {admin.isLoading ? (
                  <p className="text-muted text-xs">Loading…</p>
                ) : admin.submissions.length === 0 ? (
                  <p className="text-muted text-xs leading-relaxed">
                    No submissions yet. Each learner submit appears here.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {admin.submissions.map((row) => {
                      const isUnread = !admin.seen.has(row.attemptId);
                      return (
                        <li key={row.attemptId}>
                          <Link
                            to={`/admin/attempts/${row.attemptId}`}
                            onClick={() => {
                              admin.markOne(row.attemptId);
                              setOpen(false);
                            }}
                            className={`hover:bg-background block rounded-button px-2 py-2 text-left transition ${
                              isUnread ? 'bg-primary-soft/50' : ''
                            }`}
                          >
                            <p className="text-heading text-xs font-semibold leading-snug">
                              {row.learnerName}
                              <span className="text-muted font-normal">
                                {' '}
                                submitted
                              </span>
                            </p>
                            <p className="text-heading mt-0.5 truncate text-[11px]">
                              {row.quizTitle}
                            </p>
                            <p className="text-muted mt-0.5 text-[10px]">
                              {row.score != null ? `${row.score}%` : 'Scored'}
                              {row.submittedAt
                                ? ` · ${formatWhen(row.submittedAt)}`
                                : ''}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col p-3">
              <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                <p className="text-heading text-sm font-semibold">Invites</p>
                {student.unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={student.markAllSeen}
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                ) : null}
              </div>
              {student.invites.length === 0 ? (
                <p className="text-muted text-xs leading-relaxed">
                  No quiz invites yet. When an instructor invites you, it shows
                  up here.
                </p>
              ) : (
                <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
                  {student.invites.map((quiz) => {
                    const isUnread = !student.seen.has(quiz.quizId);
                    return (
                      <li key={quiz.quizId}>
                        <Link
                          to={`/quizzes/${quiz.quizId}`}
                          onClick={() => {
                            student.markOne(quiz.quizId);
                            setOpen(false);
                          }}
                          className={`hover:bg-background block rounded-button px-2.5 py-2 text-left transition ${
                            isUnread ? 'bg-primary-soft/50' : ''
                          }`}
                        >
                          <p className="text-heading text-xs font-semibold leading-snug">
                            {quiz.title}
                          </p>
                          <p className="text-muted mt-0.5 text-[11px]">
                            {quiz.studentState === 'In progress'
                              ? 'Continue your attempt'
                              : 'You’re invited — open to start'}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
