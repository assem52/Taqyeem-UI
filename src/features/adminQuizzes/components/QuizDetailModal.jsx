import { useState } from 'react';
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
      duration: quiz.duration ?? 60,
      openDate: quiz.openDate ? quiz.openDate.slice(0, 16) : '',
      closesAt: quiz.closesAt ? quiz.closesAt.slice(0, 16) : '',
      passScore:
        quiz.passScore !== null && quiz.passScore !== undefined ? quiz.passScore : '',
    };
  }

  const now = new Date();
  const future = new Date(now.getTime() + 7 * 86400000);
  return {
    title: '',
    description: '',
    duration: 60,
    openDate: now.toISOString().slice(0, 16),
    closesAt: future.toISOString().slice(0, 16),
    passScore: 70,
  };
}

function QuizDetailForm({ quiz, onClose }) {
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
      duration: Number(formData.duration) || 60,
      openDate: new Date(formData.openDate).toISOString(),
      closesAt: new Date(formData.closesAt).toISOString(),
      passScore: formData.passScore !== '' ? Number(formData.passScore) : null,
    };

    try {
      if (isEdit) {
        const editPayload = quiz.hasAttempts
          ? { id: quiz.quizId, title: payload.title, description: payload.description }
          : { id: quiz.quizId, ...payload };
        await updateQuiz(editPayload).unwrap();
      } else {
        await createQuiz(payload).unwrap();
      }
      onClose();
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Failed to save quiz. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-4 overflow-y-auto p-5">
      {errorMsg && (
        <div className="border-danger/20 bg-danger/5 text-danger rounded-button border px-3 py-2 text-sm">
          {errorMsg}
        </div>
      )}

      {isEdit && quiz?.hasAttempts && (
        <div className="border-warning/25 bg-warning/5 text-warning rounded-button border px-3 py-2 text-sm">
          Attempts already exist, so only the title and description can be changed. Duplicate the
          quiz to edit structure.
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
          rows={3}
          className={fieldClass}
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
            disabled={isEdit && quiz?.hasAttempts}
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
            disabled={isEdit && quiz?.hasAttempts}
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
            disabled={isEdit && quiz?.hasAttempts}
            className={fieldClass}
            required
          />
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
            disabled={isEdit && quiz?.hasAttempts}
            className={fieldClass}
            required
          />
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
          {isCreating || isUpdating ? 'Saving…' : isEdit ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  );
}

export default function QuizDetailModal({ isOpen, onClose, quiz = null }) {
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
        />
      </div>
    </div>
  );
}
