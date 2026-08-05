import { useGetStudentQuizzesQuery } from '../studentQuizzesApi';
import QuizCard from './QuizCard';
import { Loader2, AlertCircle, HelpCircle } from '../../../shared/components/Icons';

export default function QuizzesList() {
  const { data, isLoading, isError } = useGetStudentQuizzesQuery();

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center justify-center shadow-soft">
        <Loader2 size={36} className="text-primary mb-3" />
        <p className="text-sm font-medium text-heading">Loading your quizzes…</p>
        <p className="text-xs text-muted mt-1">Please wait while we fetch your assigned assessments.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-danger/5 border border-danger/20 rounded-card p-8 text-center flex flex-col items-center justify-center">
        <AlertCircle size={36} className="text-danger mb-3" />
        <p className="text-sm font-semibold text-danger">Something went wrong loading your quizzes.</p>
        <p className="text-xs text-muted mt-1">Please check your connection and try refreshing the page.</p>
      </div>
    );
  }

  const quizzes = data?.quizzes ?? [];

  if (quizzes.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center justify-center shadow-soft">
        <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
          <HelpCircle size={36} />
        </div>
        <h3 className="text-lg font-semibold text-heading mb-1">No Quizzes Found</h3>
        <p className="text-sm text-muted max-w-md">
          {data?.message || "You currently have no quizzes assigned to your student account."}
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
      {quizzes.map((quiz) => (
        <li key={quiz.quizId} className="h-full">
          <QuizCard quiz={quiz} />
        </li>
      ))}
    </ul>
  );
}
