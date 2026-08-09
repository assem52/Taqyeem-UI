export default function QuizFilter({
  options,
  selectedQuizId,
  onChange,
  disabled,
}) {
  return (
    <div className="mb-6">
      <label
        className="text-heading mb-1.5 block text-sm font-medium"
        htmlFor="follow-up-quiz-filter"
      >
        Filter by quiz
      </label>
      <select
        className="border-border bg-surface text-heading focus:border-primary focus:ring-primary/20 w-full max-w-md rounded-input border px-3.5 py-2.5 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        id="follow-up-quiz-filter"
        onChange={(event) => onChange(event.target.value)}
        value={selectedQuizId}
      >
        <option value="">All quizzes</option>
        {(options ?? []).map((option) => (
          <option key={option.quizId} value={option.quizId}>
            {option.quizTitle}
          </option>
        ))}
      </select>
    </div>
  )
}
