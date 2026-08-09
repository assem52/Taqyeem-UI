import { Link, useLocation } from 'react-router-dom';

const NAV = [
  {
    to: '/admin/quizzes',
    label: 'Cohorts',
    match: (path) =>
      path.startsWith('/admin/quizzes') && !path.startsWith('/admin/follow-up'),
  },
  {
    to: '/admin/follow-up',
    label: 'Follow-up',
    match: (path) => path.startsWith('/admin/follow-up'),
  },
];

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/login';
}

export default function AdminShell({ title, subtitle, actions, children }) {
  const { pathname } = useLocation();

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border/80 bg-surface/90 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-8">
            <Link to="/admin/quizzes" className="flex shrink-0 items-center gap-2.5">
              <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-soft">
                T
              </span>
              <span className="font-display text-heading hidden text-lg tracking-tight sm:inline">
                Taqyem
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm" aria-label="Admin">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      active
                        ? 'text-heading bg-primary-soft rounded-button px-3 py-1.5 font-medium'
                        : 'text-muted hover:text-heading hover:bg-background rounded-button px-3 py-1.5 transition'
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={logout}
              className="text-muted hover:text-heading rounded-button px-2.5 py-1.5 text-sm font-medium transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {(title || subtitle || actions) && (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 max-w-xl">
              {title ? (
                <h1 className="font-display text-heading text-2xl tracking-tight sm:text-3xl">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="text-muted mt-1.5 text-sm leading-relaxed">{subtitle}</p>
              ) : null}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
