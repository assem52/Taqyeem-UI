import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetInvitationQuery } from '../studentQuizzesApi';
import { useAcceptInvitationMutation } from '../../auth/authApi';
import AccessDenied from '../../../shared/components/AccessDenied';
import QuizClosed from '../../../shared/components/QuizClosed';
import { isClosedReason } from '../../../shared/utils/isClosedReason';
import MessagePage from '../../../shared/components/MessagePage';
import AppHeader from '../../../shared/components/AppHeader';
import { Loader2 } from '../../../shared/components/Icons';

export default function InvitationPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const acceptedRef = useRef(false);
    const { data, isLoading, isError, error } = useGetInvitationQuery(token);
    const [acceptInvitation] = useAcceptInvitationMutation();

    useEffect(() => {
        if (!data?.quizId || acceptedRef.current) return;

        const run = async () => {
            const authToken = localStorage.getItem('token');
            const role = localStorage.getItem('role');

            // Must be logged in as a student to create Enrollment from the invite.
            if (!authToken || role !== 'STUDENT') {
                navigate(`/login?next=/invite/${token}`, { replace: true });
                return;
            }

            acceptedRef.current = true;
            try {
                await acceptInvitation(token).unwrap();
            } catch {
                // Still send them to the quiz gateway; access check will explain denial.
            }
            navigate(`/quizzes/${data.quizId}`, { replace: true });
        };

        run();
    }, [data, navigate, token, acceptInvitation]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <AppHeader />
                <main className="flex-1 flex items-center justify-center p-8">
                    <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center shadow-soft">
                        <Loader2 size={36} className="text-primary mb-4" />
                        <h3 className="text-xl font-bold text-heading">Validating Invitation</h3>
                        <p className="text-sm text-muted mt-2">Please wait while we verify your invitation link...</p>
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

        return (
            <MessagePage
                title="Something went wrong."
                description="Please try again later."
                secondaryButtonText="Go Back"
                onSecondaryAction={() => navigate(-1)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center shadow-soft">
                    <Loader2 size={36} className="text-primary mb-4" />
                    <p className="text-sm font-medium text-heading">Accepting invitation…</p>
                </div>
            </main>
        </div>
    );
}
