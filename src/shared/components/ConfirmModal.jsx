/**
 * ConfirmModal — product confirm dialog (never window.confirm).
 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClass =
    confirmTone === 'danger'
      ? 'bg-danger hover:bg-danger/90 text-white'
      : confirmTone === 'success'
        ? 'bg-success hover:bg-success/90 text-white'
        : 'bg-primary hover:bg-primary-hover text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-heading/40"
        aria-label="Dismiss"
        onClick={busy ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-soft"
      >
        <h2 id="confirm-modal-title" className="text-lg font-bold text-heading">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted whitespace-pre-wrap">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-button border border-border bg-surface px-4 py-2.5 text-sm font-medium text-body hover:bg-background disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`rounded-button px-4 py-2.5 text-sm font-medium shadow-soft disabled:opacity-50 ${confirmClass}`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
