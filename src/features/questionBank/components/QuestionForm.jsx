import { useState } from 'react';

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-hidden transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60';

function initialOptions(question, type) {
  if (type === 'TRUE_FALSE') {
    const correct = question?.options?.find((option) => option.isCorrect);
    const correctText = String(correct?.option ?? correct?.text ?? 'True').toLowerCase();
    return [
      { option: 'True', isCorrect: correctText === 'true' },
      { option: 'False', isCorrect: correctText === 'false' },
    ];
  }

  if (question?.options?.length) {
    return question.options.map((option) => ({
      option: option.option ?? option.text ?? '',
      isCorrect: Boolean(option.isCorrect),
    }));
  }

  return [
    { option: '', isCorrect: true },
    { option: '', isCorrect: false },
  ];
}

function getMessages(error) {
  const data = error?.data;
  const values = [
    data?.message,
    data?.errors,
    data?.validationErrors,
    data?.error,
  ].flatMap((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') return Object.values(value).flat();
    return [value];
  });
  return values.length ? values.map(String) : ['Unable to save the question.'];
}

export default function QuestionForm({
  question,
  onSave,
  onCancel,
  isSaving,
  onDirtyChange,
}) {
  const initialType =
    question?.type === 'TRUE_FALSE' ? 'TRUE_FALSE' : 'MCQ';
  const [text, setText] = useState(question?.text ?? '');
  const [type, setType] = useState(initialType);
  const [points, setPoints] = useState(question?.points ?? 1);
  const [options, setOptions] = useState(() => initialOptions(question, initialType));
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => {
    setIsDirty(true);
    onDirtyChange?.(true);
  };

  const handleTypeChange = (nextType) => {
    setType(nextType);
    setOptions(
      nextType === 'TRUE_FALSE'
        ? [
            { option: 'True', isCorrect: true },
            { option: 'False', isCorrect: false },
          ]
        : initialOptions(null, 'MCQ'),
    );
    markDirty();
  };

  const updateOption = (index, value) => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, option: value } : option,
      ),
    );
    markDirty();
  };

  const chooseCorrect = (index) => {
    setOptions((current) =>
      current.map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index,
      })),
    );
    markDirty();
  };

  const validate = () => {
    const errors = {};
    if (!text.trim()) errors.text = 'Question text is required.';
    if (!Number.isFinite(Number(points)) || Number(points) <= 0) {
      errors.points = 'Points must be greater than zero.';
    }
    if (options.length < 2) errors.options = 'At least two options are required.';
    if (options.some((option) => !option.option.trim())) {
      errors.options = 'Every option needs text.';
    }
    if (options.filter((option) => option.isCorrect).length !== 1) {
      errors.options = 'Select exactly one correct answer.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerErrors([]);
    if (!validate()) return;

    try {
      await onSave({
        text: text.trim(),
        type,
        points: Number(points),
        options: options.map((option, index) => ({
          option: option.option.trim(),
          isCorrect: option.isCorrect,
          position: index,
        })),
      });
      setIsDirty(false);
      onDirtyChange?.(false);
    } catch (error) {
      setServerErrors(getMessages(error));
    }
  };

  const handleCancel = () => {
    if (!isDirty || window.confirm('Discard your unsaved question changes?')) {
      onDirtyChange?.(false);
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-blue-500/30 bg-slate-900 p-5 shadow-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-100">
          {question ? 'Edit question' : 'Add question'}
        </h2>
        <span className="text-xs text-slate-500">* Required</span>
      </div>

      {serverErrors.length > 0 && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          <p className="font-semibold">The question could not be saved:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {serverErrors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="question-text" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Question text *
        </label>
        <textarea
          id="question-text"
          rows={3}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            markDirty();
          }}
          className={inputClass}
          aria-invalid={Boolean(fieldErrors.text)}
          aria-describedby={fieldErrors.text ? 'question-text-error' : undefined}
          autoFocus
        />
        {fieldErrors.text && <p id="question-text-error" className="mt-1 text-xs text-rose-300">{fieldErrors.text}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="question-type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Type *
          </label>
          <select
            id="question-type"
            value={type}
            onChange={(event) => handleTypeChange(event.target.value)}
            className={inputClass}
          >
            <option value="MCQ">Multiple choice</option>
            <option value="TRUE_FALSE">True / False</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">Open-ended authoring is not supported.</p>
        </div>
        <div>
          <label htmlFor="question-points" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Points *
          </label>
          <input
            id="question-points"
            type="number"
            min="0.01"
            step="0.01"
            value={points}
            onChange={(event) => {
              setPoints(event.target.value);
              markDirty();
            }}
            className={inputClass}
            aria-invalid={Boolean(fieldErrors.points)}
          />
          {fieldErrors.points && <p className="mt-1 text-xs text-rose-300">{fieldErrors.points}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Answers * <span className="normal-case font-normal text-slate-500">— choose one correct answer</span>
        </legend>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={`${type}-${index}`} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-answer"
                checked={option.isCorrect}
                onChange={() => chooseCorrect(index)}
                aria-label={`Mark option ${index + 1} correct`}
                className="h-4 w-4 accent-blue-500"
              />
              <input
                type="text"
                value={option.option}
                onChange={(event) => updateOption(index, event.target.value)}
                disabled={type === 'TRUE_FALSE'}
                aria-label={`Option ${index + 1}`}
                className={inputClass}
              />
              {type === 'MCQ' && options.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
                    markDirty();
                  }}
                  className="rounded-lg px-2 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
                  aria-label={`Remove option ${index + 1}`}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {fieldErrors.options && <p className="mt-2 text-xs text-rose-300">{fieldErrors.options}</p>}
        {type === 'MCQ' && (
          <button
            type="button"
            onClick={() => {
              setOptions((current) => [...current, { option: '', isCorrect: false }]);
              markDirty();
            }}
            className="mt-3 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            + Add option
          </button>
        )}
      </fieldset>

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : question ? 'Save changes' : 'Add question'}
        </button>
      </div>
    </form>
  );
}
