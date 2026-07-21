/** Format an ISO UTC date for display in the local timezone. */
export function formatClosesAt(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
