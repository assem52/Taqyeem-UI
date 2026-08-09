import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
} from '../adminQuizzesApi';

const fieldClass =
  'border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3.5 py-2.5 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50';

const labelClass = 'text-heading mb-1.5 block text-sm font-medium';

function buildInitialForm(quiz) {
  if (quiz) {
    return {
      title: quiz.title || '',
      description: quiz.description || '',
      instructions: quiz.instructions || '',
      duration: quiz.duration ?? 60,
      openDate: quiz.openDate ? quiz.openDate.slice(0, 16) : '',
      closesAt: quiz.closesAt ? quiz.closesAt.slice(0, 16) : '',
      passScore:
        quiz.passScore !== null && quiz.passScore !== undefined ? quiz.passScore : '',
      integrityThreshold: quiz.integrityThreshold ?? 5,
      resultsPolicy: quiz.resultsPolicy || 'AFTER_CLOSE',
    };
  }

  const now = new Date();
  const future = new Date(now.getTime() + 7 * 86400000);
  return {
    title: '',
    description: '',
    instructions: '',
    duration: 60,
    openDate: now.toISOString().slice(0, 16),
    closesAt: future.toISOString().slice(0, 16),
    passScore: 70,
    integrityThreshold: 5,
    resultsPolicy: 'AFTER_CLOSE',
  };
}

function QuizDetailForm({ quiz, onClose, onCreated }) {
  const navigate = useNavigate();
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const isEdit = Boolean(quiz && quiz.quizId);
  const [formData, setFormData] = useState(() => buildInitialForm(quiz));
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Quiz title is required');
      return;
    }
    if (!formData.openDate || !formData.closesAt) {
      setErrorMsg('Open date and close date are required');
      return;
    }
    if (new Date(formData.openDate) >= new Date(formData.closesAt)) {
      setErrorMsg('Open date must be before close date');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      instructions: formData.instructions.trim() || undefined,
      duration: Number(formData.duration) || 60,
      openDate: new Date(formData.openDate).toISOString(),
      closesAt: new Date(formData.closesAt).toISOString(),
      passScore: formData.passScore !== '' ? Number(formData.passScore) : null,
      integrityThreshold: Number(formData.integrityThreshold) || 5,
      resultsPolicy: formData.resultsPolicy || 'AFTER_CLOSE',
    };

    try {
      if (isEdit) {
        const softPayload = {
          id: quiz.quizId,
          title: payload.title,
          description: payload.description,
          instructions: payload.instructions,
          integrityThreshold: payload.integrityThreshold,
          resultsPolicy: payload.resultsPolicy,
        };
        const editPayload = quiz.hasAttempts
          ? softPayload
          : { id: quiz.quizId, ...payload };
        await updateQuiz(editPayload).unwrap();
        onClose();
      } else {
        const created = await createQuiz(payload).unwrap();
        onClose();
        if (onCreated) onCreated(created);
        else if (created?.quizId) {
          navigate(`/admin/quizzes/${created.quizId}/questions`);
        }
      }
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Failed to save quiz. Please try again.');
    }
  };

  const structureLocked = isEdit && quiz?.hasAttempts;

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-4 overflow-y-auto p-5">
      {errorMsg && (
        <div className="border-danger/20 bg-danger/5 text-danger rounded-button border px-3 py-2 text-sm">
          {errorMsg}
        </div>
      )}

      {structureLocked && (
        <div className="border-warning/25 bg-warning/5 text-warning rounded-button border px-3 py-2 text-sm">
          Attempts already exist, so timing and scoring structure stay locked. You can still edit
          title, description, instructions, integrity threshold, and results policy.
        </div>
      )}

      <div>
        <label htmlFor="quiz-title" className={labelClass}>
          Title
        </label>
        <input
          id="quiz-title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label htmlFor="quiz-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="quiz-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="quiz-instructions" className={labelClass}>
          Instructions (shown before start)
        </label>
        <textarea
          id="quiz-instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          rows={3}
          className={fieldClass}
          placeholder="What learners should know before they begin…"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quiz-duration" className={labelClass}>
            Duration (minutes)
          </label>
          <input
            id="quiz-duration"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min={1}
            disabled={structureLocked}
            className={fieldClass}
            required
          />
        </div>
        <div>
          <label htmlFor="quiz-pass" className={labelClass}>
            Pass score (%)
          </label>
          <input
            id="quiz-pass"
            type="number"
            name="passScore"
            value={formData.passScore}
            onChange={handleChange}
            min={0}
            max={100}
            disabled={structureLocked}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quiz-open" className={labelClass}>
            Opens
          </label>
          <input
            id="quiz-open"
            type="datetime-local"
            name="openDate"
            value={formData.openDate}
            onChange={handleChange}
            disabled={structureLocked}
            className={fieldClass}
            required
          />
          <p className="text-muted mt-1 text-xs">Window controls when a learner may start.</p>
        </div>
        <div>
          <label htmlFor="quiz-close" className={labelClass}>
            Closes
          </label>
          <input
            id="quiz-close"
            type="datetime-local"
            name="closesAt"
            value={formData.closesAt}
            onChange={handleChange}
            disabled={structureLocked}
            className={fieldClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quiz-integrity" className={labelClass}>
            Integrity review threshold
          </label>
          <input
            id="quiz-integrity"
            type="number"
            name="integrityThreshold"
            value={formData.integrityThreshold}
            onChange={handleChange}
            min={1}
            max={100}
            className={fieldClass}
          />
          <p className="text-muted mt-1 text-xs">Tab-away events at or above this need review.</p>
        </div>
        <div>
          <label htmlFor="quiz-results-policy" className={labelClass}>
            Results policy
          </label>
          <select
            id="quiz-results-policy"
            name="resultsPolicy"
            value={formData.resultsPolicy}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="AFTER_CLOSE">Score now, review after close</option>
            <option value="IMMEDIATE">Score + review right after submit</option>
            <option value="ADMIN_ONLY">Score only (no learner review)</option>
          </select>
        </div>
      </div>

      <div className="border-border flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isCreating || isUpdating
            ? 'Saving…'
            : isEdit
              ? 'Save'
              : 'Create & add questions'}
        </button>
      </div>
    </form>
  );
}

export default function QuizDetailModal({ isOpen, onClose, quiz = null, onCreated }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
        className="bg-surface border-border rounded-dialog w-full max-w-lg overflow-hidden border shadow-soft"
      >
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <h2 id="quiz-modal-title" className="font-display text-heading text-xl">
            {quiz?.quizId ? 'Quiz settings' : 'New quiz'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-heading text-sm font-medium"
          >
            Close
          </button>
        </div>
        <QuizDetailForm
          key={quiz?.quizId ?? 'new'}
          quiz={quiz}
          onClose={onClose}
          onCreated={onCreated}
        />
      </div>
    </div>
  );
}
