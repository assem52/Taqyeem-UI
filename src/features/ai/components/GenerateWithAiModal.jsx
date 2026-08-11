import { useMemo, useState } from 'react';
import AiSparklesIcon from './AiSparklesIcon';
import { useGenerateAiQuestionsMutation } from '../aiApi';

function errorMessage(error, fallback) {
  const value =
    error?.data?.message ??
    error?.data?.errors ??
    error?.error;
  if (Array.isArray(value)) return value.join(' ');
  if (value && typeof value === 'object') return Object.values(value).flat().join(' ');
  return value || fallback;
}

function draftKey(draft, index) {
  return `${index}-${draft.text?.slice(0, 24) || 'draft'}`;
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {'bank' | 'quiz'} props.target
 * @param {Array<{ categoryId: string, name: string }>} [props.categories]
 * @param {string} [props.defaultCategoryId]
 * @param {(payload: { drafts: object[], categoryId?: string }) => Promise<void>} props.onSaveSelected
 * @param {boolean} [props.saving]
 */
export default function GenerateWithAiModal({
  open,
  onClose,
  target,
  categories = [],
  defaultCategoryId = '',
  onSaveSelected,
  saving = false,
}) {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [pdf, setPdf] = useState(null);
  const [count, setCount] = useState(5);
  const [typePreference, setTypePreference] = useState('MIXED');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [drafts, setDrafts] = useState([]);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState('');
  const [sourceSummary, setSourceSummary] = useState('');
  const [generate, generateState] = useGenerateAiQuestionsMutation();

  const selectedDrafts = useMemo(
    () => drafts.filter((draft, index) => selected[draftKey(draft, index)]),
    [drafts, selected],
  );

  if (!open) return null;

  const resetResults = () => {
    setDrafts([]);
    setSelected({});
    setSourceSummary('');
  };

  const handleClose = () => {
    if (generateState.isLoading || saving) return;
    onClose();
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setError('');
    if (!topic.trim() && !content.trim() && !pdf) {
      setError('Add a topic, pasted text, or a PDF.');
      return;
    }
    if (target === 'bank' && !categoryId) {
      setError('Choose a category for bank drafts.');
      return;
    }

    const formData = new FormData();
    if (topic.trim()) formData.append('topic', topic.trim());
    if (content.trim()) formData.append('content', content.trim());
    formData.append('count', String(count));
    formData.append('typePreference', typePreference);
    if (pdf) formData.append('pdf', pdf);

    try {
      const result = await generate(formData).unwrap();
      const nextDrafts = result.drafts || [];
      setDrafts(nextDrafts);
      setSourceSummary(result.sourceSummary || '');
      const initial = {};
      nextDrafts.forEach((draft, index) => {
        initial[draftKey(draft, index)] = true;
      });
      setSelected(initial);
    } catch (err) {
      resetResults();
      setError(errorMessage(err, 'Could not generate questions.'));
    }
  };

  const toggleDraft = (key) => {
    setSelected((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSave = async () => {
    if (selectedDrafts.length === 0) {
      setError('Select at least one draft to save.');
      return;
    }
    setError('');
    try {
      await onSaveSelected({
        drafts: selectedDrafts,
        categoryId: target === 'bank' ? categoryId : undefined,
      });
      resetResults();
      setTopic('');
      setContent('');
      setPdf(null);
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'Failed to save selected questions.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-ai-title"
        className="border-border bg-surface shadow-soft max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-dialog border"
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <p className="text-primary mb-1 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] uppercase">
              <AiSparklesIcon className="h-3.5 w-3.5" />
              Generate with AI
            </p>
            <h2 id="generate-ai-title" className="font-display text-heading text-xl">
              Draft questions from a topic, notes, or PDF
            </h2>
            <p className="text-muted mt-1 text-sm">
              Review drafts, edit nothing yet — save only the ones you want.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-heading rounded-button px-2 py-1 text-sm"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-5rem)] space-y-5 overflow-y-auto px-5 py-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            {target === 'bank' ? (
              <div>
                <label htmlFor="ai-category" className="text-heading mb-1.5 block text-sm font-medium">
                  Save into category
                </label>
                <select
                  id="ai-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="border-border bg-background text-heading focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3 py-2 text-sm outline-none focus:ring-2"
                >
                  <option value="">Select category…</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label htmlFor="ai-topic" className="text-heading mb-1.5 block text-sm font-medium">
                Topic
              </label>
              <input
                id="ai-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. Intro to Photosynthesis"
                className="border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="ai-content" className="text-heading mb-1.5 block text-sm font-medium">
                Pasted source text
              </label>
              <textarea
                id="ai-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={5}
                placeholder="Paste notes, outline, or excerpt…"
                className="border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label htmlFor="ai-count" className="text-heading mb-1.5 block text-sm font-medium">
                  Count
                </label>
                <input
                  id="ai-count"
                  type="number"
                  min={1}
                  max={15}
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value) || 1)}
                  className="border-border bg-background text-heading focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3 py-2 text-sm outline-none focus:ring-2"
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="ai-type" className="text-heading mb-1.5 block text-sm font-medium">
                  Type
                </label>
                <select
                  id="ai-type"
                  value={typePreference}
                  onChange={(event) => setTypePreference(event.target.value)}
                  className="border-border bg-background text-heading focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3 py-2 text-sm outline-none focus:ring-2"
                >
                  <option value="MIXED">Mixed</option>
                  <option value="MCQ">MCQ only</option>
                  <option value="TRUE_FALSE">True/False only</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="ai-pdf" className="text-heading mb-1.5 block text-sm font-medium">
                  PDF (optional)
                </label>
                <input
                  id="ai-pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => setPdf(event.target.files?.[0] || null)}
                  className="text-muted w-full text-sm file:border-border file:text-heading hover:file:bg-background file:mr-3 file:rounded-button file:border file:bg-surface file:px-3 file:py-1.5"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generateState.isLoading || saving}
              className="ai-generate-btn bg-primary hover:bg-primary-hover rounded-button inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <AiSparklesIcon className="h-4 w-4" />
              {generateState.isLoading ? 'Generating…' : 'Generate drafts'}
            </button>
          </form>

          {error ? (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          ) : null}

          {drafts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-heading text-sm font-semibold">
                    {drafts.length} draft{drafts.length === 1 ? '' : 's'}
                  </p>
                  {sourceSummary ? (
                    <p className="text-muted text-xs">From {sourceSummary}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || selectedDrafts.length === 0}
                  className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving
                    ? 'Saving…'
                    : `Save selected (${selectedDrafts.length})`}
                </button>
              </div>

              <ul className="space-y-3">
                {drafts.map((draft, index) => {
                  const key = draftKey(draft, index);
                  return (
                    <li
                      key={key}
                      className="border-border bg-background rounded-card border px-4 py-3"
                    >
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(selected[key])}
                          onChange={() => toggleDraft(key)}
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-heading text-sm font-medium">{draft.text}</p>
                          <p className="text-muted mt-1 text-xs">
                            {draft.type} · {draft.points || 1} pt
                            {draft.explanation ? ` · ${draft.explanation}` : ''}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {(draft.options || []).map((option) => (
                              <li
                                key={`${key}-${option.option}`}
                                className={`text-sm ${
                                  option.isCorrect ? 'text-success font-medium' : 'text-body'
                                }`}
                              >
                                {option.isCorrect ? '✓ ' : '• '}
                                {option.option}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
