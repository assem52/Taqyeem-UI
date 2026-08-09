import { useGetStudentQuizzesQuery } from '../studentQuizzesApi';
import QuizCard from './QuizCard';
import { Loader2 } from '../../../shared/components/Icons';

export default function QuizzesList() {
  const { data, isLoading, isError } = useGetStudentQuizzesQuery();

  if (isLoading) {
    return (
      <div className="text-muted flex items-center justify-center gap-2 py-16 text-sm">
        <Loader2 size={18} className="text-primary animate-spin" />
        Loading quizzes…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-danger/20 bg-danger/5 text-danger rounded-card border px-5 py-8 text-center text-sm">
        Could not load your quizzes. Refresh and try again.
      </div>
    );
  }

  const quizzes = data?.quizzes ?? [];

  if (quizzes.length === 0) {
    return (
      <div className="border-border bg-surface rounded-card border px-5 py-12 text-center">
        <h3 className="font-display text-heading text-lg">No quizzes yet</h3>
        <p className="text-muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">
          {data?.message ||
            'When an instructor invites you, quizzes will show up here.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <li key={quiz.quizId} className="h-full">
          <QuizCard quiz={quiz} />
        </li>
      ))}
    </ul>
  );
}
