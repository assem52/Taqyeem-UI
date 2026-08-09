import QuizzesList from '../components/QuizzesList';
import AppHeader from '../../../shared/components/AppHeader';

export default function DashboardPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 max-w-xl">
          <h1 className="font-display text-heading text-2xl tracking-tight sm:text-3xl">
            Your quizzes
          </h1>
          <p className="text-muted mt-1.5 text-sm leading-relaxed">
            Open a quiz to continue, start, or review results.
          </p>
        </header>
        <QuizzesList />
      </main>
    </div>
  );
}
