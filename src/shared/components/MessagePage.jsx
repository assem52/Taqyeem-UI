import { Link } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppShell from './AppShell';

export default function MessagePage({
  title,
  description,
  buttonText = 'Back to quizzes',
  buttonLink = '/',
  secondaryButtonText,
  onSecondaryAction,
  icon: IconComponent,
}) {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const useShell = Boolean(token && (role === 'STUDENT' || role === 'ADMIN'));
  const variant = role === 'ADMIN' ? 'admin' : 'student';

  const body = (
    <div className="border-border bg-surface mx-auto w-full max-w-md rounded-card border px-6 py-10 text-center sm:px-8">
      {IconComponent ? (
        <div className="bg-primary-soft text-primary mb-5 inline-flex rounded-full p-3">
          <IconComponent size={28} />
        </div>
      ) : null}
      <h1 className="font-display text-heading text-2xl tracking-tight">{title}</h1>
      <p className="text-muted mx-auto mt-3 max-w-sm text-sm leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Link
          to={buttonLink}
          className="bg-primary hover:bg-primary-hover inline-flex w-full items-center justify-center rounded-button px-5 py-2.5 text-sm font-semibold text-white sm:w-auto"
        >
          {buttonText}
        </Link>
        {secondaryButtonText && onSecondaryAction ? (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="border-border text-heading hover:bg-background inline-flex w-full items-center justify-center rounded-button border px-5 py-2.5 text-sm font-medium sm:w-auto"
          >
            {secondaryButtonText}
          </button>
        ) : null}
      </div>
    </div>
  );

  if (useShell) {
    return (
      <AppShell variant={variant}>
        <div className="flex justify-center py-8">{body}</div>
      </AppShell>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">{body}</main>
    </div>
  );
}
