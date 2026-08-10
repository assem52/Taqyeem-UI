import { Link } from 'react-router-dom';

const LOOPS = [
  { name: 'Launch', line: 'Every learner has a clear way in.' },
  { name: 'Sit', line: 'A fair timed attempt, finished once.' },
  { name: 'Learn', line: 'Results that teach, not just a score.' },
  { name: 'Coach', line: 'See who needs help — and act today.' },
  { name: 'Prove', line: 'One outcomes snapshot for stakeholders.' },
];

export default function PitchLandingPage() {
  return (
    <div className="min-h-screen bg-background text-body">
      <header className="border-border/80 sticky top-0 z-20 border-b bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <p className="font-display text-heading flex items-center gap-2.5 text-xl tracking-tight">
            <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
              T
            </span>
            Taqyem
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-heading hover:bg-background rounded-button px-3 py-2 text-sm font-semibold transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-sm font-semibold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 90% 70% at 8% 0%, hsl(340 18% 42% / 0.1), transparent 55%), radial-gradient(ellipse 70% 50% at 95% 15%, hsl(220 12% 50% / 0.06), transparent 50%)',
            }}
          />
          <div className="relative mx-auto flex min-h-[72vh] max-w-5xl flex-col justify-end px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
            <p className="font-display text-heading mb-3 text-5xl tracking-tight sm:text-6xl">
              Taqyem
            </p>
            <h1 className="font-display text-heading max-w-2xl text-xl leading-snug tracking-tight sm:text-2xl">
              Invite a cohort. Run a fair quiz. See who needs help. Prove the outcome.
            </h1>
            <p className="text-body mt-4 max-w-lg text-base leading-relaxed">
              Assessment & outcomes for cohort training — faster than an LMS, smarter than Forms.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-hover rounded-button px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="border-border bg-surface text-heading hover:bg-background rounded-button border px-5 py-2.5 text-sm font-semibold"
              >
                Create learner account
              </Link>
            </div>
          </div>
        </section>

        <section className="border-border border-t bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <h2 className="font-display text-heading text-xl tracking-tight sm:text-2xl">
              Five loops operators finish
            </h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
              {LOOPS.map((loop, index) => (
                <li key={loop.name} className="border-border/0 lg:border-0">
                  <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="font-display text-heading mt-1.5 text-lg">{loop.name}</p>
                  <p className="text-muted mt-1.5 text-sm leading-relaxed">{loop.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-border border-t">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <h2 className="font-display text-heading text-xl tracking-tight sm:text-2xl">
              How value is packaged
            </h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              <div>
                <p className="text-primary text-[11px] font-bold tracking-wider uppercase">
                  Core
                </p>
                <h3 className="font-display text-heading mt-1.5 text-lg">Run the assessment</h3>
                <ul className="text-body mt-3 space-y-1.5 text-sm leading-relaxed">
                  <li>Create & publish quizzes</li>
                  <li>Invite cohort & track access</li>
                  <li>Fair timed attempt + basic results</li>
                </ul>
              </div>
              <div>
                <p className="text-primary text-[11px] font-bold tracking-wider uppercase">
                  Growth
                </p>
                <h3 className="font-display text-heading mt-1.5 text-lg">Operate and prove</h3>
                <ul className="text-body mt-3 space-y-1.5 text-sm leading-relaxed">
                  <li>Results workbench & hard questions</li>
                  <li>Morning follow-up actions</li>
                  <li>Integrity review + outcomes snapshot</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-border border-t bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <h2 className="font-display text-heading text-xl tracking-tight sm:text-2xl">
              Forms start. LMS overcomplicates. Taqyem finishes.
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="text-muted border-border border-b text-[11px] tracking-wide uppercase">
                    <th className="py-2.5 pr-4 font-semibold">Need</th>
                    <th className="py-2.5 pr-4 font-semibold">Forms</th>
                    <th className="py-2.5 pr-4 font-semibold">LMS</th>
                    <th className="py-2.5 font-semibold">Taqyem</th>
                  </tr>
                </thead>
                <tbody className="text-body divide-border divide-y">
                  {[
                    ['Launch fast', 'Strong', 'Weak', 'Strong'],
                    ['Who to chase tomorrow', 'Weak', 'Weak', 'Strong'],
                    ['Learner leaves smarter', 'Weak', 'Medium', 'Strong'],
                    ['Stakeholder-ready proof', 'Weak', 'Medium', 'Strong'],
                  ].map(([need, forms, lms, taqyem]) => (
                    <tr key={need}>
                      <td className="text-heading py-2.5 pr-4 font-medium">{need}</td>
                      <td className="py-2.5 pr-4">{forms}</td>
                      <td className="py-2.5 pr-4">{lms}</td>
                      <td className="text-heading py-2.5 font-medium">{taqyem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-border border-t">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 px-4 py-14 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="font-display text-heading text-xl tracking-tight">
                Ready to run a cohort?
              </p>
              <p className="text-muted mt-1.5 text-sm">
                Instructors sign in as admin. Learners register and verify.
              </p>
            </div>
            <Link
              to="/login"
              className="bg-primary hover:bg-primary-hover rounded-button px-5 py-2.5 text-sm font-semibold text-white"
            >
              Sign in to Taqyem
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
