import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetInvitationQuery } from '../studentQuizzesApi';
import { useAcceptInvitationMutation } from '../../auth/authApi';
import AccessDenied from '../../../shared/components/AccessDenied';
import QuizClosed from '../../../shared/components/QuizClosed';
import { isClosedReason } from '../../../shared/utils/isClosedReason';
import MessagePage from '../../../shared/components/MessagePage';
import AppHeader from '../../../shared/components/AppHeader';
import { Loader2 } from '../../../shared/components/Icons';
import { useState } from 'react';

export default function InvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetInvitationQuery(token);
  const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
  const [acceptError, setAcceptError] = useState('');
  const [started, setStarted] = useState(false);

  const authToken = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const needsLogin = !authToken || role !== 'STUDENT';

  const handleContinue = async () => {
    setAcceptError('');
    if (needsLogin) {
      navigate(`/login?next=/invite/${token}`, { replace: true });
      return;
    }
    if (!data?.quizId) return;
    setStarted(true);
    try {
      await acceptInvitation(token).unwrap();
    } catch (err) {
      setAcceptError(
        err?.data?.message || 'Could not accept this invitation. You can still try opening the quiz.',
      );
    }
    navigate(`/quizzes/${data.quizId}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="flex flex-col items-center rounded-card border border-border bg-surface p-12 text-center shadow-soft">
            <Loader2 size={36} className="mb-4 text-primary" />
            <h3 className="text-xl font-bold text-heading">Checking your invite</h3>
            <p className="mt-2 text-sm text-muted">One moment…</p>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    if (error?.status === 403) return <AccessDenied />;
    const errorStr = typeof error?.data?.message === 'string' ? error.data.message : '';
    if (isClosedReason(errorStr)) return <QuizClosed />;
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
    return (
      <MessagePage
        title="Something went wrong."
        description="Please try again later."
        secondaryButtonText="Go Back"
        onSecondaryAction={() => navigate(-1)}
      />
    );
  }

  const quizTitle = data?.quizTitle || data?.title || 'your quiz';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg rounded-card border border-border bg-surface p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">You’re invited</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading">{quizTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {needsLogin
              ? 'Sign in with the invited email to open this quiz.'
              : 'Continue to accept this invite and open the quiz.'}
          </p>
          {acceptError ? (
            <p className="mt-4 rounded-button border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
              {acceptError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={isAccepting || started}
            onClick={handleContinue}
            className="mt-8 inline-flex w-full items-center justify-center rounded-button bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-hover disabled:opacity-50"
          >
            {(isAccepting || started) && <Loader2 size={16} className="mr-2" />}
            {needsLogin ? 'Sign in to continue' : 'Continue to quiz'}
          </button>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-muted hover:text-heading">
            Go to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
