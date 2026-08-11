import { useMemo, useState } from 'react';
import AiSparklesIcon from './AiSparklesIcon';
import { useGenerateAiQuestionsMutation } from '../aiApi';
import { useCreateBankCategoryMutation } from '../../questionBank/globalQuestionBankApi';

function errorMessage(error, fallback) {
  const value =
    error?.data?.message ??
    error?.data?.errors ??
    error?.error;
  if (Array.isArray(value)) return value.join(' ');
  if (value && typeof value === 'object') return Object.values(value).flat().join(' ');
  return value || fallback;
}

function newClientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeDraft(draft) {
  const type =
    draft.type === 'TRUE_FALSE'
      ? 'TRUE_FALSE'
      : draft.type === 'OPEN_ENDED'
        ? 'OPEN_ENDED'
        : 'MCQ';
  let options = Array.isArray(draft.options)
    ? draft.options.map((option) => ({
        option: String(option.option ?? '').trim(),
        isCorrect: Boolean(option.isCorrect),
      }))
    : [];

  if (type === 'OPEN_ENDED') {
    options = [];
  } else if (type === 'TRUE_FALSE') {
    const trueCorrect = options.some(
      (option) => option.isCorrect && option.option.toLowerCase() === 'true',
    );
    options = [
      { option: 'True', isCorrect: trueCorrect || !options.some((o) => o.isCorrect) },
      { option: 'False', isCorrect: !trueCorrect && options.some((o) => o.isCorrect) },
    ];
    if (!options.some((option) => option.isCorrect)) {
      options[0].isCorrect = true;
    }
    if (options.filter((option) => option.isCorrect).length > 1) {
      options[1].isCorrect = false;
    }
  } else if (options.length === 0) {
    options = [
      { option: '', isCorrect: true },
      { option: '', isCorrect: false },
    ];
  } else if (!options.some((option) => option.isCorrect)) {
    options = options.map((option, index) => ({
      ...option,
      isCorrect: index === 0,
    }));
  }

  return {
    clientId: draft.clientId || newClientId(),
    text: draft.text || '',
    explanation: draft.explanation || '',
    type,
    points: Number(draft.points) > 0 ? Number(draft.points) : 1,
    options,
  };
}

