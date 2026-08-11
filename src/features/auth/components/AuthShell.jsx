import { Link } from 'react-router-dom';
import { ChevronLeft } from '../../../shared/components/Icons';

/**
 * Shared auth chrome — matches Taqyem design tokens (not the old slate login theme).
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-border/80 border-b bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <img
              src="/taqyem-logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover shadow-soft ring-1 ring-border/60"
            />
            <span className="font-display text-heading text-xl tracking-tight group-hover:opacity-90">
              Taqyem
            </span>
          </Link>
          <Link
            to="/"
            className="text-muted hover:text-heading flex items-center gap-1.5 text-xs font-semibold transition sm:text-sm"
          >
            <ChevronLeft size={16} />
            <span>Back to Homepage</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[420px]">
          <div className="border-border bg-surface rounded-dialog border p-7 shadow-soft sm:p-9">
            <h1 className="font-display text-heading text-2xl tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="text-muted mt-2 text-sm leading-relaxed">{subtitle}</p>
            ) : null}
            <div className="mt-7">{children}</div>
          </div>
          {footer ? (
            <div className="text-muted mt-6 text-center text-sm leading-relaxed">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export const authFieldClass =
  'border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2';

export const authLabelClass = 'text-heading mb-1.5 block text-sm font-medium';

export const authPrimaryBtnClass =
  'bg-primary hover:bg-primary-hover focus-visible:outline-primary w-full rounded-button px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
