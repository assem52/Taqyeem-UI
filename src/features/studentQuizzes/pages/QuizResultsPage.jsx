import { Link, useParams } from 'react-router-dom';
import { useGetQuizResultsQuery } from '../studentQuizzesApi';
import AppHeader from '../../../shared/components/AppHeader';
import MessagePage from '../../../shared/components/MessagePage';
import { CheckCircle2, AlertCircle, Loader2, ChevronLeft } from '../../../shared/components/Icons';

function PassChip({ passed }) {
  if (passed === true) {
    return (
      <span className="rounded-md border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
        Passed
      </span>
    );
  }
  if (passed === false) {
    return (
      <span className="rounded-md border border-warning/20 bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
        Not yet
      </span>
    );
  }
  return null;
}

export default function QuizResultsPage() {
  const { quizId } = useParams();
  const { data, isLoading, isError, error } = useGetQuizResultsQuery(quizId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="flex flex-col items-center rounded-card border border-border bg-surface p-12 shadow-soft">
            <Loader2 size={36} className="mb-3 text-primary" />
            <p className="text-sm font-medium text-heading">Loading your results…</p>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    const message =
      typeof error?.data?.message === 'string'
        ? error.data.message
        : 'Results are not available yet.';
    return (
      <MessagePage
        icon={AlertCircle}
        title="Unable to load results"
        description={message}
        buttonText="Back to dashboard"
        buttonLink="/"
      />
    );
  }

  if (!data) {
    return (
      <MessagePage
        icon={AlertCircle}
        title="No results yet"
        description="Submit the quiz first to see how you did."
        buttonText="Back to dashboard"
        buttonLink="/"
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center text-sm font-medium text-muted transition-colors hover:text-heading"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to dashboard
          </Link>

          <div className="rounded-card border border-border bg-surface p-6 shadow-soft sm:p-8">
            <div className="mb-6 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                  Here’s how you did
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-heading">{data.title}</h1>
                <p className="mt-2 text-sm text-muted">{data.message}</p>
              </div>
              <PassChip passed={data.passed} />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Score</p>
                <p className="mt-1 text-2xl font-bold text-heading">
                  {data.score != null ? `${data.score}%` : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pass mark</p>
                <p className="mt-1 text-2xl font-bold text-heading">
                  {data.passScore != null ? `${data.passScore}%` : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Status</p>
                <p className="mt-1 text-sm font-semibold text-heading">
                  {data.status === 'AUTO_SUBMITTED' ? 'Auto-submitted' : 'Submitted'}
                </p>
              </div>
            </div>

            {!data.reviewUnlocked && data.reviewAvailableAt ? (
              <div className="mb-6 rounded-button border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-heading">
                Full review unlocks when the quiz closes ({new Date(data.reviewAvailableAt).toLocaleString()}).
              </div>
            ) : null}

            {data.review?.length ? (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-heading">Review</h2>
                {data.review.map((item, index) => (
                  <div
                    key={item.questionId}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-heading">
                        {index + 1}. {item.text}
                      </p>
                      {item.isCorrect === true ? (
                        <CheckCircle2 size={18} className="shrink-0 text-success" />
                      ) : item.isCorrect === false ? (
                        <AlertCircle size={18} className="shrink-0 text-warning" />
                      ) : null}
                    </div>
                    <p className="text-sm text-muted">
                      Your answer:{' '}
                      <span className="font-medium text-heading">
                        {item.selectedOptionText || item.textAnswer || '—'}
                      </span>
                    </p>
                    {item.correctOptionText != null ? (
                      <p className="mt-1 text-sm text-muted">
                        Correct:{' '}
                        <span className="font-medium text-heading">{item.correctOptionText}</span>
                      </p>
                    ) : null}
                    {item.explanation ? (
                      <p className="mt-2 text-sm leading-relaxed text-body">{item.explanation}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
