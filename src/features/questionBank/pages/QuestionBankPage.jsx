import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGetAdminQuizByIdQuery } from '../../adminQuizzes/adminQuizzesApi';
import DuplicateQuizButton from '../components/DuplicateQuizButton';
import QuestionCard from '../components/QuestionCard';
import QuestionForm from '../components/QuestionForm';
import {
  useCreateQuestionMutation,
  useGetQuizQuestionsQuery,
  useRemoveQuestionMutation,
  useReorderQuestionsMutation,
  useSetQuestionVisibilityMutation,
  useUpdateQuestionMutation,
} from '../questionBankApi';

function extractQuestions(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.questions)) return response.questions;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.questions)) return response.data.questions;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function questionId(question) {
  return question?.questionId ?? question?.id;
}

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

export default function QuestionBankPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [alert, setAlert] = useState(location.state?.notice || '');
  const [actionError, setActionError] = useState('');

  const quizQuery = useGetAdminQuizByIdQuery(quizId);
  const questionsQuery = useGetQuizQuestionsQuery(quizId);
  const [createQuestion, createState] = useCreateQuestionMutation();
  const [updateQuestion, updateState] = useUpdateQuestionMutation();
  const [reorderQuestions, reorderState] = useReorderQuestionsMutation();
  const [setVisibility, visibilityState] = useSetQuestionVisibilityMutation();
  const [removeQuestion, removeState] = useRemoveQuestionMutation();

  const quiz = quizQuery.data;
  const questions = useMemo(
    () => extractQuestions(questionsQuery.data),
    [questionsQuery.data],
  );
  const readOnly = Boolean(quiz?.hasAttempts || quiz?.canEditStructure === false);
  const isMutating =
    createState.isLoading ||
    updateState.isLoading ||
    reorderState.isLoading ||
    visibilityState.isLoading ||
    removeState.isLoading;

  useEffect(() => {
    if (!isDirty) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isDirty]);

  const leavePage = (event) => {
    event.preventDefault();
    if (!isDirty || window.confirm('Leave and discard your unsaved question changes?')) {
      navigate('/admin/quizzes');
    }
  };

  const closeForm = () => {
    setEditingQuestion(null);
    setIsAdding(false);
    setIsDirty(false);
  };

  const saveQuestion = async (body) => {
    if (editingQuestion) {
      await updateQuestion({
        quizId,
        questionId: questionId(editingQuestion),
        body,
      }).unwrap();
      setAlert('Question updated successfully.');
    } else {
      await createQuestion({ quizId, body }).unwrap();
      setAlert('Question added successfully.');
    }
    setActionError('');
    closeForm();
  };

  const moveQuestion = async (index, direction) => {
    const reordered = [...questions];
    const destination = index + direction;
    [reordered[index], reordered[destination]] = [
      reordered[destination],
      reordered[index],
    ];
    const questionIds = reordered.map(questionId);
    if (questionIds.some((id) => !id)) {
      setActionError('One or more questions have no ID, so their order cannot be saved.');
      return;
    }
    setActionError('');
    try {
      await reorderQuestions({ quizId, questionIds }).unwrap();
      setAlert('Question order updated.');
    } catch (error) {
      setActionError(errorMessage(error, 'Failed to reorder questions.'));
    }
  };

  const toggleVisibility = async (question) => {
    setActionError('');
    try {
      await setVisibility({
        quizId,
        questionId: questionId(question),
        isHidden: !question.isHidden,
      }).unwrap();
      setAlert(question.isHidden ? 'Question restored.' : 'Question hidden.');
    } catch (error) {
      setActionError(errorMessage(error, 'Failed to update question visibility.'));
    }
  };

  const handleRemove = async (question) => {
    if (
      !window.confirm(
        `Remove "${question.text}"? This removes it from the active question bank.`,
      )
    ) {
      return;
    }
    setActionError('');
    try {
      await removeQuestion({
        quizId,
        questionId: questionId(question),
      }).unwrap();
      setAlert('Question removed.');
      if (questionId(editingQuestion) === questionId(question)) closeForm();
    } catch (error) {
      setActionError(errorMessage(error, 'Failed to remove question.'));
    }
  };

  const openEditor = (question) => {
    if (isDirty && !window.confirm('Discard your current unsaved question changes?')) return;
    setIsAdding(false);
    setEditingQuestion(question);
    setIsDirty(false);
  };

  const openAddForm = () => {
    if (isDirty && !window.confirm('Discard your current unsaved question changes?')) return;
    setEditingQuestion(null);
    setIsAdding(true);
    setIsDirty(false);
  };

  const isLoading = quizQuery.isLoading || questionsQuery.isLoading;
  const hasLoadError = quizQuery.isError || questionsQuery.isError;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-lg font-bold shadow-md shadow-blue-500/20">
              Q
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold">Question Bank</h1>
              <p className="truncate text-xs text-slate-400">{quiz?.title || 'Quiz questions'}</p>
            </div>
          </div>
          <Link
            to="/admin/quizzes"
            onClick={leavePage}
            className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            ← Back to quizzes
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center text-slate-400">
            <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p>Loading question bank…</p>
          </div>
        ) : hasLoadError ? (
          <div role="alert" className="rounded-2xl border border-rose-500/30 bg-slate-900 p-8 text-center">
            <p className="mb-4 text-rose-300">
              {errorMessage(
                quizQuery.error ?? questionsQuery.error,
                'The question bank could not be loaded.',
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                quizQuery.refetch();
                questionsQuery.refetch();
              }}
              className="rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold hover:bg-slate-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-extrabold">{quiz?.title}</h2>
                    <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-400">
                      {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                    </span>
                    {questionsQuery.isFetching && (
                      <span className="text-xs text-blue-300" role="status">Refreshing…</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    Build and order multiple-choice and true/false questions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <DuplicateQuizButton
                    quiz={quiz}
                    onError={setActionError}
                    className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-300 hover:bg-indigo-500/20"
                  >
                    Duplicate quiz
                  </DuplicateQuizButton>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={openAddForm}
                      disabled={isMutating}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      + Add question
                    </button>
                  )}
                </div>
              </div>
            </section>

            {readOnly && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                <strong>Read-only:</strong> This quiz has student attempts, so its question structure is locked. Duplicate it to create an editable copy.
              </div>
            )}

            {quiz?.validationErrors?.length > 0 && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                <p className="font-semibold">Quiz validation issues:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {quiz.validationErrors.map((message) => <li key={message}>{message}</li>)}
                </ul>
              </div>
            )}

            {actionError && (
              <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                <span>{actionError}</span>
                <button type="button" onClick={() => setActionError('')} aria-label="Dismiss error" className="font-bold">×</button>
              </div>
            )}
            {alert && (
              <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                <span>{alert}</span>
                <button type="button" onClick={() => setAlert('')} aria-label="Dismiss message" className="font-bold">×</button>
              </div>
            )}

            {(isAdding || editingQuestion) && !readOnly && (
              <QuestionForm
                key={editingQuestion ? questionId(editingQuestion) : 'new'}
                question={editingQuestion}
                onSave={saveQuestion}
                onCancel={closeForm}
                isSaving={createState.isLoading || updateState.isLoading}
                onDirtyChange={setIsDirty}
              />
            )}

            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
                <div className="mb-3 text-4xl">📝</div>
                <h2 className="text-lg font-bold">No questions yet</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {readOnly ? 'This quiz has no active questions.' : 'Add the first question to start building this quiz.'}
                </p>
                {!readOnly && !isAdding && (
                  <button type="button" onClick={openAddForm} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500">
                    Add first question
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={questionId(question) ?? index}
                    question={question}
                    index={index}
                    count={questions.length}
                    readOnly={readOnly}
                    isBusy={isMutating}
                    onEdit={openEditor}
                    onMove={moveQuestion}
                    onToggleVisibility={toggleVisibility}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
