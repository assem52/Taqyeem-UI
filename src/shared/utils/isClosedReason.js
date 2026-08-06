export function isClosedReason(reason) {
    if (!reason || typeof reason !== 'string') return false;
    const lower = reason.toLowerCase();
    return lower.includes('closed') ||
           lower.includes('expired') ||
           lower.includes('window closed') ||
           lower.includes('deadline passed') ||
           lower.includes('unavailable');
}