const fieldClass =
  'border-border bg-surface text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3 py-2 text-sm outline-none focus:ring-2';

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
  const [sourceFile, setSourceFile] = useState(null);
  const [count, setCount] = useState(5);
  const [typePreference, setTypePreference] = useState('MIXED');
  const [categoryId, setCategoryId] = useState(defaultCategoryId || '');
  const [categoryMode, setCategoryMode] = useState('existing');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState('');
  const [sourceSummary, setSourceSummary] = useState('');
  const [generate, generateState] = useGenerateAiQuestionsMutation();
  const [createCategory, createCategoryState] = useCreateBankCategoryMutation();
  const [syncedOpen, setSyncedOpen] = useState(open);

  // Reset category fields when the dialog opens (React "adjust state when prop changes").
  if (open !== syncedOpen) {
    setSyncedOpen(open);
    if (open) {
      setCategoryId(defaultCategoryId || '');
      setCategoryMode(
        defaultCategoryId ? 'existing' : categories.length ? 'existing' : 'new',
      );
    }
  }

  const selectedDrafts = useMemo(
    () => drafts.filter((draft) => selected[draft.clientId]),
    [drafts, selected],
  );

  if (!open) return null;

  const resetResults = () => {
    setDrafts([]);
    setSelected({});
    setSourceSummary('');
  };

  const handleClose = () => {
    if (generateState.isLoading || saving || createCategoryState.isLoading) return;
    onClose();
  };

  const updateDraft = (clientId, updater) => {
    setDrafts((current) =>
      current.map((draft) => {
        if (draft.clientId !== clientId) return draft;
        const next = typeof updater === 'function' ? updater(draft) : { ...draft, ...updater };
        return normalizeDraft(next);
      }),
    );
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setError('');
    if (!topic.trim() && !content.trim() && !sourceFile) {
      setError('Add a topic, pasted text, or a PDF/image.');
      return;
    }
    if (target === 'bank') {
      if (categoryMode === 'existing' && !categoryId) {
        setError('Choose a category, or create a new one.');
        return;
      }
      if (categoryMode === 'new' && !newCategoryName.trim()) {
        setError('Enter a name for the new category.');
        return;
      }
    }

    const formData = new FormData();
    if (topic.trim()) formData.append('topic', topic.trim());
    if (content.trim()) formData.append('content', content.trim());
    formData.append('count', String(count));
    formData.append('typePreference', typePreference);
    if (sourceFile) formData.append('source', sourceFile);

    try {
      const result = await generate(formData).unwrap();
      const nextDrafts = (result.drafts || []).map((draft) => normalizeDraft(draft));
      setDrafts(nextDrafts);
      setSourceSummary(result.sourceSummary || '');
      const initial = {};
      nextDrafts.forEach((draft) => {
        initial[draft.clientId] = true;
      });
      setSelected(initial);
    } catch (err) {
      resetResults();
      setError(errorMessage(err, 'Could not generate questions.'));
    }
  };

  const toggleDraft = (clientId) => {
    setSelected((current) => ({ ...current, [clientId]: !current[clientId] }));
  };

  const resolveCategoryId = async () => {
    if (target !== 'bank') return undefined;
    if (categoryMode === 'existing') return categoryId;
    const created = await createCategory({ name: newCategoryName.trim() }).unwrap();
    setCategoryId(created.categoryId);
    setCategoryMode('existing');
    setNewCategoryName('');
    return created.categoryId;
  };

  const handleSave = async () => {
    if (selectedDrafts.length === 0) {
      setError('Select at least one draft to save.');
      return;
    }

    for (const draft of selectedDrafts) {
      if (!draft.text.trim()) {
        setError('Selected drafts need question text.');
        return;
      }
      if (draft.type === 'OPEN_ENDED') continue;
      if (draft.options.some((option) => !option.option.trim())) {
        setError('Fill in every option on selected drafts, or remove empty ones.');
        return;
      }
      if (draft.options.filter((option) => option.isCorrect).length !== 1) {
        setError('Each selected draft needs exactly one correct option.');
        return;
      }
    }

    setError('');
    try {
      const resolvedCategoryId = await resolveCategoryId();
      await onSaveSelected({
        drafts: selectedDrafts.map(({ text, explanation, type, points, options }) => ({
          text,
          explanation,
          type,
          points,
          options,
        })),
        categoryId: resolvedCategoryId,
      });
      resetResults();
      setTopic('');
      setContent('');
      setSourceFile(null);
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'Failed to save selected questions.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-heading/25 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-ai-title"
        className="border-border bg-surface shadow-soft max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-dialog border"
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <p className="text-primary mb-1 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase">
              <AiSparklesIcon className="h-4 w-4" />
              Generate with AI
            </p>
            <h2 id="generate-ai-title" className="font-display text-heading text-xl">
              Draft questions from a topic, notes, PDF, or image
            </h2>
            <p className="text-muted mt-1 text-sm">
              Images are OCR’d to text first (saves model quota), then you can edit drafts inline.
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
              <div className="space-y-3">
                <p className="text-heading text-sm font-medium">Save into category</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="text-body inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="ai-category-mode"
                      checked={categoryMode === 'existing'}
                      onChange={() => setCategoryMode('existing')}
                    />
                    Existing category
                  </label>
                  <label className="text-body inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="ai-category-mode"
                      checked={categoryMode === 'new'}
                      onChange={() => setCategoryMode('new')}
                    />
                    Create new category
                  </label>
                </div>
                {categoryMode === 'existing' ? (
                  <select
                    id="ai-category"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select category…</option>
                    {categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="ai-new-category"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="e.g. Midterm revision"
                    className={fieldClass}
                  />
                )}
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
                className={fieldClass}
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
                rows={4}
                placeholder="Paste notes, outline, or excerpt…"
                className={fieldClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
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
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="ai-type" className="text-heading mb-1.5 block text-sm font-medium">
                  Type
                </label>
                <select
                  id="ai-type"
                  value={typePreference}
                  onChange={(event) => setTypePreference(event.target.value)}
                  className={fieldClass}
                >
                  <option value="MIXED">Mixed</option>
                  <option value="MCQ">MCQ only</option>
                  <option value="TRUE_FALSE">True/False only</option>
                  <option value="OPEN_ENDED">Essay only</option>
                </select>
              </div>
              <div>
                <label htmlFor="ai-source" className="text-heading mb-1.5 block text-sm font-medium">
                  PDF or image (optional)
                </label>
                <input
                  id="ai-source"
                  type="file"
                  accept="application/pdf,.pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
                  onChange={(event) => setSourceFile(event.target.files?.[0] || null)}
                  className="text-muted w-full text-sm file:border-border file:text-heading hover:file:bg-background file:mr-3 file:rounded-button file:border file:bg-background file:px-3 file:py-1.5"
                />
                {sourceFile ? (
                  <p className="text-muted mt-1 text-xs">{sourceFile.name}</p>
                ) : null}
              </div>
            </div>

            <button
              type="submit"
              disabled={generateState.isLoading || saving || createCategoryState.isLoading}
              className="ai-generate-btn rounded-button inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
            >
              <AiSparklesIcon className="h-5 w-5" />
              {generateState.isLoading
                ? sourceFile && !String(sourceFile.type || '').includes('pdf')
                  ? 'Reading image (OCR)…'
                  : 'Generating…'
                : 'Generate drafts'}
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
                  <p className="text-muted text-xs">
                    Edit text, options, and correct answers before saving
                    {sourceSummary ? ` · From ${sourceSummary}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    saving ||
                    createCategoryState.isLoading ||
                    selectedDrafts.length === 0
                  }
                  className="bg-primary hover:bg-primary-hover rounded-button px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving || createCategoryState.isLoading
                    ? 'Saving…'
                    : `Save selected (${selectedDrafts.length})`}
                </button>
              </div>

              <ul className="space-y-4">
                {drafts.map((draft, index) => (
                  <li
                    key={draft.clientId}
                    className="border-border bg-background rounded-card space-y-3 border px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-heading inline-flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={Boolean(selected[draft.clientId])}
                          onChange={() => toggleDraft(draft.clientId)}
                        />
                        Draft {index + 1}
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={draft.type}
                          onChange={(event) =>
                            updateDraft(draft.clientId, (current) =>
                              normalizeDraft({
                                ...current,
                                type: event.target.value,
                              }),
                            )
                          }
                          className="border-border bg-surface text-heading rounded-input border px-2 py-1 text-xs"
                        >
                          <option value="MCQ">MCQ</option>
                          <option value="TRUE_FALSE">True / False</option>
                          <option value="OPEN_ENDED">Essay</option>
                        </select>
                        <label className="text-muted inline-flex items-center gap-1 text-xs">
                          Points
                          <input
                            type="number"
                            min={0.01}
                            step={0.5}
                            value={draft.points}
                            onChange={(event) =>
                              updateDraft(draft.clientId, {
                                points: Number(event.target.value) || 1,
                              })
                            }
                            className="border-border bg-surface text-heading w-16 rounded-input border px-2 py-1 text-xs"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-medium">
                        Question
                      </label>
                      <textarea
                        value={draft.text}
                        onChange={(event) =>
                          updateDraft(draft.clientId, { text: event.target.value })
                        }
                        rows={2}
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-medium">
                        {draft.type === 'OPEN_ENDED'
                          ? 'Grading rubric'
                          : 'Explanation (optional)'}
                      </label>
                      <input
                        value={draft.explanation}
                        onChange={(event) =>
                          updateDraft(draft.clientId, {
                            explanation: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    </div>

                    {draft.type !== 'OPEN_ENDED' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-muted text-xs font-medium">Options</p>
                        {draft.type === 'MCQ' ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft(draft.clientId, (current) => ({
                                ...current,
                                options: [
                                  ...current.options,
                                  { option: '', isCorrect: false },
                                ],
                              }))
                            }
                            className="text-primary text-xs font-medium hover:underline"
                          >
                            Add option
                          </button>
                        ) : null}
                      </div>
                      <ul className="space-y-2">
                        {draft.options.map((option, optionIndex) => (
                          <li
                            key={`${draft.clientId}-opt-${optionIndex}`}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name={`correct-${draft.clientId}`}
                              checked={option.isCorrect}
                              onChange={() =>
                                updateDraft(draft.clientId, (current) => ({
                                  ...current,
                                  options: current.options.map((row, rowIndex) => ({
                                    ...row,
                                    isCorrect: rowIndex === optionIndex,
                                  })),
                                }))
                              }
                              aria-label={`Mark option ${optionIndex + 1} correct`}
                            />
                            <input
                              value={option.option}
                              disabled={draft.type === 'TRUE_FALSE'}
                              onChange={(event) =>
                                updateDraft(draft.clientId, (current) => ({
                                  ...current,
                                  options: current.options.map((row, rowIndex) =>
                                    rowIndex === optionIndex
                                      ? { ...row, option: event.target.value }
                                      : row,
                                  ),
                                }))
                              }
                              className={fieldClass}
                            />
                            {draft.type === 'MCQ' && draft.options.length > 2 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  updateDraft(draft.clientId, (current) => {
                                    const options = current.options.filter(
                                      (_, rowIndex) => rowIndex !== optionIndex,
                                    );
                                    if (!options.some((row) => row.isCorrect) && options[0]) {
                                      options[0] = { ...options[0], isCorrect: true };
                                    }
                                    return { ...current, options };
                                  })
                                }
                                className="text-danger shrink-0 text-xs font-medium"
                              >
                                Remove
                              </button>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                    ) : (
                      <p className="text-muted text-xs">
                        Essay draft — students write free text; rubric guides AI/human grading.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
