export default function QuestionCard({
  question,
  index,
  count,
  readOnly,
  isBusy,
  onEdit,
  onMove,
  onToggleVisibility,
  onRemove,
}) {
  const isHidden = Boolean(question.isHidden);
  const isSupported = question.type === 'MCQ' || question.type === 'TRUE_FALSE';

  return (
    <article
      className={`rounded-2xl border bg-slate-900 p-5 shadow-lg transition ${
        isHidden ? 'border-amber-500/30 opacity-75' : 'border-slate-800'
      }`}
      aria-labelledby={`question-${question.questionId ?? question.id}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-bold text-blue-300">
              Question {index + 1}
            </span>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400">
              {question.type === 'TRUE_FALSE' ? 'True / False' : question.type === 'MCQ' ? 'Multiple choice' : question.type}
            </span>
            <span className="text-xs text-slate-500">
              {question.points} {Number(question.points) === 1 ? 'point' : 'points'}
            </span>
            {isHidden && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">
                Hidden
              </span>
            )}
          </div>
          <h2
            id={`question-${question.questionId ?? question.id}`}
            className="whitespace-pre-wrap text-base font-semibold text-slate-100"
          >
            {question.text}
          </h2>
          {question.options?.length > 0 && (
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => (
                <li
                  key={option.optionId ?? option.id ?? optionIndex}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    option.isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-800 bg-slate-950/70 text-slate-400'
                  }`}
                >
                  <span className="mr-2 font-bold">{String.fromCharCode(65 + optionIndex)}.</span>
                  {option.option ?? option.text}
                  {option.isCorrect && <span className="sr-only"> (correct answer)</span>}
                </li>
              ))}
            </ol>
          )}
        </div>

        {!readOnly && (
          <div className="flex shrink-0 flex-wrap gap-2" aria-label={`Actions for question ${index + 1}`}>
            <div className="flex rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0 || isBusy}
                className="px-2.5 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Move question ${index + 1} up`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={index === count - 1 || isBusy}
                className="border-l border-slate-700 px-2.5 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Move question ${index + 1} down`}
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => onEdit(question)}
              disabled={isBusy || !isSupported}
              title={!isSupported ? 'This question type cannot be authored here' : undefined}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onToggleVisibility(question)}
              disabled={isBusy}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-40"
            >
              {isHidden ? 'Restore' : 'Hide'}
            </button>
            <button
              type="button"
              onClick={() => onRemove(question)}
              disabled={isBusy}
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
