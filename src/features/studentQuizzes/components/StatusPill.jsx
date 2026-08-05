import { STUDENT_QUIZ_STATE } from '../../../shared/models/enums/studentQuizState';

const STYLES = {
  [STUDENT_QUIZ_STATE.NOT_STARTED]: 'bg-success/20 text-success border-success/30',
  [STUDENT_QUIZ_STATE.IN_PROGRESS]: 'bg-sky-500/15 text-sky-700 border-sky-300/40',
  [STUDENT_QUIZ_STATE.SUBMITTED]: 'bg-primary-soft text-primary border-primary/20',
  [STUDENT_QUIZ_STATE.CLOSED]: 'bg-muted/20 text-muted border-border',
};

export default function StatusPill({ state }) {
  const className = STYLES[state] ?? 'bg-muted/20 text-muted border-border';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border w-fit ${className}`}
    >
      {state}
    </span>
  );
}
