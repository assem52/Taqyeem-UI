import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  LogOut,
  User,
  Users,
} from './Icons';
import NotificationBell from './NotificationBell';
import { useGetMeQuery } from '../../features/auth/authApi';

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('status');
  localStorage.removeItem('studentId');
  window.location.href = '/login';
}

function NavItem({ to, label, icon: Icon, isActive }) {
  return (
    <Link
      to={to}
      className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition ${
        isActive
          ? 'bg-primary-soft text-primary'
          : 'text-muted hover:bg-background hover:text-heading'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={20} />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  );
}

export default function AppSidebar({ variant = 'student' }) {
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');
  const { data: me } = useGetMeQuery(undefined, { skip: !token });
  const initials = (me?.name || (variant === 'admin' ? 'AD' : 'ST'))
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const home = variant === 'admin' ? '/admin/quizzes' : '/dashboard';
  const profile = variant === 'admin' ? '/admin/profile' : '/profile';

  const quizzesActive =
    variant === 'admin'
      ? pathname.startsWith('/admin/quizzes')
      : pathname === '/dashboard' || pathname === '/' || pathname.startsWith('/quizzes');
  const bankActive = pathname.startsWith('/admin/question-bank');
  const coachActive = pathname.startsWith('/admin/follow-up');
  const profileActive = pathname === profile;

  const nav = (
    <>
      <NavItem
        to={home}
        label="Quizzes"
        icon={ClipboardList}
        isActive={quizzesActive}
      />
      {variant === 'admin' ? (
        <NavItem
          to="/admin/question-bank"
          label="Bank"
          icon={BookOpen}
          isActive={bankActive}
        />
      ) : null}
      {variant === 'admin' ? (
        <NavItem
          to="/admin/follow-up"
          label="Coach"
          icon={Users}
          isActive={coachActive}
        />
      ) : null}
      <NavItem to={profile} label="Profile" icon={User} isActive={profileActive} />
    </>
  );

  return (
    <>
      <aside
        className="border-border bg-surface fixed inset-y-0 left-0 z-40 hidden w-[4.75rem] flex-col border-r sm:flex"
        aria-label={
          variant === 'admin' ? 'Instructor navigation' : 'Learner navigation'
        }
      >
        <div className="flex flex-1 flex-col items-center px-2 pt-4 pb-3">
          <Link
            to={home}
            className="mb-6 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-soft ring-1 ring-border/60"
            aria-label="Taqyem home"
          >
            <img
              src="/taqyem-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-cover"
            />
          </Link>

          <nav className="flex w-full flex-col items-stretch gap-1">{nav}</nav>

          <div className="mt-auto flex w-full flex-col items-stretch gap-1">
            <NotificationBell variant={variant} />
            <button
              type="button"
              onClick={logout}
              className="text-danger hover:bg-danger/10 flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition"
              aria-label="Log out"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-medium leading-none">Logout</span>
            </button>
            <div
              className="border-border bg-primary-soft text-primary mx-auto mt-2 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold"
              title={me?.name || 'Signed in'}
              aria-label={me?.name ? `Signed in as ${me.name}` : 'Profile avatar'}
            >
              {initials}
            </div>
          </div>
        </div>
      </aside>

      <nav
        className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t px-1 py-1.5 backdrop-blur-md sm:hidden"
        aria-label={
          variant === 'admin' ? 'Instructor navigation' : 'Learner navigation'
        }
      >
        {nav}
        <div className="flex min-w-[3.5rem] items-center justify-center">
          <NotificationBell variant={variant} />
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-danger flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-1 py-2"
          aria-label="Log out"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium leading-none">Logout</span>
        </button>
      </nav>
    </>
  );
}
