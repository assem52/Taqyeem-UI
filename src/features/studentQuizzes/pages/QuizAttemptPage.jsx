import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAttemptQuery, useGetStudentQuizQuery, useSaveAnswerMutation, useSubmitAttemptMutation, useRecordVisibilityLostMutation } from '../studentQuizzesApi';
import MessagePage from '../../../shared/components/MessagePage';
import { 
  ChevronLeft, 
  ChevronRight, 
  Wifi, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Clock 
} from '../../../shared/components/Icons';

export default function QuizAttemptPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const { data: attempt, isLoading, isError } = useGetAttemptQuery(quizId);
    const { data: quiz } = useGetStudentQuizQuery(quizId);
    const [saveAnswerMutation] = useSaveAnswerMutation();
    const [submitAttempt, { isLoading: isSubmitting, isError: isSubmitError }] = useSubmitAttemptMutation();
    const [recordVisibilityLost] = useRecordVisibilityLostMutation();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [saveStatus, setSaveStatus] = useState('');
    const [isRestored, setIsRestored] = useState(false);
    const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
    const [submissionScore, setSubmissionScore] = useState(null);
    const [isFlushing, setIsFlushing] = useState(false);

    // Timer & Warning states
    const [secondsRemaining, setSecondsRemaining] = useState(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [hasDismissedFiveMinWarning, setHasDismissedFiveMinWarning] = useState(false);
    const [hasDismissedOneMinWarning, setHasDismissedOneMinWarning] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showUnansweredModal, setShowUnansweredModal] = useState(false);

    const debounceTimers = useRef({});
    const pendingAnswers = useRef({});
    const inFlightSaves = useRef({});
    const isMounted = useRef(true);
    const hasAutoSubmittedRef = useRef(false);
    const attemptIdRef = useRef(attempt?.id);
    const latestVisibilityEventRef = useRef(null);
    const lastVisibilityStateRef = useRef(typeof document !== 'undefined' ? document.visibilityState : 'visible');

    useEffect(() => {
        attemptIdRef.current = attempt?.id;
    }, [attempt?.id]);

    const safeSetSaveStatus = useCallback((updater) => {
        if (isMounted.current) {
            setSaveStatus(updater);
        }
    }, []);

    const performSave = useCallback(async (questionId, value) => {
        const attemptId = attemptIdRef.current;
        if (!attemptId) return;

        const existingInFlight = inFlightSaves.current[questionId];
        if (existingInFlight) {
            try {
                await existingInFlight;
            } catch {
                // Ignore error from previous save attempt and proceed with latest value
            }
        }

        const savePromise = (async () => {
            safeSetSaveStatus('Saving...');
            try {
                await saveAnswerMutation({ 
                    attemptId, 
                    questionId, 
                    selectedOptionId: value 
                }).unwrap();
                safeSetSaveStatus('Saved');
                setTimeout(() => safeSetSaveStatus((prev) => (prev === 'Saved' ? '' : prev)), 2000);
            } catch {
                safeSetSaveStatus('Retrying...');
                try {
                    await saveAnswerMutation({ 
                        attemptId, 
                        questionId, 
                        selectedOptionId: value 
                    }).unwrap();
                    safeSetSaveStatus('Saved');
                    setTimeout(() => safeSetSaveStatus((prev) => (prev === 'Saved' ? '' : prev)), 2000);
                } catch {
                    safeSetSaveStatus('Error saving');
                    const originalSaved = attempt?.attemptAnswers?.[questionId]?.selectedOptionId;
                    setAnswers((prev) => {
                        const copy = { ...prev };
                        if (originalSaved != null && originalSaved !== '') {
                            copy[questionId] = originalSaved;
                        } else {
                            delete copy[questionId];
                        }
                        return copy;
                    });
                }
            }
        })();

        inFlightSaves.current[questionId] = savePromise;
        try {
            await savePromise;
        } finally {
            delete inFlightSaves.current[questionId];
        }
    }, [saveAnswerMutation, safeSetSaveStatus]);

    const triggerSave = useCallback((questionId, value) => {
        if (isTimeUp) return;

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
            if (val !== undefined) {
                await performSave(questionId, val);
            }
        }, 500);
    }, [performSave, safeSetSaveStatus, isTimeUp]);

    const flushPendingSaves = useCallback(async () => {
        const promises = [];

        const pendingTimerQuestionIds = Object.keys(debounceTimers.current);
        for (const qId of pendingTimerQuestionIds) {
            clearTimeout(debounceTimers.current[qId]);
            delete debounceTimers.current[qId];

            const value = pendingAnswers.current[qId];
            delete pendingAnswers.current[qId];

            if (value !== undefined) {
                promises.push(performSave(qId, value));
            }
        }

        const remainingPendingIds = Object.keys(pendingAnswers.current);
        for (const qId of remainingPendingIds) {
            const value = pendingAnswers.current[qId];
            delete pendingAnswers.current[qId];

            if (value !== undefined) {
                promises.push(performSave(qId, value));
            }
        }

        const inFlightPromises = Object.values(inFlightSaves.current);

        if (promises.length > 0 || inFlightPromises.length > 0) {
            await Promise.all([...promises, ...inFlightPromises]);
        }
    }, [performSave]);

    const performSubmit = useCallback(async () => {
        if (isSubmitting || isFlushing) return;
        const attemptId = attempt?.id;
        if (!attemptId) return;
        try {
            setIsFlushing(true);
            await flushPendingSaves();
            const res = await submitAttempt(attemptId).unwrap();
            if (res) {
                setSubmissionScore(res.score ?? res);
            }
            setIsSubmittedSuccessfully(true);
        } catch {
            // isSubmitError will handle rendering the error in the UI
        } finally {
            if (isMounted.current) {
                setIsFlushing(false);
            }
        }
    }, [attempt?.id, isSubmitting, isFlushing, flushPendingSaves, submitAttempt]);

    // Server-driven visual countdown timer (Prompt 1)
    // The server-calculated attempt.remainingSeconds is the authoritative remaining time.
    useEffect(() => {
        if (!attempt || attempt.status !== 'IN_PROGRESS' || attempt.remainingSeconds == null || isSubmittedSuccessfully) {
            setSecondsRemaining(null);
            return;
        }

        setSecondsRemaining(attempt.remainingSeconds);

        if (attempt.remainingSeconds <= 0) {
            return;
        }

        const intervalId = setInterval(() => {
            setSecondsRemaining((prev) => {
                if (prev == null || prev <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [attempt?.id, attempt?.status, attempt?.remainingSeconds, isSubmittedSuccessfully]);

    // Prompt 7: Trigger auto-submit when server-derived countdown reaches zero
    useEffect(() => {
        if (
            secondsRemaining === 0 &&
            attempt?.status === 'IN_PROGRESS' &&
            !isSubmittedSuccessfully &&
            !hasAutoSubmittedRef.current
        ) {
            hasAutoSubmittedRef.current = true;
            setIsTimeUp(true);
            performSubmit();
        }
    }, [secondsRemaining, attempt?.status, isSubmittedSuccessfully, performSubmit]);

    // Unsaved Changes Browser BeforeUnload Guard
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const hasUnsaved =
                saveStatus === 'Saving...' ||
                saveStatus === 'Retrying...' ||
                Object.keys(pendingAnswers.current).length > 0 ||
                Object.keys(inFlightSaves.current).length > 0;

            if (hasUnsaved && attempt?.status === 'IN_PROGRESS' && !isSubmittedSuccessfully && !isTimeUp) {
                e.preventDefault();
                e.returnValue = 'Any unsaved answer changes will be lost.';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveStatus, attempt?.status, isSubmittedSuccessfully, isTimeUp]);

    // Prompt 6: Send visibility loss event to Learner 5 integrity endpoint
    useEffect(() => {
        const handleVisibilityChange = () => {
            const currentState = document.visibilityState;

            if (
                attemptIdRef.current &&
                attempt?.status === 'IN_PROGRESS' &&
                !isSubmittedSuccessfully &&
                !isTimeUp
            ) {
                if (currentState === 'hidden' && lastVisibilityStateRef.current !== 'hidden') {
                    lastVisibilityStateRef.current = 'hidden';
                    latestVisibilityEventRef.current = {
                        type: 'hidden',
                        timestamp: new Date().toISOString(),
                        attemptId: attemptIdRef.current,
                    };
                    // Non-blocking call to Learner 5 integrity endpoint
                    recordVisibilityLost(attemptIdRef.current).unwrap().catch(() => {
                        // Integrity endpoint failures are handled non-blockingly and never interrupt quiz workflow
                    });
                } else if (currentState === 'visible' && lastVisibilityStateRef.current !== 'visible') {
                    lastVisibilityStateRef.current = 'visible';
                    latestVisibilityEventRef.current = {
                        type: 'visible',
                        timestamp: new Date().toISOString(),
                        attemptId: attemptIdRef.current,
                    };
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [attempt?.status, isSubmittedSuccessfully, isTimeUp, recordVisibilityLost]);

    useEffect(() => {
        if (attempt && !isRestored) {
            const restoredAnswers = {};
            if (attempt.attemptAnswers && typeof attempt.attemptAnswers === 'object') {
                for (const [qId, data] of Object.entries(attempt.attemptAnswers)) {
                    if (data?.selectedOptionId != null) {
                        restoredAnswers[qId] = data.selectedOptionId;
                    }
                }
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAnswers(restoredAnswers);
            
            if (attempt.questions && attempt.questions.length > 0) {
                const firstUnanswered = attempt.questions.findIndex(q => !restoredAnswers[q.id]);
                if (firstUnanswered !== -1) {
                    setCurrentIndex(firstUnanswered);
                } else {
                    setCurrentIndex(attempt.questions.length - 1);
                }
            }
            
            setIsRestored(true);
        }
    }, [attempt, isRestored]);

    useEffect(() => {
        isMounted.current = true;
        const currentTimers = debounceTimers.current;
        const currentPending = pendingAnswers.current;

        return () => {
            isMounted.current = false;
            
            const pendingTimerQuestionIds = Object.keys(currentTimers);
            for (const qId of pendingTimerQuestionIds) {
                clearTimeout(currentTimers[qId]);
                delete currentTimers[qId];

                const value = currentPending[qId];
                delete currentPending[qId];

                const attemptId = attemptIdRef.current;
                if (value !== undefined && attemptId) {
                    saveAnswerMutation({
                        attemptId,
                        questionId: qId,
                        selectedOptionId: value,
                    });
                }
            }
        };
    }, [saveAnswerMutation]);

    const handleBackClick = () => {
        if (isTimeUp || attempt?.status === 'SUBMITTED' || attempt?.status === 'AUTO_SUBMITTED' || isSubmittedSuccessfully) {
            navigate('/');
            return;
        }
        setShowLeaveModal(true);
    };

    const handleConfirmLeave = async () => {
        setShowLeaveModal(false);
        await performSubmit();
    };

    const totalQuestions = attempt?.questions?.length ?? 0;
    const answeredCount = Object.values(answers).filter(val => val != null && val !== '').length;
    const unansweredCount = Math.max(0, totalQuestions - answeredCount);

    const isSubmitDisabled = isSubmitting || isFlushing || isTimeUp || attempt?.status === 'SUBMITTED';

    const handleUserSubmitClick = () => {
        if (isSubmitDisabled) return;

        if (unansweredCount > 0) {
            setShowUnansweredModal(true);
        } else {
            performSubmit();
        }
    };

    const handleConfirmSubmitAnyway = () => {
        setShowUnansweredModal(false);
        performSubmit();
    };

    if (isLoading || (attempt && !isRestored)) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 font-sans">
                <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center shadow-soft">
                    <Loader2 size={36} className="text-primary mb-3" />
                    <p className="text-sm font-medium text-heading">Loading attempt…</p>
                </div>
            </div>
        );
    }

    if (attempt?.status === 'SUBMITTED' || attempt?.status === 'AUTO_SUBMITTED' || isSubmittedSuccessfully) {
        const scoreVal = submissionScore ?? attempt?.score;
        let formattedScore = null;
        if (typeof scoreVal === 'object' && scoreVal !== null) {
            formattedScore = `Score: ${scoreVal.rawScore ?? 0} / ${scoreVal.maxScore ?? 0} (${scoreVal.percentage ?? 0}%)`;
        } else if (scoreVal != null) {
            formattedScore = `Score: ${scoreVal}%`;
        }

        return (
            <MessagePage 
                icon={CheckCircle2}
                title="Submission Successful" 
                description={formattedScore ? `Your quiz attempt has been submitted successfully. ${formattedScore}` : "Your quiz attempt has been submitted successfully."}
                buttonText="Return to Dashboard"
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
    
    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleOptionSelect = (questionId, optionId) => {
        if (isTimeUp || isSubmitting || isFlushing) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
        triggerSave(questionId, optionId);
    };

    const handleTextChange = (questionId, text) => {
        if (isTimeUp || isSubmitting || isFlushing) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: text
        }));
        triggerSave(questionId, text);
    };

    const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    const formatTimeRemaining = (totalSeconds) => {
        if (totalSeconds == null) return '--:--';
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const isLowTime = secondsRemaining != null && secondsRemaining > 0 && secondsRemaining <= 300;

    const isFiveMinWarning =
        secondsRemaining !== null &&
        secondsRemaining > 60 &&
        secondsRemaining <= 300 &&
        attempt?.status === 'IN_PROGRESS' &&
        !isSubmittedSuccessfully &&
        !hasDismissedFiveMinWarning;

    const isOneMinWarning =
        secondsRemaining !== null &&
        secondsRemaining > 0 &&
        secondsRemaining <= 60 &&
        attempt?.status === 'IN_PROGRESS' &&
        !isSubmittedSuccessfully &&
        !hasDismissedOneMinWarning;

    const renderQuestionOptions = (question) => {
        const rawOpts = question.options;
        const opts = (rawOpts && rawOpts.length > 0)
            ? rawOpts
            : (question.type === 'TRUE_FALSE'
                ? [{ id: 'true', option: 'True' }, { id: 'false', option: 'False' }]
                : []);
        return opts.map((opt, idx) => {
            const optValue = typeof opt === 'string' ? opt : (opt.id || opt.option || opt.value || `opt-${idx}`);
            const optLabel = typeof opt === 'string' ? opt : (opt.option || opt.text || opt.label || opt.id);
            const isSelected = answers[question.id] === optValue;
            const isDisabled = isTimeUp || isSubmitting || isFlushing;

            return (
                <label 
                    key={optValue} 
                    className={`flex items-center gap-4 rounded-button border p-4 transition-all duration-200 ${
                        isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    } ${
                        isSelected 
                            ? "border-primary bg-primary/5 text-heading font-medium ring-1 ring-primary/30" 
                            : "border-border bg-surface text-body hover:bg-background"
                    }`}
                >
                    <input 
                        type="radio" 
                        name={`question-${question.id}`} 
                        disabled={isDisabled}
                        className="h-4 w-4 border-border text-primary focus:ring-primary accent-primary"
                        checked={isSelected}
                        onChange={() => handleOptionSelect(question.id, optValue)}
                    />
                    <span className="text-sm">{optLabel}</span>
                </label>
            );
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans">
            {/* Confirmation Leave Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="leave-modal-title"
                        className="bg-surface border-border rounded-dialog w-full max-w-md overflow-hidden border p-6 shadow-soft"
                    >
                        <div className="flex items-center gap-3 text-warning mb-4">
                            <AlertCircle size={24} className="text-warning shrink-0" />
                            <h3 id="leave-modal-title" className="font-display text-heading text-lg font-bold">
                                Leave Quiz?
                            </h3>
                        </div>
                        <p className="text-body text-sm mb-6 leading-relaxed">
                            {saveStatus === 'Saving...' || saveStatus === 'Retrying...'
                                ? 'You have answers currently being saved. Unsaved changes will be submitted as-is if you exit now.'
                                : 'Are you sure you want to exit and submit your quiz? Your attempt will be finalized using your last saved answers, and you will not be able to re-enter.'}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLeaveModal(false)}
                                className="border-border text-heading hover:bg-background rounded-button border px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Cancel & Stay
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLeave}
                                className="bg-danger hover:bg-danger/90 text-white rounded-button px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
                            >
                                Exit & Submit Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unanswered Questions Warning Modal */}
            {showUnansweredModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="unanswered-modal-title"
                        className="bg-surface border-border rounded-dialog w-full max-w-md overflow-hidden border p-6 shadow-soft"
                    >
                        <div className="flex items-center gap-3 text-warning mb-4">
                            <AlertCircle size={24} className="text-warning shrink-0" />
                            <h3 id="unanswered-modal-title" className="font-display text-heading text-lg font-bold">
                                Unanswered Questions
                            </h3>
                        </div>
                        <p className="text-body text-sm mb-2 leading-relaxed font-semibold">
                            You haven&apos;t answered all questions.
                        </p>
                        <p className="text-muted text-sm mb-6 leading-relaxed">
                            You answered <strong className="text-heading">{answeredCount}</strong> out of <strong className="text-heading">{totalQuestions}</strong> questions. <strong className="text-danger">{unansweredCount}</strong> {unansweredCount === 1 ? 'question is' : 'questions are'} still unanswered. Are you sure you want to submit?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowUnansweredModal(false)}
                                className="border-border text-heading hover:bg-background rounded-button border px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmitAnyway}
                                className="bg-primary hover:bg-primary-hover text-surface rounded-button px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
                            >
                                Submit Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Top Bar for Attempt */}
            <header className="sticky top-0 z-40 bg-surface border-b border-border h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBackClick}
                        className="inline-flex items-center text-xs font-semibold text-muted hover:text-heading border border-border rounded-button px-2.5 py-1.5 hover:bg-background transition-colors"
                        title={isTimeUp ? "Return to Dashboard" : "Back to Dashboard"}
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        <span className="hidden sm:inline">{isTimeUp ? "Return to Dashboard" : "Dashboard"}</span>
                    </button>

                    <div className="bg-primary h-7 w-7 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0">
                        QP
                    </div>
                    <h1 className="font-semibold text-heading text-base hidden sm:block truncate max-w-xs sm:max-w-md">
                        {quiz?.title || 'Quiz Attempt'}
                    </h1>
                    <span className="text-xs font-semibold text-muted sm:hidden">
                        {attempt.status === 'IN_PROGRESS' ? 'In Progress' : attempt.status}
                    </span>
                </div>
                
                {/* Autosave, Timer, and Status Indicators */}
                <div className="flex items-center gap-3 text-sm font-medium">
                    {/* Countdown Timer Display */}
                    {secondsRemaining !== null && attempt?.status === 'IN_PROGRESS' && !isSubmittedSuccessfully && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono transition-colors ${
                            isTimeUp
                                ? 'bg-danger/10 border-danger/30 text-danger'
                                : isLowTime
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
                                : 'bg-background border-border text-heading'
                        }`}>
                            <Clock size={14} className={isLowTime ? 'text-amber-500' : isTimeUp ? 'text-danger' : 'text-muted'} />
                            <span>{isTimeUp ? '00:00' : formatTimeRemaining(secondsRemaining)}</span>
                        </div>
                    )}

                    {/* Autosave Status */}
                    {!isTimeUp && saveStatus === 'Saving...' && (
                        <span className="inline-flex items-center text-muted text-xs animate-pulse">
                            <Save size={14} className="mr-1.5" />
                            Saving...
                        </span>
                    )}
                    {!isTimeUp && saveStatus === 'Saved' && (
                        <span className="inline-flex items-center text-success text-xs font-medium">
                            <CheckCircle2 size={14} className="mr-1.5 text-success" />
                            Saved
                        </span>
                    )}
                    {!isTimeUp && (saveStatus === 'Error saving' || saveStatus === 'Retrying...') && (
                        <span className="inline-flex items-center text-danger text-xs font-medium">
                            <AlertCircle size={14} className="mr-1.5 text-danger" />
                            {saveStatus}
                        </span>
                    )}

                    <div className="hidden md:flex items-center gap-1.5 text-success text-xs font-medium bg-success/10 px-2.5 py-1 rounded-full">
                        <Wifi size={12} />
                        Connected
                    </div>

                    <div className="bg-background text-heading flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold shadow-sm">
                        <span>Question {currentIndex + 1} of {totalQuestions} · Answered {answeredCount}/{totalQuestions}</span>
                    </div>
                </div>
            </header>

            {/* Top Progress Line */}
            <div className="bg-border h-1 w-full shrink-0">
                <div 
                    className="bg-primary h-full transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar: Question Map (Desktop) */}
                <aside className="hidden lg:block w-72 bg-surface border-r border-border p-6 overflow-y-auto shrink-0">
                    <h3 className="font-semibold text-heading text-sm mb-4">Question Navigator</h3>
                    
                    {/* Grid of Question Numbers */}
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, idx) => {
                            const isCurrent = idx === currentIndex;
                            const isAnswered = answers[q.id] != null && answers[q.id] !== '';

                            return (
                                <button
                                    key={q.id || idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-xs font-semibold border transition-all duration-200 ease-out ${
                                        isCurrent 
                                            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" 
                                            : isAnswered 
                                                ? "bg-success/15 text-success border-success/30" 
                                                : "border-border bg-surface text-muted hover:bg-background"
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex items-center justify-between text-xs font-semibold mb-2">
                            <span className="text-muted">Progress</span>
                            <span className="text-primary">{progressPercentage}% Completed</span>
                        </div>
                        <div className="w-full bg-border h-2 rounded-full overflow-hidden mb-4">
                            <div 
                                className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        {/* Answered / Unanswered Progress Breakdown (Prompt 4) */}
                        <div className="space-y-2 pt-2 border-t border-border/60 text-xs font-medium">
                            <div className="flex items-center justify-between">
                                <span className="text-muted flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-success inline-block"></span>
                                    Answered:
                                </span>
                                <span className="font-bold text-heading">{answeredCount} / {totalQuestions}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                                    Unanswered:
                                </span>
                                <span className="font-bold text-amber-600 dark:text-amber-400">{unansweredCount}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleUserSubmitClick}
                        disabled={isSubmitDisabled}
                        className="w-full mt-8 inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out bg-primary text-surface hover:bg-primary-hover shadow-soft py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting || isFlushing ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                    {isSubmitError && (
                        <p className="mt-2 text-xs font-medium text-danger text-center">
                            Failed to submit. Please try again.
                        </p>
                    )}
                </aside>

                {/* Center: Question Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
                    <div className="w-full max-w-3xl flex flex-col justify-between min-h-[500px]">
                        <div>
                            {/* 5-Minute Time Warning Banner (Prompt 2) */}
                            {isFiveMinWarning && (
                                <div
                                    role="alert"
                                    className="bg-amber-500/10 border border-amber-500/30 text-heading rounded-card p-4 mb-6 shadow-soft flex items-center justify-between gap-4 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-sm text-heading">5 Minutes Remaining</h4>
                                            <p className="text-xs text-muted mt-0.5">
                                                You have 5 minutes remaining. Please review your answers before submitting.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHasDismissedFiveMinWarning(true)}
                                        className="text-xs font-semibold text-muted hover:text-heading border border-border bg-surface px-3 py-1.5 rounded-button hover:bg-background transition-colors shrink-0"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}

                            {/* 1-Minute Critical Time Warning Banner (Prompt 3) */}
                            {isOneMinWarning && (
                                <div
                                    role="alert"
                                    className="bg-danger/10 border border-danger/30 text-heading rounded-card p-4 mb-6 shadow-soft flex items-center justify-between gap-4 transition-all animate-pulse"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertCircle size={20} className="text-danger shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-sm text-heading text-danger">1 Minute Remaining</h4>
                                            <p className="text-xs text-muted mt-0.5">
                                                Less than 1 minute remaining! Finalize your answers and prepare to submit.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHasDismissedOneMinWarning(true)}
                                        className="text-xs font-semibold text-muted hover:text-heading border border-border bg-surface px-3 py-1.5 rounded-button hover:bg-background transition-colors shrink-0"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}

                            {/* Time is Up Warning Banner */}
                            {isTimeUp && (
                                <div className="bg-danger/10 border border-danger/30 text-heading rounded-card p-5 sm:p-6 mb-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={24} className="text-danger shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-base text-heading">Time is up</h4>
                                            <p className="text-xs text-muted mt-1 leading-relaxed">
                                                The quiz time has ended. Your saved answers are being submitted automatically.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/')}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-button px-4 py-2.5 text-xs font-bold border border-border bg-surface text-heading hover:bg-background transition-colors shadow-sm"
                                        >
                                            Return to Dashboard
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleUserSubmitClick}
                                            disabled={isSubmitDisabled}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-button px-4 py-2.5 text-xs font-bold bg-success text-surface hover:bg-opacity-90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting || isFlushing ? 'Submitting...' : 'Submit Quiz'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Progress Bar Header */}
                            <div className="mb-6 lg:hidden">
                                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                                    <span className="text-muted">Question {currentIndex + 1} of {totalQuestions}</span>
                                    <span className="text-primary">{progressPercentage}% Completed</span>
                                </div>
                                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Active Question Box */}
                            <div className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-soft mb-6">
                                <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md mb-4">
                                    Question {currentIndex + 1}
                                </span>
                                
                                <h2 className="mb-6 text-lg sm:text-xl font-bold text-heading leading-snug">
                                    {currentQuestion.text}
                                </h2>

                                <div className="space-y-3">
                                    {currentQuestion.type === 'MCQ' || currentQuestion.type === 'TRUE_FALSE' ? (
                                        renderQuestionOptions(currentQuestion)
                                    ) : currentQuestion.type === 'OPEN_ENDED' ? (
                                        <textarea
                                            disabled={isTimeUp || isSubmitting || isFlushing}
                                            className={`w-full rounded-input border border-border bg-background p-4 text-sm text-heading shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors ${
                                                isTimeUp || isSubmitting || isFlushing ? 'cursor-not-allowed opacity-60' : ''
                                            }`}
                                            rows={5}
                                            placeholder={isTimeUp ? "Time is up. Answering disabled." : "Type your answer here..."}
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm text-warning font-medium p-4 bg-warning/10 rounded-button border border-warning/20">
                                            Unsupported question type.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
                            <button
                                onClick={handlePrevious}
                                disabled={currentIndex === 0 || isSubmitting || isFlushing}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 border border-border bg-surface text-body hover:bg-background px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} className="mr-1.5" />
                                Previous
                            </button>

                            {currentIndex < totalQuestions - 1 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting || isFlushing}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out bg-primary text-surface hover:bg-primary-hover shadow-soft px-6 py-2.5 disabled:opacity-50"
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-1.5" />
                                </button>
                            ) : (
                                <div className="flex flex-col items-end gap-1">
                                    <button
                                        onClick={handleUserSubmitClick}
                                        disabled={isSubmitDisabled}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out bg-success text-surface hover:bg-opacity-90 shadow-soft px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {(isSubmitting || isFlushing) && <Loader2 size={16} className="mr-2" />}
                                        {isSubmitting || isFlushing ? 'Submitting...' : 'Submit Quiz'}
                                    </button>
                                    {isSubmitError && (
                                        <span className="text-xs font-medium text-danger">
                                            Failed to submit. Please try again.
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

