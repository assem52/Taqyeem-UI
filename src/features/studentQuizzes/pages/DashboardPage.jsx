import QuizzesList from '../components/QuizzesList';
import { Link } from 'react-router-dom';
import AppShell from '../../../shared/components/AppShell';
import { useGetMeQuery } from '../../auth/authApi';

export default function DashboardPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { data: me } = useGetMeQuery(undefined, { skip: !token });
  const unverified = me?.status === 'UNVERIFIED';

  return (
    <AppShell
      variant="student"
      title={me?.name ? `Welcome back, ${me.name.split(' ')[0]}` : 'Your quizzes'}
      subtitle="Open a quiz to continue, start, or review results."
    >
      {unverified ? (
        <div className="border-warning/25 bg-warning/5 text-warning mb-6 rounded-card border px-4 py-3 text-sm">
          Your email is not verified yet — quizzes stay locked until you verify.{' '}
          <Link
            to={`/verify?email=${encodeURIComponent(me?.email || '')}`}
            className="font-semibold underline"
          >
            Verify email
          </Link>
        </div>
      ) : null}

      <QuizzesList />
    </AppShell>
  );
}
