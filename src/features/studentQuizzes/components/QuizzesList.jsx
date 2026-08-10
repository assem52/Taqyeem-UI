import { useState } from 'react';
import { useGetStudentQuizzesQuery } from '../studentQuizzesApi';
import QuizCard from './QuizCard';
import { Loader2, AlertCircle, HelpCircle, Search } from '../../../shared/components/Icons';

export default function QuizzesList({ searchTerm: propSearchTerm, onSearchChange: propOnSearchChange }) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  
  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : internalSearchTerm;
  const setSearchTerm = propOnSearchChange || setInternalSearchTerm;


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
      <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center justify-center shadow-soft">
        <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
          <HelpCircle size={36} />
        </div>
        <h3 className="text-lg font-semibold text-heading mb-1">No Quizzes Assigned</h3>
        <p className="text-sm text-muted max-w-md">
          {data?.message || "You currently have no quizzes assigned to your student account."}

        </p>
      </div>
    );
  }

  const query = searchTerm.trim().toLowerCase();
  const filteredQuizzes = quizzes.filter((quiz) => {
    if (!query) return true;
    const titleMatch = quiz.title ? quiz.title.toLowerCase().includes(query) : false;
    const descMatch = quiz.description ? quiz.description.toLowerCase().includes(query) : false;
    return titleMatch || descMatch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Search Bar Component */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="student-quiz-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quizzes by title or description..."
            className="w-full bg-surface border-border text-heading placeholder:text-muted h-10 rounded-input border pl-10 pr-10 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-heading transition-colors"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
        
        {searchTerm && (
          <span className="text-xs font-medium text-muted self-center sm:self-auto">
            Found {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
          </span>
        )}
      </div>

      {/* Quizzes List or Search Empty State */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center justify-center shadow-soft">
          <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
            <Search size={36} />
          </div>
          <h3 className="text-lg font-semibold text-heading mb-1">No Quizzes Found</h3>
          <p className="text-sm text-muted max-w-md mb-4">
            No quizzes matched &quot;{searchTerm}&quot;. Try searching with a different title or keyword.
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="inline-flex items-center justify-center rounded-button text-sm font-medium border border-border bg-surface text-heading hover:bg-background px-4 py-2 shadow-sm transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
          {filteredQuizzes.map((quiz) => (
            <li key={quiz.quizId} className="h-full">
              <QuizCard quiz={quiz} />
            </li>
          ))}
        </ul>
      )}
    </div>

  );
}
