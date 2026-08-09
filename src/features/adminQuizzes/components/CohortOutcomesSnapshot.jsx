import { useEffect, useMemo, useState } from 'react';

function formatWhen(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function CohortOutcomesSnapshot({
  quiz,
  analytics,
  attempts = [],
  quizId,
  highlight = false,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!highlight) return;
    document.getElementById('outcomes-snapshot')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [highlight]);

  const needsReviewCount = useMemo(
    () => attempts.filter((row) => row.isFlagged).length,
    [attempts],
  );

  const summaryText = useMemo(() => {
    const lines = [
      `QnA cohort outcomes — ${quiz?.title || 'Quiz'}`,
      `Window: ${formatWhen(quiz?.openDate)} → ${formatWhen(quiz?.closesAt)}`,
      `Invited: ${analytics?.invitedCount ?? '—'}`,
      `Enrolled: ${analytics?.enrolledCount ?? '—'}`,
      `Submitted: ${analytics?.submittedCount ?? '—'}`,
      `Completion: ${analytics != null ? `${analytics.completionRate}%` : '—'}`,
      `Pass rate: ${analytics != null ? `${analytics.passRate}%` : '—'}`,
      `Average score: ${analytics != null ? `${analytics.averageScore}%` : '—'}`,
      `Needs review: ${needsReviewCount}`,
    ];
    return lines.join('\n');
  }, [quiz, analytics, needsReviewCount]);

  const downloadCsv = () => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
    fetch(`${base}/analytics/quiz/${quizId}/export.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `quiz-${quizId}-results.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  };

  return (
    <section
      id="outcomes-snapshot"
      className={`rounded-card border bg-surface p-6 sm:p-8 ${
        highlight ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
      aria-label="Cohort outcomes snapshot"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted text-xs font-semibold tracking-wider uppercase">
            Stakeholder snapshot
          </p>
          <h3 className="font-display text-heading mt-2 text-2xl tracking-tight sm:text-3xl">
            {quiz?.title || 'Cohort outcomes'}
          </h3>
          <p className="text-muted mt-2 text-sm">
            {formatWhen(quiz?.openDate)} → {formatWhen(quiz?.closesAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              const ok = await copyText(summaryText);
              if (ok) {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }
            }}
            className="border-border text-heading hover:bg-background rounded-button border px-3 py-1.5 text-sm font-medium"
          >
            {copied ? 'Copied' : 'Copy summary'}
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="border-border text-heading hover:bg-background rounded-button border px-3 py-1.5 text-sm font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>

      <dl className="mt-8 grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="text-muted text-xs font-semibold uppercase tracking-wider">Invited</dt>
          <dd className="font-display text-heading mt-1 text-3xl tabular-nums">
            {analytics?.invitedCount ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs font-semibold uppercase tracking-wider">Submitted</dt>
          <dd className="font-display text-heading mt-1 text-3xl tabular-nums">
            {analytics?.submittedCount ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs font-semibold uppercase tracking-wider">Completion</dt>
          <dd className="font-display text-heading mt-1 text-3xl tabular-nums">
            {analytics != null ? `${analytics.completionRate}%` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs font-semibold uppercase tracking-wider">Pass rate</dt>
          <dd className="font-display text-heading mt-1 text-3xl tabular-nums">
            {analytics != null ? `${analytics.passRate}%` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs font-semibold uppercase tracking-wider">Avg score</dt>
          <dd className="font-display text-heading mt-1 text-3xl tabular-nums">
            {analytics != null ? `${analytics.averageScore}%` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs font-semibold uppercase tracking-wider">Needs review</dt>
          <dd className="font-display text-heading mt-1 text-3xl tabular-nums">
            {needsReviewCount}
          </dd>
        </div>
      </dl>

      <p className="text-muted mt-8 max-w-2xl text-sm leading-relaxed">
        Proof for sponsors and mentors: who entered, who finished, who passed, and who still needs
        a human look — without rebuilding charts by hand.
      </p>
    </section>
  );
}
