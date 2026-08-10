import { useState } from 'react';
import QuizzesList from '../components/QuizzesList';
import { Link } from 'react-router-dom';
import AppShell from '../../../shared/components/AppShell';
import { useGetMeQuery } from '../../auth/authApi';

export default function DashboardPage() {
<<<<<<< HEAD
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AppHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <header className="bg-surface border-border border-b px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-heading text-2xl font-bold tracking-tight">My Quizzes</h1>
          <p className="text-muted text-sm mt-1">
            Quizzes you are enrolled in, with your current status.
          </p>
=======
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
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7
        </div>
      ) : null}

<<<<<<< HEAD
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <QuizzesList searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
      </main>
    </div>
=======
      <QuizzesList />
    </AppShell>
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7
  );
}
