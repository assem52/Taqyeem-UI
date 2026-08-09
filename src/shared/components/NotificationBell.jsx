import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from './Icons';
import { useGetStudentQuizzesQuery } from '../../features/studentQuizzes/studentQuizzesApi';
import { useGetAdminFollowUpQuery } from '../../features/adminFollowUp/adminFollowUpApi';

const SEEN_KEY = 'taqyem.notif.seenQuizIds';

function readSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSeen(ids) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

function useStudentInviteState(enabled) {
  const { data } = useGetStudentQuizzesQuery(undefined, {
    skip: !enabled,
    pollingInterval: 60_000,
  });
  const [seen, setSeen] = useState(() => readSeen());

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
    writeSeen(next);
  };

  const markOne = (quizId) => {
    const next = new Set(seen);
    next.add(quizId);
    setSeen(next);
    writeSeen(next);
  };

  return { invites, seen, unreadCount, markAllSeen, markOne };
}

export default function NotificationBell({ variant = 'student' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const student = useStudentInviteState(variant === 'student');
  const adminFollowUp = useGetAdminFollowUpQuery(undefined, {
    skip: variant !== 'admin',
    pollingInterval: 120_000,
  });
  const adminTotal = adminFollowUp.data?.summary?.total ?? 0;
  const badge =
    variant === 'admin' ? adminTotal : student.unreadCount;

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
          className="border-border bg-surface absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-card border p-3 shadow-soft sm:bottom-auto sm:top-0 sm:left-full sm:mb-0 sm:ml-2 sm:translate-x-0"
        >
          {variant === 'admin' ? (
            <>
              <p className="text-heading mb-2 text-sm font-semibold">Follow-up</p>
              {adminTotal === 0 ? (
                <p className="text-muted text-xs leading-relaxed">
                  No learners need a next step right now.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-body text-xs leading-relaxed">
                    <span className="text-heading font-semibold tabular-nums">
                      {adminTotal}
                    </span>{' '}
                    learner{adminTotal === 1 ? '' : 's'} need follow-up today.
                  </p>
                  <Link
                    to="/admin/follow-up"
                    onClick={() => setOpen(false)}
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    Open follow-up
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
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
                <ul className="max-h-64 space-y-1 overflow-y-auto">
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
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
