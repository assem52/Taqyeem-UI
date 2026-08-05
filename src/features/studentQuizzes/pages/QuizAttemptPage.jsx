import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetAttemptQuery, useGetStudentQuizQuery, useSaveAnswerMutation, useSubmitAttemptMutation } from '../studentQuizzesApi';
import MessagePage from '../../../shared/components/MessagePage';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Wifi, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from '../../../shared/components/Icons';

export default function QuizAttemptPage() {
    const { quizId } = useParams();
    const { data: attempt, isLoading, isError, error } = useGetAttemptQuery(quizId);
    const { data: quiz } = useGetStudentQuizQuery(quizId);
    const [saveAnswerMutation] = useSaveAnswerMutation();
    const [submitAttempt, { isLoading: isSubmitting, isError: isSubmitError }] = useSubmitAttemptMutation();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [saveStatus, setSaveStatus] = useState('');
    const [isRestored, setIsRestored] = useState(false);
    const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
    const [isFlushing, setIsFlushing] = useState(false);

    const debounceTimers = useRef({});
    const pendingAnswers = useRef({});
    const inFlightSaves = useRef({});
    const isMounted = useRef(true);
    const attemptIdRef = useRef(attempt?.id);

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
            } catch (_) {
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
            } catch (err) {
                safeSetSaveStatus('Retrying...');
                try {
                    await saveAnswerMutation({ 
                        attemptId, 
                        questionId, 
                        selectedOptionId: value 
                    }).unwrap();
                    safeSetSaveStatus('Saved');
                    setTimeout(() => safeSetSaveStatus((prev) => (prev === 'Saved' ? '' : prev)), 2000);
                } catch (retryErr) {
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
    }, [saveAnswerMutation, safeSetSaveStatus]);

    const triggerSave = useCallback((questionId, value) => {
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
    }, [performSave, safeSetSaveStatus]);

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

    useEffect(() => {
        if (attempt && !isRestored) {
            const restoredAnswers = {};
            if (attempt.attemptAnswers) {
                for (const [qId, data] of Object.entries(attempt.attemptAnswers)) {
                    if (data && data.selectedOptionId) {
                        restoredAnswers[qId] = data.selectedOptionId;
                    } else if (typeof data === 'string') {
                        restoredAnswers[qId] = data;
                    }
                }
            }
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
        return () => {
            isMounted.current = false;
            
            const pendingTimerQuestionIds = Object.keys(debounceTimers.current);
            for (const qId of pendingTimerQuestionIds) {
                clearTimeout(debounceTimers.current[qId]);
                delete debounceTimers.current[qId];

                const value = pendingAnswers.current[qId];
                delete pendingAnswers.current[qId];

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

    if (isLoading || (attempt && !isRestored)) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center shadow-soft">
                    <Loader2 size={36} className="text-primary mb-3" />
                    <p className="text-sm font-medium text-heading">Loading attempt…</p>
                </div>
            </div>
        );
    }

    if (attempt?.status === 'SUBMITTED' || attempt?.status === 'AUTO_SUBMITTED' || isSubmittedSuccessfully) {
        return (
            <MessagePage 
                icon={CheckCircle2}
                title="Submission Successful" 
                description="Your quiz attempt has been submitted successfully."
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
    const totalQuestions = questions.length;
    
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
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
        triggerSave(questionId, optionId);
    };

    const handleTextChange = (questionId, text) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: text
        }));
        triggerSave(questionId, text);
    };

    const handleSubmit = async () => {
        try {
            setIsFlushing(true);
            await flushPendingSaves();
            await submitAttempt(attempt.id).unwrap();
            setIsSubmittedSuccessfully(true);
        } catch (err) {
            // isSubmitError will handle rendering the error in the UI
        } finally {
            if (isMounted.current) {
                setIsFlushing(false);
            }
        }
    };

    const answeredCount = Object.keys(answers).length;
    const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans">
            {/* Sticky Top Bar for Attempt */}
            <header className="sticky top-0 z-40 bg-surface border-b border-border h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-primary h-7 w-7 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0">
                        QP
                    </div>
                    <h1 className="font-semibold text-heading text-base hidden sm:block truncate max-w-md">
                        {quiz?.title || 'Quiz Attempt'}
                    </h1>
                    <span className="text-xs font-semibold text-muted sm:hidden">
                        {attempt.status === 'IN_PROGRESS' ? 'In Progress' : attempt.status}
                    </span>
                </div>
                
                {/* Autosave and Status Indicator */}
                <div className="flex items-center gap-4 text-sm font-medium">
                    {saveStatus === 'Saving...' && (
                        <span className="inline-flex items-center text-muted text-xs animate-pulse">
                            <Save size={14} className="mr-1.5" />
                            Saving...
                        </span>
                    )}
                    {saveStatus === 'Saved' && (
                        <span className="inline-flex items-center text-success text-xs font-medium">
                            <CheckCircle2 size={14} className="mr-1.5 text-success" />
                            Saved
                        </span>
                    )}
                    {(saveStatus === 'Error saving' || saveStatus === 'Retrying...') && (
                        <span className="inline-flex items-center text-danger text-xs font-medium">
                            <AlertCircle size={14} className="mr-1.5 text-danger" />
                            {saveStatus}
                        </span>
                    )}

                    <div className="hidden sm:flex items-center gap-1.5 text-success text-xs font-medium bg-success/10 px-2.5 py-1 rounded-full">
                        <Wifi size={12} />
                        Connected
                    </div>

                    <div className="bg-background text-heading flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold shadow-sm">
                        <span>Question {currentIndex + 1} of {totalQuestions}</span>
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
                        <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isFlushing}
                        className="w-full mt-8 inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out bg-primary text-surface hover:bg-primary-hover shadow-soft py-2.5 px-4 disabled:opacity-50"
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
                                        currentQuestion.options?.map((opt) => {
                                            const optValue = opt.id || opt.option;
                                            const isSelected = answers[currentQuestion.id] === optValue;

                                            return (
                                                <label 
                                                    key={optValue} 
                                                    className={`flex cursor-pointer items-center gap-4 rounded-button border p-4 transition-all duration-200 ${
                                                        isSelected 
                                                            ? "border-primary bg-primary/5 text-heading font-medium ring-1 ring-primary/30" 
                                                            : "border-border bg-surface text-body hover:bg-background"
                                                    }`}
                                                >
                                                    <input 
                                                        type="radio" 
                                                        name={`question-${currentQuestion.id}`} 
                                                        className="h-4 w-4 border-border text-primary focus:ring-primary accent-primary"
                                                        checked={isSelected}
                                                        onChange={() => handleOptionSelect(currentQuestion.id, optValue)}
                                                    />
                                                    <span className="text-sm">{opt.option}</span>
                                                </label>
                                            );
                                        })
                                    ) : currentQuestion.type === 'OPEN_ENDED' ? (
                                        <textarea
                                            className="w-full rounded-input border border-border bg-background p-4 text-sm text-heading shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                                            rows={5}
                                            placeholder="Type your answer here..."
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
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || isFlushing}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out bg-success text-surface hover:bg-opacity-90 shadow-soft px-6 py-2.5 disabled:opacity-50"
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
