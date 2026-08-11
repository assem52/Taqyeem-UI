import { useMemo, useState } from 'react';
import {
  useAddQuestionsFromBankMutation,
  useGetBankCategoriesQuery,
  useGetBankQuestionsQuery,
} from '../globalQuestionBankApi';

function errorMessage(error, fallback) {
  const value =
    error?.data?.message ??
    error?.data?.errors ??
    error?.data?.validationErrors ??
    error?.error;
  if (Array.isArray(value)) return value.join(' ');
  if (value && typeof value === 'object') return Object.values(value).flat().join(' ');
  return value || fallback;
}

export default function AddFromBankModal({ quizId, onClose, onAdded }) {
  const [categoryId, setCategoryId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [actionError, setActionError] = useState('');

  const categoriesQuery = useGetBankCategoriesQuery();
  const questionsQuery = useGetBankQuestionsQuery({
    categoryId: categoryId || undefined,
    q: search || undefined,
  });
  const [addFromBank, addState] = useAddQuestionsFromBankMutation();

  const categories = categoriesQuery.data ?? [];
  const questions = questionsQuery.data ?? [];
  const selectedCount = selected.size;

  const categoryCounts = useMemo(() => {
    const map = new Map(
      categories.map((category) => [category.categoryId, category.questionCount]),
    );
    return map;
  }, [categories]);

  const toggle = (bankQuestionId) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(bankQuestionId)) next.delete(bankQuestionId);
      else next.add(bankQuestionId);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!selectedCount) return;
    setActionError('');
    try {
      await addFromBank({
        quizId,
        bankQuestionIds: [...selected],
      }).unwrap();
      onAdded?.(selectedCount);
      onClose();
    } catch (error) {
      setActionError(errorMessage(error, 'Could not add questions from the bank.'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-from-bank-title"
    >
      <div className="bg-surface border-border flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border shadow-soft">
        <div className="border-border flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="add-from-bank-title" className="font-display text-heading text-xl">
              Add from question bank
            </h2>
            <p className="text-muted mt-1 text-sm">
              Filter by category, select questions, then copy them into this quiz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-heading text-sm font-medium"
          >
            Close
          </button>
        </div>

        <div className="border-border space-y-3 border-b px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryId('')}
              className={`rounded-button px-3 py-1.5 text-xs font-medium ${
                !categoryId
                  ? 'bg-primary text-white'
                  : 'border-border text-heading border'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.categoryId}
                type="button"
                onClick={() => setCategoryId(category.categoryId)}
                className={`rounded-button px-3 py-1.5 text-xs font-medium ${
                  categoryId === category.categoryId
                    ? 'bg-primary text-white'
                    : 'border-border text-heading border'
                }`}
              >
                {category.name}
                <span className="ml-1 opacity-80">
                  ({categoryCounts.get(category.categoryId) ?? 0})
                </span>
              </button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchInput.trim());
            }}
          >
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search…"
              className="border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 flex-1 rounded-input border px-3 py-2 text-sm outline-none focus:ring-2"
            />
            <button
              type="submit"
              className="border-border text-heading hover:bg-background rounded-button border px-3 py-2 text-sm font-medium"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {questionsQuery.isLoading ? (
            <p className="text-muted py-8 text-center text-sm">Loading bank…</p>
          ) : questions.length === 0 ? (
            <p className="text-muted py-8 text-center text-sm">No bank questions match.</p>
          ) : (
            <ul className="space-y-2">
              {questions.map((question) => {
                const checked = selected.has(question.bankQuestionId);
                return (
                  <li key={question.bankQuestionId}>
                    <label className="border-border hover:bg-background flex cursor-pointer gap-3 rounded-button border px-3 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(question.bankQuestionId)}
                        className="accent-primary mt-1 h-4 w-4"
                      />
                      <span className="min-w-0">
                        <span className="text-primary block text-[11px] font-semibold tracking-wide uppercase">
                          {question.categoryName}
                        </span>
                        <span className="text-heading mt-0.5 block text-sm">{question.text}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {actionError && (
          <p className="text-danger border-border border-t px-5 py-2 text-sm">{actionError}</p>
        )}

        <div className="border-border flex items-center justify-between gap-3 border-t px-5 py-4">
          <p className="text-muted text-sm">
            {selectedCount} selected
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border-border text-heading hover:bg-background rounded-button border px-3.5 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedCount || addState.isLoading}
              className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {addState.isLoading
                ? 'Adding…'
                : `Add ${selectedCount || ''} to quiz`.trim()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
