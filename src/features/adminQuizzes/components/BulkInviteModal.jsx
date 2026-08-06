import { useState } from 'react';
import { useBulkInviteStudentsMutation } from '../adminQuizzesApi';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fieldClass =
  'border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 w-full rounded-input border px-3.5 py-2.5 text-sm outline-none focus:ring-2';

export default function BulkInviteModal({ isOpen, onClose, quiz }) {
  const [rawText, setRawText] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [bulkInvite, { isLoading }] = useBulkInviteStudentsMutation();

  if (!isOpen || !quiz) return null;

  const parseEmails = (input) =>
    input
      .split(/[\n,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);

  const parsedEmails = parseEmails(rawText);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(
        `File exceeds 5MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Choose a smaller file.`,
      );
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setRawText((prev) => (prev ? `${prev}\n${text}` : text));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSummaryResult(null);

    if (parsedEmails.length === 0) {
      setErrorMsg('Enter or upload at least one email address.');
      return;
    }

    try {
      const res = await bulkInvite({
        quizId: quiz.quizId,
        emails: parsedEmails,
      }).unwrap();
      setSummaryResult(res);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Failed to send invitations.');
    }
  };

  const handleReset = () => {
    setRawText('');
    setSummaryResult(null);
    setErrorMsg('');
  };

  const closeAll = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
        className="bg-surface border-border rounded-dialog w-full max-w-xl overflow-hidden border shadow-soft"
      >
        <div className="border-border flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="invite-modal-title" className="font-display text-heading text-xl">
              Invite students
            </h2>
            <p className="text-muted mt-1 text-sm">{quiz.title}</p>
          </div>
          <button type="button" onClick={closeAll} className="text-muted hover:text-heading text-sm font-medium">
            Close
          </button>
        </div>

        <div className="max-h-[80vh] space-y-5 overflow-y-auto p-5">
          {errorMsg && (
            <div className="border-danger/20 bg-danger/5 text-danger rounded-button border px-3 py-2 text-sm">
              {errorMsg}
            </div>
          )}

          {!summaryResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="invite-emails" className="text-heading text-sm font-medium">
                    Email addresses
                  </label>
                  <span className="text-muted text-xs">
                    {parsedEmails.length} detected
                  </span>
                </div>
                <textarea
                  id="invite-emails"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={6}
                  placeholder="One email per line, or separated by commas"
                  className={`${fieldClass} font-mono`}
                />
              </div>

              <div>
                <label htmlFor="invite-file" className="text-heading mb-1.5 block text-sm font-medium">
                  Or upload a CSV / text file
                </label>
                <input
                  id="invite-file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="text-muted file:border-border file:bg-background file:text-heading w-full text-sm file:mr-3 file:rounded-button file:border file:px-3 file:py-2 file:text-sm file:font-medium"
                />
              </div>

              <div className="border-border flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={closeAll}
                  className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || parsedEmails.length === 0}
                  className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isLoading
                    ? 'Sending…'
                    : `Send ${parsedEmails.length} invitation${parsedEmails.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                {[
                  ['Total', summaryResult.total],
                  ['Sent', summaryResult.sent],
                  ['Duplicates', summaryResult.duplicates],
                  ['Invalid', summaryResult.invalid],
                  ['Failed', summaryResult.failed],
                ].map(([label, value]) => (
                  <div key={label} className="border-border rounded-button border px-3 py-2">
                    <dt className="text-muted text-xs">{label}</dt>
                    <dd className="text-heading mt-0.5 text-lg font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="border-border overflow-hidden rounded-card border">
                <table className="w-full text-left text-sm">
                  <thead className="border-border bg-background text-muted border-b text-xs font-semibold tracking-wide uppercase">
                    <tr>
                      <th className="px-3 py-2.5">Email</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {summaryResult.results.map((res, i) => (
                      <tr key={`${res.email}-${i}`}>
                        <td className="text-heading px-3 py-2.5 font-mono text-xs">{res.email}</td>
                        <td className="text-body px-3 py-2.5 text-xs font-medium">{res.status}</td>
                        <td className="text-muted px-3 py-2.5 text-xs">{res.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-border flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="border-border text-heading hover:bg-background rounded-button border px-4 py-2.5 text-sm font-medium"
                >
                  Invite more
                </button>
                <button
                  type="button"
                  onClick={closeAll}
                  className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
