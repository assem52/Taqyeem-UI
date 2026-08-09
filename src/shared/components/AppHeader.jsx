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
    <header className="border-border/80 bg-surface/90 sticky top-0 z-30 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
          <span className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-soft">
            T
          </span>
          <span className="font-display text-heading text-lg tracking-tight">Taqyem</span>
        </Link>

        <div className="flex items-center gap-3">
          {me?.name ? (
            <span className="text-muted hidden max-w-[10rem] truncate text-sm sm:inline">
              {me.name}
            </span>
          ) : null}

          <button
            type="button"
            className="text-muted hover:text-heading hover:bg-background rounded-button px-2.5 py-1.5 text-sm font-medium transition"
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
            className="border-border bg-primary-soft text-primary flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold"
            aria-label={me?.name ? `Signed in as ${me.name}` : 'User profile'}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
