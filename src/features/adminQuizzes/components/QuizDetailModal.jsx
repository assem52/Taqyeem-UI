import { useState, useEffect } from 'react';
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
} from '../adminQuizzesApi';

export default function QuizDetailModal({ isOpen, onClose, quiz = null }) {
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();

  const isEdit = Boolean(quiz && quiz.quizId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    openDate: '',
    closesAt: '',
    passScore: 70,
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        duration: quiz.duration ?? 60,
        openDate: quiz.openDate ? quiz.openDate.slice(0, 16) : '',
        closesAt: quiz.closesAt ? quiz.closesAt.slice(0, 16) : '',
        passScore: quiz.passScore !== null && quiz.passScore !== undefined ? quiz.passScore : '',
      });
    } else {
      const now = new Date();
      const future = new Date(now.getTime() + 7 * 86400000);
      setFormData({
        title: '',
        description: '',
        duration: 60,
        openDate: now.toISOString().slice(0, 16),
        closesAt: future.toISOString().slice(0, 16),
        passScore: 70,
      });
    }
    setErrorMsg('');
  }, [quiz, isOpen]);

  if (!isOpen) return null;

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
        // If quiz has attempts, only title and description are allowed
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {isEdit ? 'Edit Quiz Settings' : 'Create New Quiz'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl font-bold px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {isEdit && quiz?.hasAttempts && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              ⚠️ <strong>Attempt Lock Active:</strong> Student attempts exist for this quiz. Structural properties (dates, duration, pass score) cannot be edited.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Quiz Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. JavaScript Fundamentals & Closures"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Description / Instructions
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief summary for students taking this assessment..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min={1}
                disabled={isEdit && quiz?.hasAttempts}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Pass Score (%)
              </label>
              <input
                type="number"
                name="passScore"
                value={formData.passScore}
                onChange={handleChange}
                min={0}
                max={100}
                placeholder="Optional (e.g. 70)"
                disabled={isEdit && quiz?.hasAttempts}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Open Date & Time *
              </label>
              <input
                type="datetime-local"
                name="openDate"
                value={formData.openDate}
                onChange={handleChange}
                disabled={isEdit && quiz?.hasAttempts}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Close Date & Time *
              </label>
              <input
                type="datetime-local"
                name="closesAt"
                value={formData.closesAt}
                onChange={handleChange}
                disabled={isEdit && quiz?.hasAttempts}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isCreating || isUpdating
                ? 'Saving...'
                : isEdit
                ? 'Save Changes'
                : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
