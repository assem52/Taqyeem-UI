import { STUDENT_QUIZ_STATE } from '../../../shared/models/enums/studentQuizState'

const STYLES = {
  [STUDENT_QUIZ_STATE.NOT_STARTED]: 'bg-slate-100 text-slate-700',
  [STUDENT_QUIZ_STATE.IN_PROGRESS]: 'bg-sky-100 text-sky-800',
  [STUDENT_QUIZ_STATE.SUBMITTED]: 'bg-emerald-100 text-emerald-800',
  [STUDENT_QUIZ_STATE.CLOSED]: 'bg-stone-100 text-stone-500',
}

export default function StatusPill({ state }) {
  const className = STYLES[state] ?? 'bg-slate-100 text-slate-600'

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {state}
    </span>
  )
}
