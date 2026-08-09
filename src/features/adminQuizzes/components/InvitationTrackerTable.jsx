import { useState } from 'react';
import {
  useGetQuizInvitationsQuery,
  useResendInvitationMutation,
} from '../adminQuizzesApi';

const STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  STARTED: 'Started',
  ACCEPTED: 'Accepted / Enrolled',
  SENT: 'Invite sent',
  FAILED: 'Invite failed',
  NOT_STARTED: 'Not started',
};

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function InvitationTrackerTable({ quizId }) {
  const { data, isLoading, isError, refetch } = useGetQuizInvitationsQuery(quizId, {
    skip: !quizId,
  });
  const [resendInvitation, { isLoading: isResending }] = useResendInvitationMutation();
  const [copiedEmail, setCopiedEmail] = useState('');
  const [resendNote, setResendNote] = useState('');
  const [resendingId, setResendingId] = useState('');

  if (isLoading) {
    return <p className="text-muted py-6 text-center text-sm">Loading invitations…</p>;
  }

  if (isError || !data) {
    return (
      <div className="border-border rounded-card border px-4 py-6 text-center">
        <p className="text-danger text-sm">Could not load invitations.</p>
        <button
          type="button"
          onClick={refetch}
          className="border-border text-heading hover:bg-background mt-3 rounded-button border px-3 py-1.5 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, rows, note } = data;

  const handleResend = async (invitationId, email) => {
    setResendNote('');
    setResendingId(invitationId);
    try {
      const result = await resendInvitation({ quizId, invitationId }).unwrap();
      setResendNote(
        result.status === 'SENT'
          ? `Resent to ${email}${result.deliveryMode === 'simulated' ? ' (simulated — use Copy link)' : ''}.`
          : `Resend failed for ${email}. Copy the invite link instead.`,
      );
    } catch {
      setResendNote(`Could not resend to ${email}.`);
    } finally {
      setResendingId('');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted text-sm">
        {summary.total} invited
        {' · '}
        {summary.byStatus.SENT ?? 0} invite sent
        {' · '}
        {summary.byStatus.ACCEPTED ?? 0} accepted
        {' · '}
        {summary.byStatus.STARTED ?? 0} started
        {' · '}
        {summary.byStatus.SUBMITTED ?? 0} submitted
        {' · '}
        {summary.byStatus.FAILED ?? 0} failed
      </p>

      {note && <p className="text-muted text-xs leading-relaxed">{note}</p>}
      {resendNote ? <p className="text-sm text-heading">{resendNote}</p> : null}

      <div className="border-border overflow-hidden rounded-card border">
        <table className="w-full text-left text-sm">
          <thead className="border-border bg-background text-muted border-b text-xs font-semibold tracking-wide uppercase">
            <tr>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted px-3 py-8 text-center text-sm">
                  No invitations yet. Use Invite students to send the first batch.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={`${row.email}-${idx}`}>
                  <td className="text-heading px-3 py-2.5 font-mono text-xs">{row.email}</td>
                  <td className="text-body px-3 py-2.5">
                    {row.studentName || <span className="text-muted">Not registered</span>}
                  </td>
                  <td className="text-body px-3 py-2.5 text-xs font-medium">
                    {STATUS_LABELS[row.status] ?? row.status}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {row.inviteUrl ? (
                        <button
                          type="button"
                          className="text-primary hover:text-primary-hover text-xs font-semibold"
                          onClick={async () => {
                            const ok = await copyText(row.inviteUrl);
                            if (ok) {
                              setCopiedEmail(row.email);
                              setTimeout(() => setCopiedEmail(''), 1500);
                            }
                          }}
                        >
                          {copiedEmail === row.email ? 'Copied' : 'Copy link'}
                        </button>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                      {row.invitationId ? (
                        <button
                          type="button"
                          disabled={isResending && resendingId === row.invitationId}
                          className="text-xs font-semibold text-heading underline disabled:opacity-50"
                          onClick={() => handleResend(row.invitationId, row.email)}
                        >
                          {isResending && resendingId === row.invitationId
                            ? 'Resending…'
                            : row.status === 'FAILED'
                              ? 'Resend email'
                              : 'Resend'}
                        </button>
                      ) : null}
                    </div>
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
