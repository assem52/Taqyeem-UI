import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminShell from '../../../shared/components/AdminShell';
import QuestionForm from '../components/QuestionForm';
import {
  useCreateBankCategoryMutation,
  useCreateBankQuestionMutation,
  useGetBankCategoriesQuery,
  useGetBankQuestionsQuery,
  useRemoveBankQuestionMutation,
  useUpdateBankQuestionMutation,
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

export default function GlobalQuestionBankPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [alert, setAlert] = useState('');
  const [actionError, setActionError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const categoriesQuery = useGetBankCategoriesQuery();
  const questionsQuery = useGetBankQuestionsQuery({
    categoryId: selectedCategoryId || undefined,
    q: search || undefined,
  });
  const [createQuestion, createState] = useCreateBankQuestionMutation();
  const [updateQuestion, updateState] = useUpdateBankQuestionMutation();
  const [removeQuestion, removeState] = useRemoveBankQuestionMutation();
  const [createCategory, createCategoryState] = useCreateBankCategoryMutation();

  const categories = categoriesQuery.data ?? [];
  const questions = questionsQuery.data ?? [];
  const totalCount = useMemo(
    () => categories.reduce((sum, category) => sum + (category.questionCount || 0), 0),
    [categories],
  );

  const closeForm = () => {
    setIsAdding(false);
    setEditingQuestion(null);
    setIsDirty(false);
  };

  const openAdd = () => {
    if (isDirty && !window.confirm('Discard unsaved question changes?')) return;
    setEditingQuestion(null);
    setIsAdding(true);
    setIsDirty(false);
  };

  const openEdit = (question) => {
    if (isDirty && !window.confirm('Discard unsaved question changes?')) return;
    setIsAdding(false);
    setEditingQuestion(question);
    setIsDirty(false);
  };

  const saveQuestion = async (body) => {
    if (editingQuestion) {
      await updateQuestion({
        bankQuestionId: editingQuestion.bankQuestionId,
        body,
      }).unwrap();
      setAlert('Bank question updated.');
    } else {
      await createQuestion(body).unwrap();
      setAlert('Question saved to the bank.');
    }
    setActionError('');
    closeForm();
  };

  const handleRemove = async (question) => {
    if (!window.confirm(`Remove “${question.text}” from the question bank?`)) {
      return;
    }
    setActionError('');
    try {
      await removeQuestion(question.bankQuestionId).unwrap();
      setAlert('Question removed from the bank.');
      if (editingQuestion?.bankQuestionId === question.bankQuestionId) {
        closeForm();
      }
    } catch (error) {
      setActionError(errorMessage(error, 'Failed to remove bank question.'));
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    setActionError('');
    try {
      const created = await createCategory({ name }).unwrap();
      setNewCategoryName('');
      setSelectedCategoryId(created.categoryId);
      setAlert(`Category “${created.name}” created.`);
    } catch (error) {
      setActionError(errorMessage(error, 'Failed to create category.'));
    }
  };

  const isLoading = categoriesQuery.isLoading || questionsQuery.isLoading;
  const isMutating =
    createState.isLoading ||
    updateState.isLoading ||
    removeState.isLoading ||
    createCategoryState.isLoading;

  return (
    <AdminShell
      wide
      title="Question Bank"
      subtitle="Browse persistent questions by category, then copy them into any quiz."
      actions={
        <button
          type="button"
          onClick={openAdd}
          disabled={isMutating || isLoading || categories.length === 0}
          className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add to bank
        </button>
      }
    >
      {isLoading ? (
        <p className="text-muted py-16 text-center text-sm">Loading question bank…</p>
      ) : categoriesQuery.isError ? (
        <div role="alert" className="border-border bg-surface rounded-card border px-6 py-10 text-center">
          <p className="text-danger text-sm">
            {errorMessage(categoriesQuery.error, 'Could not load categories.')}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div>
              <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                Categories
              </p>
              <div className="border-border bg-surface divide-border divide-y overflow-hidden rounded-card border">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId('')}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition ${
                    !selectedCategoryId
                      ? 'bg-primary-soft text-primary font-semibold'
                      : 'text-heading hover:bg-background'
                  }`}
                >
                  <span>All</span>
                  <span className="text-muted text-xs tabular-nums">{totalCount}</span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.categoryId}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.categoryId)}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition ${
                      selectedCategoryId === category.categoryId
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'text-heading hover:bg-background'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-muted text-xs tabular-nums">
                      {category.questionCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-2">
              <label htmlFor="new-category" className="text-heading block text-sm font-medium">
                New category
              </label>
              <input
                id="new-category"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="e.g. Biology"
                className="border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3 py-2 text-sm outline-none focus:ring-2"
              />
              <button
                type="submit"
                disabled={!newCategoryName.trim() || createCategoryState.isLoading}
                className="border-border text-heading hover:bg-background w-full rounded-button border px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                {createCategoryState.isLoading ? 'Creating…' : 'Add category'}
              </button>
            </form>
          </aside>

          <div className="space-y-5">
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(searchInput.trim());
              }}
            >
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search question text…"
                className="border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 min-w-[14rem] flex-1 rounded-input border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
              />
              <button
                type="submit"
                className="border-border text-heading hover:bg-background rounded-button border px-3.5 py-2 text-sm font-medium"
              >
                Search
              </button>
              {(search || searchInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSearchInput('');
                  }}
                  className="text-muted px-2 text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </form>

            {actionError && (
              <div
                role="alert"
                className="border-danger/20 bg-danger/5 text-danger flex justify-between gap-3 rounded-card border px-4 py-3 text-sm"
              >
                <span>{actionError}</span>
                <button type="button" onClick={() => setActionError('')} className="font-medium">
                  Close
                </button>
              </div>
            )}
            {alert && (
              <div
                role="status"
                className="border-success/20 bg-success/5 text-success flex justify-between gap-3 rounded-card border px-4 py-3 text-sm"
              >
                <span>{alert}</span>
                <button type="button" onClick={() => setAlert('')} className="font-medium">
                  Close
                </button>
              </div>
            )}

            {(isAdding || editingQuestion) && (
              <QuestionForm
                key={editingQuestion?.bankQuestionId ?? 'new-bank'}
                question={editingQuestion}
                categories={categories}
                initialCategoryId={selectedCategoryId || undefined}
                onSave={saveQuestion}
                onCancel={closeForm}
                isSaving={createState.isLoading || updateState.isLoading}
                onDirtyChange={setIsDirty}
              />
            )}

            {questionsQuery.isError ? (
              <p className="text-danger text-sm">
                {errorMessage(questionsQuery.error, 'Could not load bank questions.')}
              </p>
            ) : questions.length === 0 ? (
              <div className="border-border bg-surface rounded-card border px-6 py-14 text-center">
                <h2 className="font-display text-heading text-xl">No matching questions</h2>
                <p className="text-muted mx-auto mt-2 max-w-sm text-sm">
                  {categories.length === 0
                    ? 'Create a category, then add your first bank question.'
                    : 'Try another category, clear search, or add a new question to the bank.'}
                </p>
                {categories.length > 0 && !isAdding && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="bg-primary hover:bg-primary-hover mt-6 rounded-button px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Add to bank
                  </button>
                )}
              </div>
            ) : (
              <ul className="border-border bg-surface divide-border divide-y overflow-hidden rounded-card border">
                {questions.map((question) => (
                  <li
                    key={question.bankQuestionId}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                        {question.categoryName}
                      </p>
                      <p className="text-heading mt-1 text-sm font-medium">{question.text}</p>
                      <p className="text-muted mt-1 text-xs">
                        {question.type === 'TRUE_FALSE' ? 'True / False' : 'Multiple choice'}
                        {' · '}
                        {question.points} {Number(question.points) === 1 ? 'point' : 'points'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(question)}
                        disabled={isMutating}
                        className="border-border text-heading hover:bg-background rounded-button border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(question)}
                        disabled={isMutating}
                        className="text-danger rounded-button px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-muted text-xs">
              Tip: open a quiz workspace and use <span className="font-medium">Add from bank</span>{' '}
              to copy questions into that quiz.{' '}
              <Link to="/admin/quizzes" className="text-primary font-medium hover:underline">
                Go to quizzes
              </Link>
            </p>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
