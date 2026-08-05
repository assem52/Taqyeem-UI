export default function QuizFilter({
  options,
  selectedQuizId,
  onChange,
  disabled,
}) {
  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
      <label
        className="mb-2 block text-sm font-medium text-slate-700"
        htmlFor="follow-up-quiz-filter"
      >
        Filter by quiz
      </label>
      <select
        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 sm:max-w-md"
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
