import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGetAdminQuizByIdQuery } from '../../adminQuizzes/adminQuizzesApi';
import GenerateWithAiModal from '../../ai/components/GenerateWithAiModal';
import AiSparklesIcon from '../../ai/components/AiSparklesIcon';
import AddFromBankModal from '../components/AddFromBankModal';
import DuplicateQuizButton from '../components/DuplicateQuizButton';
import QuestionCard from '../components/QuestionCard';
import QuestionForm from '../components/QuestionForm';
import AdminShell from '../../../shared/components/AdminShell';
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
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [alert, setAlert] = useState(location.state?.notice || '');
  const [actionError, setActionError] = useState('');
  const [showAiGenerate, setShowAiGenerate] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);

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

  const returnTo = location.state?.returnTo;

  const leavePage = () => {
    if (!isDirty || window.confirm('Leave and discard unsaved question changes?')) {
      navigate(returnTo || `/admin/quizzes/${quizId}`);
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
      setAlert('Question updated.');
    } else {
      await createQuestion({ quizId, body }).unwrap();
      setAlert('Question added.');
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
      setActionError('One or more questions are missing an ID, so order cannot be saved.');
      return;
    }
    setActionError('');
    try {
      await reorderQuestions({ quizId, questionIds }).unwrap();
      setAlert('Order updated.');
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
      setActionError(errorMessage(error, 'Failed to update visibility.'));
    }
  };

  const handleRemove = async (question) => {
    if (!window.confirm(`Remove “${question.text}” from this quiz?`)) return;
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
    if (isDirty && !window.confirm('Discard unsaved question changes?')) return;
    setIsAdding(false);
    setEditingQuestion(question);
    setIsDirty(false);
  };

  const openAddForm = () => {
    if (isDirty && !window.confirm('Discard unsaved question changes?')) return;
    setEditingQuestion(null);
    setIsAdding(true);
    setIsDirty(false);
  };

  const saveAiDrafts = async ({ drafts }) => {
    setAiSaving(true);
    setActionError('');
    try {
      for (const draft of drafts) {
        await createQuestion({
          quizId,
          body: {
            text: draft.text,
            explanation: draft.explanation,
            type: draft.type,
            points: draft.points || 1,
            options: draft.options,
          },
        }).unwrap();
      }
      setAlert(
        `Added ${drafts.length} AI-generated question${drafts.length === 1 ? '' : 's'} to this quiz.`,
      );
    } finally {
      setAiSaving(false);
    }
  };

  const isLoading = quizQuery.isLoading || questionsQuery.isLoading;
  const hasLoadError = quizQuery.isError || questionsQuery.isError;

  return (
    <AdminShell
      title={quiz?.title || 'Quiz questions'}
      subtitle="Author questions for this quiz, or copy persistent items from the shared question bank."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={leavePage}
            className="border-border text-heading hover:bg-background rounded-button border px-3.5 py-2 text-sm font-medium"
          >
            {returnTo ? 'Continue launch' : 'Back to workspace'}
          </button>
          <Link
            to="/admin/question-bank"
            className="border-border text-heading hover:bg-background rounded-button border px-3.5 py-2 text-sm font-medium"
          >
            Open bank
          </Link>
          <DuplicateQuizButton
            quiz={quiz}
            onError={setActionError}
            className="border-border text-heading hover:bg-background rounded-button border px-3.5 py-2 text-sm font-medium"
          >
            Duplicate
          </DuplicateQuizButton>
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={() => setShowAiGenerate(true)}
                disabled={isMutating || isLoading || aiSaving}
                className="ai-generate-btn border-primary/30 bg-primary-soft text-primary hover:bg-primary hover:text-white rounded-button inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50"
              >
                <AiSparklesIcon className="h-6 w-6" />
                Generate with AI
              </button>
              <button
                type="button"
                onClick={() => setShowBankPicker(true)}
                disabled={isMutating || isLoading}
                className="border-border text-heading hover:bg-background rounded-button border px-3.5 py-2 text-sm font-medium disabled:opacity-50"
              >
                Add from bank
              </button>
              <button
                type="button"
                onClick={openAddForm}
                disabled={isMutating || isLoading}
                className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Add question
              </button>
            </>
          )}
        </div>
      }
    >
      {isLoading ? (
        <p className="text-muted py-16 text-center text-sm">Loading questions…</p>
      ) : hasLoadError ? (
        <div role="alert" className="border-border bg-surface rounded-card border px-6 py-10 text-center">
          <p className="text-danger text-sm">
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
            className="border-border text-heading hover:bg-background mt-4 rounded-button border px-4 py-2 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-muted text-sm">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            {questionsQuery.isFetching ? ' · Refreshing…' : ''}
          </p>

          {readOnly && (
            <div className="border-warning/25 bg-warning/5 text-warning rounded-card border px-4 py-3 text-sm">
              This quiz has student attempts, so its structure is locked. Duplicate it to create an
              editable draft.
            </div>
          )}

          {quiz?.validationErrors?.length > 0 && (
            <div className="border-danger/20 bg-danger/5 text-danger rounded-card border px-4 py-3 text-sm">
              <p className="font-medium">Publish blockers</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                {quiz.validationErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {actionError && (
            <div role="alert" className="border-danger/20 bg-danger/5 text-danger flex justify-between gap-3 rounded-card border px-4 py-3 text-sm">
              <span>{actionError}</span>
              <button type="button" onClick={() => setActionError('')} className="font-medium">
                Close
              </button>
            </div>
          )}
          {alert && (
            <div role="status" className="border-success/20 bg-success/5 text-success flex justify-between gap-3 rounded-card border px-4 py-3 text-sm">
              <span>{alert}</span>
              <button type="button" onClick={() => setAlert('')} className="font-medium">
                Close
              </button>
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
            <div className="border-border bg-surface rounded-card border px-6 py-14 text-center">
              <h2 className="font-display text-heading text-xl">No questions yet</h2>
              <p className="text-muted mx-auto mt-2 max-w-sm text-sm">
                {readOnly
                  ? 'This quiz has no active questions.'
                  : 'Add a new question, or copy ones from the shared question bank.'}
              </p>
              {!readOnly && !isAdding && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAiGenerate(true)}
                    className="ai-generate-btn border-primary/30 bg-primary-soft text-primary hover:bg-primary hover:text-white rounded-button inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition"
                  >
                    <AiSparklesIcon className="h-6 w-6" />
                    Generate with AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBankPicker(true)}
                    className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
                  >
                    Add from bank
                  </button>
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Add first question
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ol className="border-border bg-surface divide-border divide-y overflow-hidden rounded-card border">
              {questions.map((question, index) => (
                <li key={questionId(question) ?? index}>
                  <QuestionCard
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
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {showBankPicker && !readOnly && (
        <AddFromBankModal
          quizId={quizId}
          onClose={() => setShowBankPicker(false)}
          onAdded={(count) => {
            setAlert(
              count === 1
                ? '1 question copied from the bank.'
                : `${count} questions copied from the bank.`,
            );
          }}
        />
      )}

      <GenerateWithAiModal
        open={showAiGenerate}
        onClose={() => setShowAiGenerate(false)}
        target="quiz"
        onSaveSelected={saveAiDrafts}
        saving={aiSaving}
      />
    </AdminShell>
  );
}
