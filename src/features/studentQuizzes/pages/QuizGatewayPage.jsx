import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGetStudentQuizQuery, useStartAttemptMutation } from '../studentQuizzesApi';
import StatusPill from '../components/StatusPill';
import { formatClosesAt } from '../../../shared/utils/formatDate';
import AccessDenied from '../../../shared/components/AccessDenied';
import QuizClosed from '../../../shared/components/QuizClosed';
import { isClosedReason } from '../../../shared/utils/isClosedReason';
import MessagePage from '../../../shared/components/MessagePage';
import AppHeader from '../../../shared/components/AppHeader';
import { Clock, Calendar, HelpCircle, Loader2, ChevronLeft } from '../../../shared/components/Icons';

export default function QuizGatewayPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { data: quiz, isLoading, isError, error } = useGetStudentQuizQuery(quizId);
  const [startAttempt, { isLoading: isStarting, isError: isStartError }] = useStartAttemptMutation();

  const handleStart = async () => {
    try {
      await startAttempt(quizId).unwrap();
      navigate(`/quizzes/${quizId}/attempt`);
    } catch {
      // Error is handled by isStartError in the UI
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center justify-center shadow-soft">
            <Loader2 size={36} className="text-primary mb-3" />
            <p className="text-sm font-medium text-heading">Loading quiz details…</p>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    if (error?.status === 403) {
      return <AccessDenied />;
    }

    const errorStr = typeof error?.data?.message === 'string' 
        ? error.data.message 
        : '';
        
    if (isClosedReason(errorStr)) {
        return <QuizClosed />;
    }

    if (error?.status === 404 || error?.status === 400) {
      return (
        <MessagePage 
          title="Unable to open quiz" 
          description={"The quiz or invitation could not be found.\nIt may have been removed or the link is no longer valid."} 
          secondaryButtonText="Go Back"
          onSecondaryAction={() => navigate(-1)}
        />
      );
    }

    // Handle network/server errors safely without exposing technical details
    return (
      <MessagePage 
        title="Something went wrong." 
        description="Please try again later." 
        secondaryButtonText="Go Back"
        onSecondaryAction={() => navigate(-1)}
      />
    );
  }

  if (!quiz) {
    return (
      <MessagePage 
        title="Unable to open quiz" 
        description={"The quiz or invitation could not be found.\nIt may have been removed or the link is no longer valid."} 
        secondaryButtonText="Go Back"
        onSecondaryAction={() => navigate(-1)}
      />
    );
  }

  if (quiz.canStart === false && isClosedReason(quiz.blockedReason)) {
    return <QuizClosed />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-medium text-muted hover:text-heading mb-6 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to dashboard
          </Link>

          <div className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-soft">
            {/* Title & Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border mb-6">
              <div>
                <h1 className="text-2xl font-bold text-heading tracking-tight">{quiz.title}</h1>
                {quiz.description && (
                  <p className="text-sm text-muted mt-1 leading-relaxed">{quiz.description}</p>
                )}
              </div>
              <StatusPill state={quiz.studentState} />
            </div>

            {/* Assessment Metadata Details Grid */}
            <div className="bg-background rounded-lg border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quiz.durationMinutes != null && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-md text-primary shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Duration</p>
                    <p className="text-sm font-medium text-heading">{quiz.durationMinutes} Minutes</p>
                  </div>
                </div>
              )}

              {quiz.score != null && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-md text-primary shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Current Score</p>
                    <p className="text-sm font-medium text-heading">{quiz.score}</p>
                  </div>
                </div>
              )}

              {quiz.opensAt && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-md text-primary shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Opens At</p>
                    <p className="text-sm font-medium text-heading">{formatClosesAt(quiz.opensAt)}</p>
                  </div>
                </div>
              )}

              {quiz.closesAt && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-md text-primary shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Closes At</p>
                    <p className="text-sm font-medium text-heading text-danger">{formatClosesAt(quiz.closesAt)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions Container */}
            <div className="bg-background rounded-lg border border-border p-5 mb-8">
              <h2 className="text-base font-bold text-heading mb-3">
                Rules & Guidelines
              </h2>
              {quiz.instructions ? (
                <div className="text-sm text-body whitespace-pre-wrap leading-relaxed">
                  {quiz.instructions}
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-2 text-sm text-muted leading-relaxed">
                  <li>Read every question carefully before selecting an answer.</li>
                  <li>Once you start, your timed attempt begins immediately.</li>
                  <li>Ensure you have a stable internet connection before starting.</li>
                  <li>Do not refresh or navigate away from the page while solving.</li>
                  <li>Closing the browser may automatically submit your current progress.</li>
                </ul>
              )}
            </div>

            {/* Error Notification */}
            {isStartError && (
              <div className="mb-6 rounded-md border border-danger/20 bg-danger/5 p-4 text-sm font-medium text-danger">
                Unable to start the quiz. Please try again.
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 border border-border bg-surface text-body hover:bg-background px-5 py-2.5"
              >
                Return to Dashboard
              </Link>

              {quiz.canStart ? (
                <button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out bg-primary text-surface hover:bg-primary-hover shadow-soft px-8 py-2.5 disabled:opacity-50"
                >
                  {isStarting && <Loader2 size={16} className="mr-2" />}
                  {isStarting ? 'Starting Quiz…' : 'Begin Assessment'}
                </button>
              ) : (
                <div className="w-full sm:w-auto rounded-button border border-warning/20 bg-warning/10 px-4 py-2.5 text-center text-sm font-medium text-warning">
                  {quiz.blockedReason}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
