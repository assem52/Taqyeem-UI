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
  const typeLabel =
    question.type === 'TRUE_FALSE'
      ? 'True / False'
      : question.type === 'MCQ'
        ? 'Multiple choice'
        : question.type;

  return (
    <article
      className={`px-5 py-5 sm:px-6 ${isHidden ? 'bg-background/70' : ''}`}
      aria-labelledby={`question-${question.questionId ?? question.id}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            Question {index + 1}
            {' · '}
            {typeLabel}
            {' · '}
            {question.points} {Number(question.points) === 1 ? 'point' : 'points'}
            {isHidden ? ' · Hidden' : ''}
          </p>
          <h2
            id={`question-${question.questionId ?? question.id}`}
            className="font-display text-heading mt-1.5 text-lg leading-snug whitespace-pre-wrap"
          >
            {question.text}
          </h2>

          {question.options?.length > 0 && (
            <ol className="mt-4 space-y-1.5">
              {question.options.map((option, optionIndex) => (
                <li
                  key={option.optionId ?? option.id ?? optionIndex}
                  className={`text-sm ${
                    option.isCorrect ? 'text-heading font-medium' : 'text-body'
                  }`}
                >
                  <span className="text-muted mr-2 font-mono text-xs">
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                  {option.option ?? option.text}
                  {option.isCorrect && (
                    <span className="text-success ml-2 text-xs font-semibold">Correct</span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        {!readOnly && (
          <div
            className="flex shrink-0 flex-wrap gap-2"
            aria-label={`Actions for question ${index + 1}`}
          >
            <div className="border-border flex overflow-hidden rounded-button border">
              <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0 || isBusy}
                className="text-body hover:bg-background px-2.5 py-1.5 text-sm disabled:opacity-30"
                aria-label={`Move question ${index + 1} up`}
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={index === count - 1 || isBusy}
                className="border-border text-body hover:bg-background border-l px-2.5 py-1.5 text-sm disabled:opacity-30"
                aria-label={`Move question ${index + 1} down`}
              >
                Down
              </button>
            </div>
            <button
              type="button"
              onClick={() => onEdit(question)}
              disabled={isBusy || !isSupported}
              className="border-border text-heading hover:bg-background rounded-button border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onToggleVisibility(question)}
              disabled={isBusy}
              className="text-body hover:text-heading px-2 py-1.5 text-sm font-medium disabled:opacity-40"
            >
              {isHidden ? 'Restore' : 'Hide'}
            </button>
            <button
              type="button"
              onClick={() => onRemove(question)}
              disabled={isBusy}
              className="text-danger px-2 py-1.5 text-sm font-medium disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
