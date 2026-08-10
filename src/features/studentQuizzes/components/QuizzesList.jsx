import { useState } from 'react';
import { useGetStudentQuizzesQuery } from '../studentQuizzesApi';
import QuizCard from './QuizCard';
<<<<<<< HEAD
import { Loader2, AlertCircle, HelpCircle, Search } from '../../../shared/components/Icons';

export default function QuizzesList({ searchTerm: propSearchTerm, onSearchChange: propOnSearchChange }) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  
  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : internalSearchTerm;
  const setSearchTerm = propOnSearchChange || setInternalSearchTerm;
=======
import { Loader2 } from '../../../shared/components/Icons';
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7

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
<<<<<<< HEAD
      <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center justify-center shadow-soft">
        <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
          <HelpCircle size={36} />
        </div>
        <h3 className="text-lg font-semibold text-heading mb-1">No Quizzes Assigned</h3>
        <p className="text-sm text-muted max-w-md">
          {data?.message || "You currently have no quizzes assigned to your student account."}
=======
      <div className="border-border bg-surface rounded-card border px-5 py-12 text-center">
        <h3 className="font-display text-heading text-lg">No quizzes yet</h3>
        <p className="text-muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">
          {data?.message ||
            'When an instructor invites you, quizzes will show up here.'}
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7
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
<<<<<<< HEAD
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
=======
    <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <li key={quiz.quizId} className="h-full">
          <QuizCard quiz={quiz} />
        </li>
      ))}
    </ul>
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7
  );
}
