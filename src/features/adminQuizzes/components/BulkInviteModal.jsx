import { useState } from 'react';
import { useBulkInviteStudentsMutation } from '../adminQuizzesApi';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB file size guard to prevent tab freezing

export default function BulkInviteModal({ isOpen, onClose, quiz }) {
  const [rawText, setRawText] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [bulkInvite, { isLoading }] = useBulkInviteStudentsMutation();

  if (!isOpen || !quiz) return null;

  const parseEmails = (input) => {
    return input
      .split(/[\n,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);
  };

  const parsedEmails = parseEmails(rawText);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(
        `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(
          2,
        )} MB). Please select a smaller file.`,
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
      setErrorMsg('Please enter or upload at least one email address.');
      return;
    }

    try {
      const res = await bulkInvite({
        quizId: quiz.quizId,
        emails: parsedEmails,
      }).unwrap();

      setSummaryResult(res);
    } catch (err) {
      setErrorMsg(
        err?.data?.message || 'Failed to dispatch invitations. Please try again.',
      );
    }
  };

  const handleReset = () => {
    setRawText('');
    setSummaryResult(null);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Bulk Invite Students
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Quiz: <span className="text-slate-200 font-medium">{quiz.title}</span>
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-200 text-xl font-bold px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium flex justify-between items-center">
              <div>{errorMsg}</div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-rose-400 hover:text-rose-200 font-bold px-2"
              >
                ✕
              </button>
            </div>
          )}

          {!summaryResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Paste Student Email Addresses
                  </label>
                  <span className="text-xs text-emerald-400 font-mono">
                    {parsedEmails.length} recipient{parsedEmails.length === 1 ? '' : 's'} detected
                  </span>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={6}
                  placeholder="Paste emails separated by commas, spaces, or newlines:&#10;alice@example.com&#10;bob@example.com, charlie@example.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-hidden focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Or Upload CSV / Text File (Max 5MB)
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || parsedEmails.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Dispatching...' : `Send ${parsedEmails.length} Invitation${parsedEmails.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </form>
          ) : (
            /* Results Summary Section */
            <div className="space-y-5">
              {summaryResult.deliveryMode === 'simulated' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>
                    <strong>Simulated Mode Active:</strong> {summaryResult.sent} invitation{summaryResult.sent === 1 ? '' : 's'} logged locally — no network email sent (SMTP_HOST unconfigured).
                  </span>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Total</div>
                  <div className="text-lg font-bold text-slate-100">{summaryResult.total}</div>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                  <div className="text-xs text-emerald-400">
                    {summaryResult.deliveryMode === 'simulated' ? 'Simulated' : 'Sent'}
                  </div>
                  <div className="text-lg font-bold text-emerald-400">{summaryResult.sent}</div>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-400">Duplicates</div>
                  <div className="text-lg font-bold text-amber-400">{summaryResult.duplicates}</div>
                </div>
                <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/30">
                  <div className="text-xs text-orange-400">Invalid</div>
                  <div className="text-lg font-bold text-orange-400">{summaryResult.invalid}</div>
                </div>
                <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
                  <div className="text-xs text-rose-400">Failed</div>
                  <div className="text-lg font-bold text-rose-400">{summaryResult.failed}</div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Recipient Dispatch Log
                </h3>
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="p-3">Email</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Reason / Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {summaryResult.results.map((res, i) => (
                        <tr key={i} className="hover:bg-slate-900/50">
                          <td className="p-3 text-slate-200">{res.email}</td>
                          <td className="p-3">
                            {res.status === 'SENT' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                {summaryResult.deliveryMode === 'simulated' ? 'SIMULATED' : 'SENT'}
                              </span>
                            )}
                            {res.status === 'DUPLICATE' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                DUPLICATE
                              </span>
                            )}
                            {res.status === 'INVALID' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30">
                                INVALID
                              </span>
                            )}
                            {res.status === 'FAILED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                                FAILED
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400 italic">
                            {res.reason || (summaryResult.deliveryMode === 'simulated' ? 'Logged in simulated mode' : '—')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
                >
                  Send More Invites
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
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
