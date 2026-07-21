import QuizzesList from '../components/QuizzesList'

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">My quizzes</h1>
      <p className="mb-6 text-sm text-slate-500">
        Quizzes you are enrolled in, with your current status.
      </p>
      <QuizzesList />
    </main>
  )
}
