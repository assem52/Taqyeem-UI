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
  const [csvError, setCsvError] = useState('');

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
      `Taqyem cohort outcomes — ${quiz?.title || 'Quiz'}`,
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
    setCsvError('');
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
    fetch(`${base}/analytics/quiz/${quizId}/export.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message || `Export failed (${res.status})`);
        }
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `quiz-${quizId}-results.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        setCsvError(err?.message || 'Could not export CSV. Try again.');
      });
  };

  return (
    <section
      id="outcomes-snapshot"
      className={`bg-surface rounded-card border p-6 sm:p-8 ${
        highlight ? 'border-primary ring-primary/15 ring-2' : 'border-border'
      }`}
      aria-label="Cohort outcomes snapshot"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
            Results
          </p>
          <h3 className="font-display text-heading mt-1.5 text-xl tracking-tight sm:text-2xl">
            {quiz?.title || 'Cohort outcomes'}
          </h3>
          <p className="text-muted mt-1.5 text-sm">
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
            className="text-primary text-sm font-semibold hover:underline"
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
      {csvError ? (
        <p role="alert" className="text-danger mt-3 text-sm">
          {csvError}
        </p>
      ) : null}

      <dl className="border-border mt-6 grid gap-5 border-t pt-6 sm:grid-cols-3">
        {[
          ['Invited', analytics?.invitedCount ?? '—'],
          ['Submitted', analytics?.submittedCount ?? '—'],
          ['Completion', analytics != null ? `${analytics.completionRate}%` : '—'],
          ['Pass rate', analytics != null ? `${analytics.passRate}%` : '—'],
          ['Avg score', analytics != null ? `${analytics.averageScore}%` : '—'],
          ['Needs review', needsReviewCount],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">
              {label}
            </dt>
            <dd className="font-display text-heading mt-1 text-2xl tabular-nums tracking-tight">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
