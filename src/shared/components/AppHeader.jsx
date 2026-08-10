import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Search, Bell } from './Icons';
import { clearAuthSession } from '../utils/authSession';
import { useGetMeQuery } from '../../features/auth/authApi';
import { useGetStudentQuizzesQuery } from '../../features/studentQuizzes/studentQuizzesApi';

export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function deriveNotifications(quizzes) {
  if (!Array.isArray(quizzes) || quizzes.length === 0) {
    return [];
  }

  const notifications = [];
  const now = Date.now();

  for (const quiz of quizzes) {
    const quizId = quiz.quizId || quiz.id;
    const title = quiz.title || 'Untitled Quiz';
    const canStart = Boolean(quiz.canStart);
    const state = quiz.studentState;
    const opensAt = quiz.opensAt ? new Date(quiz.opensAt).getTime() : null;
    const closesAt = quiz.closesAt ? new Date(quiz.closesAt).getTime() : null;

    if (canStart || state === 'Available' || state === 'In progress') {
      notifications.push({
        id: `available-${quizId}`,
        quizId,
        type: 'AVAILABLE',
        title: 'Quiz Available',
        message: `"${title}" is now open and available to take.`,
        canNavigate: true,
        badgeColor: 'bg-success/15 text-success border-success/30',
        timestamp: quiz.opensAt ? new Date(quiz.opensAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
      });
    } else if (state === 'Upcoming' || (opensAt && opensAt > now)) {
      notifications.push({
        id: `upcoming-${quizId}`,
        quizId,
        type: 'UPCOMING',
        title: 'Upcoming Quiz',
        message: `"${title}" is scheduled and opens at ${quiz.opensAt ? new Date(quiz.opensAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'a future date'}.`,
        canNavigate: false,
        badgeColor: 'bg-primary-soft text-primary border-primary/20',
        timestamp: quiz.opensAt ? new Date(quiz.opensAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Upcoming',
      });
    }

    if (closesAt && closesAt > now && (closesAt - now) <= 24 * 60 * 60 * 1000 && state !== 'Submitted') {
      notifications.push({
        id: `closing-${quizId}`,
        quizId,
        type: 'CLOSING_SOON',
        title: 'Quiz Closing Soon',
        message: `"${title}" will close soon on ${new Date(quiz.closesAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}.`,
        canNavigate: canStart,
        badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        timestamp: 'Closing soon',
      });
    } else if (state === 'Closed' || (closesAt && closesAt <= now && state !== 'Submitted')) {
      notifications.push({
        id: `closed-${quizId}`,
        quizId,
        type: 'CLOSED',
        title: 'Quiz Closed',
        message: `"${title}" has ended and is no longer available.`,
        canNavigate: false,
        badgeColor: 'bg-muted/15 text-muted border-muted/30',
        timestamp: 'Ended',
      });
    }
  }

  return notifications;
}

export default function AppHeader({ searchTerm = '', onSearchChange }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isStudent = role === 'STUDENT';

  const { data: me } = useGetMeQuery(undefined, { skip: !token });
  const { data: quizzesData } = useGetStudentQuizzesQuery(undefined, { skip: !token || !isStudent });

  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState(new Set());
  const dropdownRef = useRef(null);

  const studentName = me?.name || localStorage.getItem('name') || '';
  const avatarInitials = getInitials(studentName);

  const quizzes = quizzesData?.quizzes ?? [];
  const notifications = useMemo(() => deriveNotifications(quizzes), [quizzes]);
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession(dispatch);
    window.location.href = '/login';
  };

  return (
    <header className="bg-surface border-border sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6 lg:px-8 shadow-sm font-sans">
      <div className="flex items-center gap-4">
        {/* Brand logo & platform title */}
        <Link to="/" className="flex items-center gap-3 focus:outline-none">
          <div className="bg-primary h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-soft">
            QP
          </div>
          <span className="text-lg font-bold tracking-tight text-heading">QuizPlatform</span>
        </Link>

      
      </div>

      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* Notifications Icon & Popover */}
        {isStudent && (
          <div className="relative">
            <button 
              type="button" 
              onClick={() => setShowNotifications(prev => !prev)}
              className="p-2 text-muted hover:text-heading relative rounded-full hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="bg-danger text-white text-[10px] font-bold absolute -right-1 -top-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-surface shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-card bg-surface border border-border shadow-md overflow-hidden font-sans">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/50">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-primary" />
                    <h3 className="font-semibold text-heading text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setReadIds(new Set(notifications.map(n => n.id)))}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted text-xs">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !readIds.has(n.id);
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            setReadIds(prev => new Set(prev).add(n.id));
                            if (n.canNavigate && n.quizId) {
                              setShowNotifications(false);
                              navigate(`/quizzes/${n.quizId}`);
                            }
                          }}
                          className={`p-3.5 flex items-start gap-3 transition-colors ${
                            n.canNavigate ? 'cursor-pointer hover:bg-background/80' : 'cursor-default'
                          } ${isUnread ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0 ${n.badgeColor}`}>
                            {n.type === 'AVAILABLE' ? 'Open' : n.type === 'UPCOMING' ? 'Soon' : n.type === 'CLOSING_SOON' ? 'Urgent' : 'End'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h4 className={`text-xs font-bold truncate ${isUnread ? 'text-heading' : 'text-body'}`}>
                                {n.title}
                              </h4>
                              <span className="text-[10px] text-muted shrink-0">{n.timestamp}</span>
                            </div>
                            <p className="text-xs text-muted leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="text-sm font-medium text-muted hover:text-heading px-2 py-1 rounded-md hover:bg-background"
          onClick={handleLogout}
        >
          Log out
        </button>

        {/* Profile Avatar / User Badge */}
        <div 
          className="h-8 w-8 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center border border-border tracking-wider shadow-sm" 
          aria-label={studentName ? `Profile: ${studentName}` : 'User Profile'}
          title={studentName || 'User Profile'}
        >
          {avatarInitials}

        </div>
      </div>
    </header>
  );
}
