import { useState } from 'react';

const inputClass =
  'border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3.5 py-2.5 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50';

const labelClass = 'text-heading mb-1.5 block text-sm font-medium';

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
  const [explanation, setExplanation] = useState(question?.explanation ?? '');
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
        explanation: explanation.trim() || undefined,
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
      className="border-border bg-surface space-y-5 rounded-card border p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-heading text-xl">
          {question ? 'Edit question' : 'Add question'}
        </h2>
      </div>

      {serverErrors.length > 0 && (
        <div role="alert" className="border-danger/20 bg-danger/5 text-danger rounded-button border px-3 py-2 text-sm">
          <p className="font-medium">Could not save</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
            {serverErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="question-text" className={labelClass}>
          Question text
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
        {fieldErrors.text && (
          <p id="question-text-error" className="text-danger mt-1 text-xs">
            {fieldErrors.text}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="question-explanation" className={labelClass}>
          Explanation (shown after review unlocks)
        </label>
        <textarea
          id="question-explanation"
          rows={2}
          value={explanation}
          onChange={(event) => {
            setExplanation(event.target.value);
            markDirty();
          }}
          className={inputClass}
          placeholder="Optional teaching note for learners…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="question-type" className={labelClass}>
            Type
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
        </div>
        <div>
          <label htmlFor="question-points" className={labelClass}>
            Points
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
          {fieldErrors.points && (
            <p className="text-danger mt-1 text-xs">{fieldErrors.points}</p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>
          Answers
          <span className="text-muted ml-1 font-normal">— select one correct option</span>
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
                className="accent-primary h-4 w-4"
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
                    setOptions((current) =>
                      current.filter((_, optionIndex) => optionIndex !== index),
                    );
                    markDirty();
                  }}
                  className="text-danger px-2 py-2 text-xs font-medium"
                  aria-label={`Remove option ${index + 1}`}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {fieldErrors.options && (
          <p className="text-danger mt-2 text-xs">{fieldErrors.options}</p>
        )}
        {type === 'MCQ' && (
          <button
            type="button"
            onClick={() => {
              setOptions((current) => [...current, { option: '', isCorrect: false }]);
              markDirty();
            }}
            className="border-border text-heading hover:bg-background mt-3 rounded-button border px-3 py-1.5 text-xs font-medium"
          >
            Add option
          </button>
        )}
      </fieldset>

      <div className="border-border flex flex-wrap justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="border-border text-heading hover:bg-background rounded-button border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : question ? 'Save changes' : 'Add question'}
        </button>
      </div>
    </form>
  );
}
