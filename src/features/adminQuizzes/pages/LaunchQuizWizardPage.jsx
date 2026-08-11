import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AdminShell from '../../../shared/components/AdminShell';
import {
  useBulkInviteStudentsMutation,
  useCreateQuizMutation,
  useGetAdminQuizByIdQuery,
  usePublishQuizMutation,
} from '../adminQuizzesApi';

const STEPS = [
  { id: 'basics', label: 'Basics' },
  { id: 'questions', label: 'Questions' },
  { id: 'publish', label: 'Publish' },
  { id: 'invite', label: 'Invite' },
];

const fieldClass =
  'border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3.5 py-2.5 text-sm outline-none focus:ring-2';
const labelClass = 'text-heading mb-1.5 block text-sm font-medium';

function defaultForm() {
  const now = new Date();
  const future = new Date(now.getTime() + 7 * 86400000);
  return {
    title: '',
    description: '',
    instructions: '',
    duration: 60,
    openDate: now.toISOString().slice(0, 16),
    closesAt: future.toISOString().slice(0, 16),
    passScore: 70,
    integrityThreshold: 5,
    resultsPolicy: 'AFTER_CLOSE',
  };
}

function StepRail({ current }) {
  const index = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="mb-8 flex flex-wrap gap-2" aria-label="Launch steps">
      {STEPS.map((step, i) => {
        const done = i < index;
        const active = step.id === current;
        return (
          <li
            key={step.id}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active
                ? 'bg-primary text-white'
                : done
                  ? 'bg-primary-soft text-heading'
                  : 'bg-background text-muted border-border border'
            }`}
          >
            {i + 1}. {step.label}
          </li>
        );
      })}
    </ol>
  );
}

export default function LaunchQuizWizardPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const quizId = params.get('quizId') || '';
  const step = params.get('step') || (quizId ? 'questions' : 'basics');

  const [formData, setFormData] = useState(defaultForm);
  const [errorMsg, setErrorMsg] = useState('');
  const [inviteText, setInviteText] = useState('');
  const [inviteResult, setInviteResult] = useState(null);

  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [publishQuiz, { isLoading: isPublishing }] = usePublishQuizMutation();
  const [bulkInvite, { isLoading: isInviting }] = useBulkInviteStudentsMutation();

  const { data: quiz, refetch } = useGetAdminQuizByIdQuery(quizId, { skip: !quizId });

  const setStep = (next, id = quizId) => {
    const nextParams = new URLSearchParams();
    if (id) nextParams.set('quizId', id);
    nextParams.set('step', next);
    setParams(nextParams, { replace: true });
  };

  const handleBasics = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.title.trim()) {
      setErrorMsg('Quiz title is required');
      return;
    }
    if (!formData.openDate || !formData.closesAt) {
      setErrorMsg('Open date and close date are required');
      return;
    }
    if (new Date(formData.openDate) >= new Date(formData.closesAt)) {
      setErrorMsg('Open date must be before close date');
      return;
    }

    try {
      const created = await createQuiz({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        instructions: formData.instructions.trim() || undefined,
        duration: Number(formData.duration) || 60,
        openDate: new Date(formData.openDate).toISOString(),
        closesAt: new Date(formData.closesAt).toISOString(),
        passScore: formData.passScore !== '' ? Number(formData.passScore) : null,
        integrityThreshold: Number(formData.integrityThreshold) || 5,
        resultsPolicy: formData.resultsPolicy || 'AFTER_CLOSE',
      }).unwrap();
      setStep('questions', created.quizId);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Could not create quiz.');
    }
  };

  const handlePublish = async () => {
    setErrorMsg('');
    try {
      await publishQuiz(quizId).unwrap();
      await refetch();
      setStep('invite', quizId);
    } catch (err) {
      setErrorMsg(
        err?.data?.message ||
          (err?.data?.errors ? err.data.errors.join(', ') : 'Publish failed.'),
      );
    }
  };

  const parsedEmails = useMemo(
    () =>
      inviteText
        .split(/[\n,;\s]+/)
        .map((e) => e.trim())
        .filter(Boolean),
    [inviteText],
  );

  const handleInvite = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInviteResult(null);
    if (parsedEmails.length === 0) {
      setErrorMsg('Enter at least one email address.');
      return;
    }
    try {
      const res = await bulkInvite({ quizId, emails: parsedEmails }).unwrap();
      setInviteResult(res);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Failed to send invitations.');
    }
  };

  return (
    <AdminShell
      title="Launch quiz"
      subtitle="Basics, questions, publish, then invite — one path."
      actions={
        quizId ? (
          <Link
            to={`/admin/quizzes/${quizId}`}
            className="border-border text-heading hover:bg-background rounded-button border px-3 py-1.5 text-sm font-medium"
          >
            Workspace
          </Link>
        ) : null
      }
    >
      <StepRail current={step} />

      {errorMsg ? (
        <div
          role="alert"
          className="border-danger/20 bg-danger/5 text-danger mb-6 rounded-card border px-4 py-3 text-sm"
        >
          {errorMsg}
        </div>
      ) : null}

      {step === 'basics' && (
        <form onSubmit={handleBasics} className="border-border bg-surface max-w-2xl space-y-4 rounded-card border p-6">
          <div>
            <label htmlFor="launch-title" className={labelClass}>
              Title
            </label>
            <input
              id="launch-title"
              className={fieldClass}
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="launch-desc" className={labelClass}>
              Description
            </label>
            <textarea
              id="launch-desc"
              rows={2}
              className={fieldClass}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="launch-instructions" className={labelClass}>
              Instructions (shown before start)
            </label>
            <textarea
              id="launch-instructions"
              rows={3}
              className={fieldClass}
              value={formData.instructions}
              onChange={(e) => setFormData((p) => ({ ...p, instructions: e.target.value }))}
              placeholder="What learners should know before they begin…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="launch-duration" className={labelClass}>
                Duration (minutes)
              </label>
              <input
                id="launch-duration"
                type="number"
                min={1}
                className={fieldClass}
                value={formData.duration}
                onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="launch-pass" className={labelClass}>
                Pass score (%)
              </label>
              <input
                id="launch-pass"
                type="number"
                min={0}
                max={100}
                className={fieldClass}
                value={formData.passScore}
                onChange={(e) => setFormData((p) => ({ ...p, passScore: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="launch-open" className={labelClass}>
                Opens
              </label>
              <input
                id="launch-open"
                type="datetime-local"
                className={fieldClass}
                value={formData.openDate}
                onChange={(e) => setFormData((p) => ({ ...p, openDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="launch-close" className={labelClass}>
                Closes
              </label>
              <input
                id="launch-close"
                type="datetime-local"
                className={fieldClass}
                value={formData.closesAt}
                onChange={(e) => setFormData((p) => ({ ...p, closesAt: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="launch-integrity" className={labelClass}>
                Integrity review threshold
              </label>
              <input
                id="launch-integrity"
                type="number"
                min={1}
                className={fieldClass}
                value={formData.integrityThreshold}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, integrityThreshold: e.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="launch-policy" className={labelClass}>
                Results policy
              </label>
              <select
                id="launch-policy"
                className={fieldClass}
                value={formData.resultsPolicy}
                onChange={(e) => setFormData((p) => ({ ...p, resultsPolicy: e.target.value }))}
              >
                <option value="AFTER_CLOSE">Score now, review after close</option>
                <option value="IMMEDIATE">Score + review right after submit</option>
                <option value="ADMIN_ONLY">Score only (no learner review)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/quizzes')}
              className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isCreating ? 'Creating…' : 'Continue to questions'}
            </button>
          </div>
        </form>
      )}

      {step === 'questions' && quizId && (
        <div className="border-border bg-surface max-w-2xl space-y-4 rounded-card border p-6">
          <h2 className="font-display text-heading text-xl">
            {quiz?.title || 'Add questions'}
          </h2>
          <p className="text-body text-sm leading-relaxed">
            Add at least one valid MCQ or true/false question with a correct answer. Prefer short
            explanations — they teach after the test.
          </p>
          {quiz && !quiz.isValid && quiz.validationErrors?.length ? (
            <div className="border-warning/25 bg-warning/5 text-warning rounded-button border px-3 py-2 text-sm">
              <p className="font-medium">Not ready to publish yet</p>
              <ul className="mt-1 list-inside list-disc text-xs">
                {quiz.validationErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {quiz?.isValid ? (
            <p className="text-success text-sm font-medium">Questions look publishable.</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/admin/quizzes/${quizId}/questions`}
              state={{
                returnTo: `/admin/quizzes/launch?quizId=${quizId}&step=publish`,
                notice: 'When questions look good, continue the launch wizard.',
              }}
              className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white"
            >
              Open quiz questions
            </Link>
            <Link
              to="/admin/question-bank"
              className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
            >
              Browse question bank
            </Link>
            <button
              type="button"
              onClick={() => {
                refetch();
                setStep('publish', quizId);
              }}
              className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
            >
              Continue to publish
            </button>
          </div>
        </div>
      )}

      {step === 'publish' && quizId && (
        <div className="border-border bg-surface max-w-2xl space-y-4 rounded-card border p-6">
          <h2 className="font-display text-heading text-xl">Publish for the cohort</h2>
          <p className="text-body text-sm">
            Publishing unlocks invitations. Learners cannot start until the quiz is published and
            the window is open.
          </p>
          {quiz?.status === 'PUBLISHED' ? (
            <p className="text-success text-sm font-medium">Already published.</p>
          ) : null}
          {!quiz?.isValid ? (
            <div className="border-warning/25 bg-warning/5 text-warning rounded-button border px-3 py-2 text-sm">
              Fix question validation before publishing.
              <div className="mt-2">
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => setStep('questions', quizId)}
                >
                  Back to questions
                </button>
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {quiz?.status !== 'PUBLISHED' ? (
              <button
                type="button"
                disabled={!quiz?.isValid || isPublishing}
                onClick={handlePublish}
                className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isPublishing ? 'Publishing…' : 'Publish quiz'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep('invite', quizId)}
                className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white"
              >
                Continue to invite
              </button>
            )}
            <button
              type="button"
              onClick={() => setStep('questions', quizId)}
              className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === 'invite' && quizId && (
        <div className="border-border bg-surface max-w-2xl space-y-4 rounded-card border p-6">
          <h2 className="font-display text-heading text-xl">Invite the cohort</h2>
          <p className="text-muted text-sm">
            Paste emails below. If delivery is simulated, use Copy link from Access after you finish.
          </p>
          <form onSubmit={handleInvite} className="space-y-4">
            <textarea
              className={fieldClass}
              rows={6}
              value={inviteText}
              onChange={(e) => setInviteText(e.target.value)}
              placeholder="learner1@example.com&#10;learner2@example.com"
            />
            <p className="text-muted text-xs">{parsedEmails.length} email(s) ready</p>
            {inviteResult ? (
              <div className="border-border bg-background rounded-button border px-3 py-2 text-sm">
                Sent {inviteResult.sent ?? 0} · Failed {inviteResult.failed ?? 0} · Duplicates{' '}
                {inviteResult.duplicates ?? 0}
                {inviteResult.deliveryMode === 'simulated' ? (
                  <span className="text-muted"> · Simulated email — copy links from Access</span>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isInviting || quiz?.status !== 'PUBLISHED'}
                className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isInviting ? 'Sending…' : 'Send invites'}
              </button>
              <Link
                to={`/admin/quizzes/${quizId}?tab=access`}
                className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
              >
                Open workspace · Access
              </Link>
              <Link
                to={`/admin/quizzes/${quizId}`}
                className="text-heading px-2 py-2.5 text-sm font-semibold underline"
              >
                Done — open workspace
              </Link>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
