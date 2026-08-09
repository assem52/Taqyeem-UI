import { Link } from 'react-router-dom';

const LOOPS = [
  { name: 'Launch', line: 'Every learner has a clear way in.' },
  { name: 'Sit', line: 'A fair timed attempt, finished once.' },
  { name: 'Learn', line: 'Results that teach, not just a score dump.' },
  { name: 'Coach', line: 'See who needs help — and act today.' },
  { name: 'Prove', line: 'One outcomes snapshot for stakeholders.' },
];

export default function PitchLandingPage() {
  return (
    <div className="min-h-screen bg-background text-body">
      <header className="border-border/80 border-b bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="font-display text-heading text-2xl tracking-tight">QnA</p>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-heading text-sm font-semibold hover:underline"
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
            className="pointer-events-none absolute inset-0 opacity-90"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 90% 70% at 10% 0%, hsl(340 18% 42% / 0.12), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 20%, hsl(220 18% 40% / 0.08), transparent 50%), linear-gradient(180deg, hsl(240 6% 14% / 0.03), transparent 40%)',
            }}
          />
          <div className="relative mx-auto flex min-h-[78vh] max-w-5xl flex-col justify-end px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
            <p className="font-display text-heading mb-4 text-5xl tracking-tight sm:text-7xl">
              QnA
            </p>
            <h1 className="font-display text-heading max-w-2xl text-2xl leading-snug tracking-tight sm:text-3xl">
              Invite a cohort. Run a fair quiz. See who needs help. Prove the outcome.
            </h1>
            <p className="text-body mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              The assessment & outcomes layer for cohort-based training — faster than an LMS,
              smarter than Forms.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-hover rounded-button px-5 py-3 text-sm font-semibold text-white shadow-soft"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="border-border bg-surface text-heading hover:bg-background rounded-button border px-5 py-3 text-sm font-semibold"
              >
                Create learner account
              </Link>
            </div>
          </div>
        </section>

        <section className="border-border border-t bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-heading text-2xl tracking-tight">
              Five loops operators actually finish
            </h2>
            <p className="text-muted mt-2 max-w-xl text-sm">
              Business products are remembered as loops, not screens.
            </p>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {LOOPS.map((loop, index) => (
                <li key={loop.name}>
                  <p className="text-muted text-xs font-semibold tracking-wider uppercase">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="font-display text-heading mt-2 text-xl">{loop.name}</p>
                  <p className="text-body mt-2 text-sm leading-relaxed">{loop.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-border border-t">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-heading text-2xl tracking-tight">
              How we package value
            </h2>
            <p className="text-muted mt-2 max-w-xl text-sm">
              Simple enough to say out loud. No billing gates in the demo.
            </p>
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-primary text-xs font-bold tracking-wider uppercase">Core</p>
                <h3 className="font-display text-heading mt-2 text-xl">Run the assessment</h3>
                <ul className="text-body mt-4 space-y-2 text-sm leading-relaxed">
                  <li>Create & publish quizzes</li>
                  <li>Invite cohort & track access</li>
                  <li>Fair timed attempt + basic results</li>
                </ul>
                <p className="text-muted mt-4 text-sm">Relief from Forms chaos.</p>
              </div>
              <div>
                <p className="text-primary text-xs font-bold tracking-wider uppercase">Growth</p>
                <h3 className="font-display text-heading mt-2 text-xl">Operate and prove</h3>
                <ul className="text-body mt-4 space-y-2 text-sm leading-relaxed">
                  <li>Results workbench & hard-question insights</li>
                  <li>Morning follow-up actions</li>
                  <li>Integrity review + outcomes snapshot / export</li>
                </ul>
                <p className="text-muted mt-4 text-sm">
                  Relief from spreadsheets and awkward LMS reporting.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-border border-t bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-heading text-2xl tracking-tight">
              Forms start. LMS overcomplicates. QnA finishes.
            </h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="text-muted border-border border-b text-xs tracking-wide uppercase">
                    <th className="py-3 pr-4 font-semibold">Need</th>
                    <th className="py-3 pr-4 font-semibold">Forms</th>
                    <th className="py-3 pr-4 font-semibold">LMS</th>
                    <th className="py-3 font-semibold">QnA</th>
                  </tr>
                </thead>
                <tbody className="text-body divide-border divide-y">
                  <tr>
                    <td className="py-3 pr-4 text-heading">Launch fast</td>
                    <td className="py-3 pr-4">Strong</td>
                    <td className="py-3 pr-4">Weak</td>
                    <td className="py-3 font-medium text-heading">Strong</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-heading">Who to chase tomorrow</td>
                    <td className="py-3 pr-4">Weak</td>
                    <td className="py-3 pr-4">Weak</td>
                    <td className="py-3 font-medium text-heading">Strong</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-heading">Learner leaves smarter</td>
                    <td className="py-3 pr-4">Weak</td>
                    <td className="py-3 pr-4">Medium</td>
                    <td className="py-3 font-medium text-heading">Strong</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-heading">Stakeholder-ready proof</td>
                    <td className="py-3 pr-4">Weak</td>
                    <td className="py-3 pr-4">Medium</td>
                    <td className="py-3 font-medium text-heading">Strong</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-border border-t">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="font-display text-heading text-2xl tracking-tight">
                Ready to run a cohort?
              </p>
              <p className="text-muted mt-2 text-sm">
                Operators sign in as admin. Learners register and verify.
              </p>
            </div>
            <Link
              to="/login"
              className="bg-primary hover:bg-primary-hover rounded-button px-5 py-3 text-sm font-semibold text-white"
            >
              Sign in to QnA
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
