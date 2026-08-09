import { Link } from 'react-router-dom';
import AppShell from '../../../shared/components/AppShell';
import { useGetMeQuery } from '../authApi';

export default function ProfilePage({ variant = 'student' }) {
  const token = localStorage.getItem('token');
  const { data: me, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token,
  });

  const home = variant === 'admin' ? '/admin/quizzes' : '/';

  return (
    <AppShell
      variant={variant}
      title="Profile"
      subtitle="Your Taqyem account details."
    >
      {isLoading ? (
        <p className="text-muted text-sm">Loading profile…</p>
      ) : null}
      {isError ? (
        <p className="text-danger text-sm">Could not load your profile.</p>
      ) : null}

      {me ? (
        <div className="border-border bg-surface max-w-lg rounded-card border p-6">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wider uppercase">
                Name
              </dt>
              <dd className="text-heading mt-1 font-medium">{me.name}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wider uppercase">
                Email
              </dt>
              <dd className="text-heading mt-1 font-medium">{me.email}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wider uppercase">
                Role
              </dt>
              <dd className="text-heading mt-1 font-medium">
                {me.role === 'ADMIN' ? 'Instructor' : 'Learner'}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wider uppercase">
                Status
              </dt>
              <dd className="text-heading mt-1 font-medium">
                {me.status === 'VERIFIED' ? 'Verified' : 'Unverified'}
              </dd>
            </div>
          </dl>

          {me.status === 'UNVERIFIED' ? (
            <p className="border-warning/25 bg-warning/5 text-warning mt-5 rounded-button border px-3 py-2 text-sm">
              Verify your email to unlock quizzes.{' '}
              <Link
                to={`/verify?email=${encodeURIComponent(me.email || '')}`}
                className="font-semibold underline"
              >
                Verify now
              </Link>
            </p>
          ) : null}

          <Link
            to={home}
            className="text-primary mt-6 inline-block text-sm font-semibold hover:underline"
          >
            Back to quizzes
          </Link>
        </div>
      ) : null}
    </AppShell>
  );
}
