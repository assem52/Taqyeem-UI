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
    label: 'Morning follow-up',
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
      <header className="border-border bg-surface/95 sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <Link to="/admin/quizzes" className="font-display text-heading text-xl tracking-tight">
              QnA
            </Link>
            <p className="text-muted mt-0.5 text-xs">Cohort assessment & outcomes</p>
            <nav className="mt-2 flex flex-wrap gap-4 text-sm" aria-label="Admin">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      active
                        ? 'text-heading border-primary border-b-2 pb-0.5 font-medium'
                        : 'text-muted hover:text-heading'
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <button
              type="button"
              onClick={logout}
              className="text-muted hover:text-heading text-sm font-medium"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {(title || subtitle) && (
          <div className="mb-8 max-w-2xl">
            {title && (
              <h1 className="font-display text-heading text-3xl tracking-tight">{title}</h1>
            )}
            {subtitle && <p className="text-muted mt-2 text-sm leading-relaxed">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
