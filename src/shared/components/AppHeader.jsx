import { Link } from 'react-router-dom';
import { useGetMeQuery } from '../../features/auth/authApi';

export default function AppHeader() {
  const token = localStorage.getItem('token');
  const { data: me } = useGetMeQuery(undefined, { skip: !token });
  const initials = (me?.name || 'ST')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ST';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 focus:outline-none">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-soft">
            Q
          </div>
          <span className="text-lg font-bold tracking-tight text-heading">QnA</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {me?.name ? (
          <span className="hidden text-sm font-medium text-muted sm:inline">{me.name}</span>
        ) : null}

        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm font-medium text-muted hover:bg-background hover:text-heading"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('studentId');
            window.location.href = '/login';
          }}
        >
          Log out
        </button>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-primary-soft text-sm font-medium text-primary"
          aria-label={me?.name ? `Signed in as ${me.name}` : 'User profile'}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
