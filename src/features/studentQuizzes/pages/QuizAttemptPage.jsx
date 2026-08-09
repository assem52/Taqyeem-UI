import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetAttemptQuery,
  useGetStudentQuizQuery,
  useSaveAnswerMutation,
  useSubmitAttemptMutation,
  useRecordVisibilityLostMutation,
} from '../studentQuizzesApi';
import MessagePage from '../../../shared/components/MessagePage';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from '../../../shared/components/Icons';

function formatCountdown(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function QuizAttemptPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { data: attempt, isLoading, isError } = useGetAttemptQuery(quizId);
  const { data: quiz } = useGetStudentQuizQuery(quizId);
  const [saveAnswerMutation] = useSaveAnswerMutation();
  const [submitAttempt, { isLoading: isSubmitting, isError: isSubmitError }] =
    useSubmitAttemptMutation();
  const [recordVisibilityLost] = useRecordVisibilityLostMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [isRestored, setIsRestored] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const debounceTimers = useRef({});
  const pendingAnswers = useRef({});
  const inFlightSaves = useRef({});
  const isMounted = useRef(true);
  const attemptIdRef = useRef(attempt?.id);
  const autoSubmitFired = useRef(false);

  useEffect(() => {
    attemptIdRef.current = attempt?.id;
  }, [attempt?.id]);

  const safeSetSaveStatus = useCallback((updater) => {
    if (isMounted.current) setSaveStatus(updater);
  }, []);

  const performSave = useCallback(
    async (questionId, value) => {
      const attemptId = attemptIdRef.current;
      if (!attemptId) return;

      const existingInFlight = inFlightSaves.current[questionId];
      if (existingInFlight) {
        try {
          await existingInFlight;
        } catch {
          // Ignore previous failure; retry with latest value.
        }
      }

      const isObject = value && typeof value === 'object';
      const selectedOptionId = isObject
        ? (value.selectedOptionId ?? null)
        : value;
      const textAnswer = isObject ? (value.textAnswer ?? null) : null;
      const payload = isObject
        ? { attemptId, questionId, selectedOptionId, textAnswer }
        : { attemptId, questionId, selectedOptionId: value, textAnswer: null };

      const savePromise = (async () => {
        safeSetSaveStatus('Saving...');
        try {
          await saveAnswerMutation(payload).unwrap();
          safeSetSaveStatus('Saved');
          setTimeout(
            () => safeSetSaveStatus((prev) => (prev === 'Saved' ? '' : prev)),
            2000,
          );
        } catch {
          safeSetSaveStatus('Retrying...');
          try {
            await saveAnswerMutation(payload).unwrap();
            safeSetSaveStatus('Saved');
            setTimeout(
              () => safeSetSaveStatus((prev) => (prev === 'Saved' ? '' : prev)),
              2000,
            );
          } catch {
            safeSetSaveStatus('Error saving');
          }
        }
      })();

      inFlightSaves.current[questionId] = savePromise;
      try {
        await savePromise;
      } finally {
        delete inFlightSaves.current[questionId];
      }
    },
    [saveAnswerMutation, safeSetSaveStatus],
  );

  const triggerSave = useCallback(
    (questionId, value) => {
      pendingAnswers.current[questionId] = value;
      if (debounceTimers.current[questionId]) {
        clearTimeout(debounceTimers.current[questionId]);
        delete debounceTimers.current[questionId];
      }
      safeSetSaveStatus('Saving...');
      debounceTimers.current[questionId] = setTimeout(async () => {
        delete debounceTimers.current[questionId];
        const val = pendingAnswers.current[questionId];
        delete pendingAnswers.current[questionId];
        if (val !== undefined) await performSave(questionId, val);
      }, 500);
    },
    [performSave, safeSetSaveStatus],
  );

  const flushPendingSaves = useCallback(async () => {
    const promises = [];
    for (const qId of Object.keys(debounceTimers.current)) {
      clearTimeout(debounceTimers.current[qId]);
      delete debounceTimers.current[qId];
      const value = pendingAnswers.current[qId];
      delete pendingAnswers.current[qId];
      if (value !== undefined) promises.push(performSave(qId, value));
    }
    for (const qId of Object.keys(pendingAnswers.current)) {
      const value = pendingAnswers.current[qId];
      delete pendingAnswers.current[qId];
      if (value !== undefined) promises.push(performSave(qId, value));
    }
    const inFlightPromises = Object.values(inFlightSaves.current);
    if (promises.length > 0 || inFlightPromises.length > 0) {
      await Promise.all([...promises, ...inFlightPromises]);
    }
  }, [performSave]);

  const runSubmit = useCallback(async () => {
    const attemptId = attemptIdRef.current;
    if (!attemptId || isSubmitting || isFlushing) return;
    try {
      setIsFlushing(true);
      await flushPendingSaves();
      await submitAttempt(attemptId).unwrap();
      navigate(`/quizzes/${quizId}/results`, { replace: true });
    } catch {
      // isSubmitError renders the failure.
    } finally {
      if (isMounted.current) setIsFlushing(false);
    }
  }, [flushPendingSaves, isFlushing, isSubmitting, navigate, quizId, submitAttempt]);

  useEffect(() => {
    if (attempt && !isRestored) {
      const restoredAnswers = {};
      if (attempt.attemptAnswers && typeof attempt.attemptAnswers === 'object') {
        for (const [qId, data] of Object.entries(attempt.attemptAnswers)) {
          if (data?.textAnswer != null && data.textAnswer !== '') {
            restoredAnswers[qId] = { textAnswer: data.textAnswer, selectedOptionId: null };
          } else if (data?.selectedOptionId != null) {
            restoredAnswers[qId] = data.selectedOptionId;
          }
        }
      }
      setAnswers(restoredAnswers);
      if (attempt.questions?.length > 0) {
        const firstUnanswered = attempt.questions.findIndex((q) => {
          const value = restoredAnswers[q.id];
          if (value == null) return true;
          if (typeof value === 'object') return !(value.textAnswer || '').trim();
          return value === '';
        });
        setCurrentIndex(
          firstUnanswered !== -1 ? firstUnanswered : attempt.questions.length - 1,
        );
      }
      if (typeof attempt.remainingSeconds === 'number') {
        setRemainingSeconds(attempt.remainingSeconds);
      }
      setIsRestored(true);
    }
  }, [attempt, isRestored]);

  useEffect(() => {
    if (remainingSeconds == null || attempt?.status !== 'IN_PROGRESS') return undefined;
    if (remainingSeconds <= 0) {
      if (!autoSubmitFired.current) {
        autoSubmitFired.current = true;
        runSubmit();
      }
      return undefined;
    }
    const id = setInterval(() => {
      setRemainingSeconds((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [remainingSeconds, attempt?.status, runSubmit]);

  useEffect(() => {
    if (!attempt?.id || attempt.status !== 'IN_PROGRESS') return undefined;
    const onVisibility = () => {
      if (document.hidden) {
        recordVisibilityLost(attempt.id).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [attempt?.id, attempt?.status, recordVisibilityLost]);

  useEffect(() => {
    isMounted.current = true;
    const currentTimers = debounceTimers.current;
    const currentPending = pendingAnswers.current;
    return () => {
      isMounted.current = false;
      for (const qId of Object.keys(currentTimers)) {
        clearTimeout(currentTimers[qId]);
        delete currentTimers[qId];
        const value = currentPending[qId];
        delete currentPending[qId];
        const attemptId = attemptIdRef.current;
        if (value !== undefined && attemptId) {
          const isObject = value && typeof value === 'object';
          saveAnswerMutation(
            isObject
              ? {
                  attemptId,
                  questionId: qId,
                  selectedOptionId: value.selectedOptionId ?? null,
                  textAnswer: value.textAnswer ?? null,
                }
              : {
                  attemptId,
                  questionId: qId,
                  selectedOptionId: value,
                  textAnswer: null,
                },
          );
        }
      }
    };
  }, [saveAnswerMutation]);

  if (isLoading || (attempt && !isRestored)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="flex flex-col items-center rounded-card border border-border bg-surface p-12 shadow-soft">
          <Loader2 size={36} className="mb-3 text-primary" />
          <p className="text-sm font-medium text-heading">Loading attempt…</p>
        </div>
      </div>
    );
  }

  if (
    attempt?.status === 'SUBMITTED' ||
    attempt?.status === 'AUTO_SUBMITTED'
  ) {
    return (
      <MessagePage
        icon={CheckCircle2}
        title="Here’s how you did"
        description="This quiz is already submitted. Open your results to see your score."
        buttonText="View results"
        buttonLink={`/quizzes/${quizId}/results`}
      />
    );
  }

  if (isError) {
    return (
      <MessagePage
        icon={AlertCircle}
        title="Unable to load attempt"
        description="There was a problem loading your quiz attempt. Please try again later."
        buttonText="Back to Dashboard"
      />
    );
  }

  if (!attempt || !attempt.questions || attempt.questions.length === 0) {
    return (
      <MessagePage
        icon={AlertCircle}
        title="No questions found"
        description="This quiz currently has no questions."
        buttonText="Back to Dashboard"
      />
    );
  }

  const questions = attempt.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const isAnsweredValue = (value) => {
    if (value == null || value === '') return false;
    if (typeof value === 'object') return Boolean((value.textAnswer || '').trim());
    return true;
  };

  const unansweredCount = questions.filter((q) => !isAnsweredValue(answers[q.id])).length;
  const answeredCount = totalQuestions - unansweredCount;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    triggerSave(questionId, optionId);
  };

  const handleTextChange = (questionId, text) => {
    const payload = { selectedOptionId: null, textAnswer: text };
    setAnswers((prev) => ({ ...prev, [questionId]: payload }));
    triggerSave(questionId, payload);
  };

  const openSubmitConfirm = () => setConfirmOpen(true);

  const renderQuestionOptions = (question) => {
    const opts = question.options || [];
    if (!opts.length) {
      return (
        <p className="rounded-button border border-warning/20 bg-warning/10 p-4 text-sm font-medium text-warning">
          This question has no answer options configured.
        </p>
      );
    }
    return opts.map((opt) => {
      const optValue = opt.id;
      const optLabel = opt.option || opt.text || opt.label;
      const isSelected = answers[question.id] === optValue;
      return (
        <label
          key={optValue}
          className={`flex cursor-pointer items-center gap-4 rounded-button border p-4 transition-all duration-200 ${
            isSelected
              ? 'border-primary bg-primary/5 font-medium text-heading ring-1 ring-primary/30'
              : 'border-border bg-surface text-body hover:bg-background'
          }`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            className="h-4 w-4 accent-primary"
            checked={isSelected}
            onChange={() => handleOptionSelect(question.id, optValue)}
          />
          <span className="text-sm">{optLabel}</span>
        </label>
      );
    });
  };

  const timerUrgent = remainingSeconds != null && remainingSeconds <= 60;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 shadow-sm sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
            Q
          </div>
          <h1 className="hidden max-w-md truncate text-base font-semibold text-heading sm:block">
            {quiz?.title || 'Quiz Attempt'}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          {saveStatus === 'Saving...' && (
            <span className="inline-flex animate-pulse items-center text-xs text-muted">
              <Save size={14} className="mr-1.5" />
              Saving...
            </span>
          )}
          {saveStatus === 'Saved' && (
            <span className="inline-flex items-center text-xs font-medium text-success">
              <CheckCircle2 size={14} className="mr-1.5" />
              Saved
            </span>
          )}
          {(saveStatus === 'Error saving' || saveStatus === 'Retrying...') && (
            <span className="inline-flex items-center text-xs font-medium text-danger">
              <AlertCircle size={14} className="mr-1.5" />
              {saveStatus}
            </span>
          )}

          {remainingSeconds != null && (
            <div
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums ${
                timerUrgent
                  ? 'border-danger/30 bg-danger/10 text-danger'
                  : 'border-border bg-background text-heading'
              }`}
              role="timer"
              aria-live={timerUrgent ? 'assertive' : 'polite'}
              aria-atomic="true"
              aria-label={`Time remaining ${formatCountdown(remainingSeconds)}`}
            >
              <Clock size={12} aria-hidden="true" />
              <span>{formatCountdown(remainingSeconds)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-heading shadow-sm">
            <span>
              {answeredCount}/{totalQuestions} answered
            </span>
          </div>
        </div>
      </header>

      <div className="h-1 w-full shrink-0 bg-border">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-6 lg:block">
          <h3 className="mb-4 text-sm font-semibold text-heading">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const answered = isAnsweredValue(answers[q.id]);
              return (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                      : answered
                        ? 'border-success/30 bg-success/15 text-success'
                        : 'border-border bg-surface text-muted hover:bg-background'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={openSubmitConfirm}
            disabled={isSubmitting || isFlushing}
            className="mt-8 inline-flex w-full items-center justify-center rounded-button bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting || isFlushing ? 'Submitting...' : 'Submit quiz'}
          </button>
          {isSubmitError && (
            <p className="mt-2 text-center text-xs font-medium text-danger">
              Failed to submit. Please try again.
            </p>
          )}
        </aside>

        <main className="flex flex-1 justify-center overflow-y-auto p-4 pb-28 sm:p-8 sm:pb-28">
          <div className="flex w-full max-w-3xl flex-col justify-between min-h-[500px]">
            <div>
              <div className="mb-6 lg:hidden">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-primary">{progressPercentage}% answered</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mb-6 rounded-card border border-border bg-surface p-6 shadow-soft sm:p-8">
                <span className="mb-4 inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  Question {currentIndex + 1}
                </span>
                <h2 className="mb-6 text-lg font-bold leading-snug text-heading sm:text-xl">
                  {currentQuestion.text}
                </h2>
                <div className="space-y-3">
                  {currentQuestion.type === 'MCQ' ||
                  currentQuestion.type === 'TRUE_FALSE' ? (
                    renderQuestionOptions(currentQuestion)
                  ) : currentQuestion.type === 'OPEN_ENDED' ? (
                    <textarea
                      className="w-full rounded-input border border-border bg-background p-4 text-sm text-heading shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={5}
                      placeholder="Type your answer here..."
                      value={
                        typeof answers[currentQuestion.id] === 'object'
                          ? answers[currentQuestion.id]?.textAnswer || ''
                          : answers[currentQuestion.id] || ''
                      }
                      onChange={(e) =>
                        handleTextChange(currentQuestion.id, e.target.value)
                      }
                    />
                  ) : (
                    <p className="rounded-button border border-warning/20 bg-warning/10 p-4 text-sm font-medium text-warning">
                      Unsupported question type.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0 || isSubmitting || isFlushing}
                className="inline-flex items-center rounded-button border border-border bg-surface px-5 py-2.5 text-sm font-medium text-body hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} className="mr-1.5" />
                Previous
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
                  }
                  disabled={isSubmitting || isFlushing}
                  className="inline-flex items-center rounded-button bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-hover disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} className="ml-1.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openSubmitConfirm}
                  disabled={isSubmitting || isFlushing}
                  className="inline-flex items-center rounded-button bg-success px-6 py-2.5 text-sm font-medium text-white shadow-soft disabled:opacity-50"
                >
                  {(isSubmitting || isFlushing) && (
                    <Loader2 size={16} className="mr-2" />
                  )}
                  Submit quiz
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-3 lg:hidden">
        <div className="mb-2 flex items-center justify-between gap-3">
          {remainingSeconds != null ? (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums ${
                timerUrgent
                  ? 'border-danger/30 bg-danger/10 text-danger'
                  : 'border-border bg-background text-heading'
              }`}
              role="timer"
              aria-live={timerUrgent ? 'assertive' : 'off'}
              aria-label={`Time remaining ${formatCountdown(remainingSeconds)}`}
            >
              <Clock size={12} aria-hidden="true" />
              {formatCountdown(remainingSeconds)}
            </div>
          ) : (
            <span className="text-xs text-muted">
              {answeredCount}/{totalQuestions} answered
            </span>
          )}
          <span className="text-xs font-medium text-muted">
            Q{currentIndex + 1}/{totalQuestions}
          </span>
        </div>
        <button
          type="button"
          onClick={openSubmitConfirm}
          disabled={isSubmitting || isFlushing}
          className="inline-flex w-full items-center justify-center rounded-button bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
        >
          {isSubmitting || isFlushing ? 'Submitting…' : 'Submit quiz'}
        </button>
        {isSubmitError ? (
          <p className="mt-2 text-center text-xs font-medium text-danger">
            Failed to submit. Please try again.
          </p>
        ) : null}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Submit this quiz?"
        description={
          unansweredCount > 0
            ? `You still have ${unansweredCount} unanswered question${unansweredCount === 1 ? '' : 's'}. Submit anyway?`
            : 'You can submit now. You won’t be able to change answers after this.'
        }
        confirmLabel="Submit quiz"
        confirmTone="success"
        busy={isSubmitting || isFlushing}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          runSubmit();
        }}
      />
    </div>
  );
}
