import { useGetQuizInvitationsQuery } from '../adminQuizzesApi';

const STATUS_BADGES = {
  SUBMITTED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  STARTED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  ACCEPTED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  SENT: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  FAILED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  NOT_STARTED: 'bg-slate-700/40 text-slate-400 border-slate-700',
};

const STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  STARTED: 'Started',
  ACCEPTED: 'Accepted',
  SENT: 'Sent',
  FAILED: 'Failed',
  NOT_STARTED: 'Not Started',
};

export default function InvitationTrackerTable({ quizId, quizTitle }) {
  const { data, isLoading, isError, refetch } = useGetQuizInvitationsQuery(quizId, {
    skip: !quizId,
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-500 border-t-transparent mb-2"></div>
        <div>Loading invitation statuses...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
        <p className="text-sm text-rose-400 mb-3">Failed to load invitation data for this quiz.</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const { summary, rows, note } = data;

  return (
    <div className="space-y-4">
      {/* Summary Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          Total Invited: <strong className="text-slate-100">{summary.total}</strong>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
          Sent: <strong>{summary.byStatus.SENT ?? 0}</strong>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
          Accepted: <strong>{summary.byStatus.ACCEPTED ?? 0}</strong>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
          Started: <strong>{summary.byStatus.STARTED ?? 0}</strong>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          Submitted: <strong>{summary.byStatus.SUBMITTED ?? 0}</strong>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
          Failed: <strong>{summary.byStatus.FAILED ?? 0}</strong>
        </div>
      </div>

      {note && (
        <div className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          💡 {note}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3.5">Student Email</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Invitation Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500 font-sans">
                  No invitations have been sent for this quiz yet. Use the <strong>Bulk Invite</strong> button above to invite students.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition">
                  <td className="p-3.5 text-slate-200 font-medium">{row.email}</td>
                  <td className="p-3.5 text-slate-400 font-sans">
                    {row.studentName || <span className="text-slate-600 italic">Not registered yet</span>}
                  </td>
                  <td className="p-3.5 font-sans">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        STATUS_BADGES[row.status] ?? STATUS_BADGES.NOT_STARTED
                      }`}
                    >
                      {STATUS_LABELS[row.status] ?? row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
