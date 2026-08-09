import AppSidebar from './AppSidebar';

/**
 * App chrome with icon sidebar (student or admin).
 * Attempt pages should stay full-bleed and skip this shell.
 */
export default function AppShell({
  variant = 'student',
  title,
  subtitle,
  actions,
  children,
  wide = false,
}) {
  return (
    <div className="bg-background min-h-screen">
      <AppSidebar variant={variant} />
      <div className="sm:pl-[4.75rem]">
        <main
          className={`mx-auto w-full flex-1 px-4 py-8 pb-24 sm:px-6 sm:py-10 sm:pb-10 ${
            wide ? 'max-w-6xl' : 'max-w-5xl'
          }`}
        >
          {(title || subtitle || actions) && (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 max-w-xl">
                {title ? (
                  <h1 className="font-display text-heading text-2xl tracking-tight sm:text-3xl">
                    {title}
                  </h1>
                ) : null}
                {subtitle ? (
                  <p className="text-muted mt-1.5 text-sm leading-relaxed">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {actions}
                </div>
              ) : null}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
