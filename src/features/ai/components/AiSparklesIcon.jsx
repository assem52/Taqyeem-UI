/**
 * Modern “AI sparkles” mark — the shape people recognize from AI generate CTAs.
 */
export default function AiSparklesIcon({ className = 'h-4 w-4', title = 'AI' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      className={`ai-sparkles-icon shrink-0 ${className}`}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 2.2l1.35 4.55L18 8.1l-4.65 1.35L12 14l-1.35-4.55L6 8.1l4.65-1.35L12 2.2z" />
      <path
        d="M18.6 13.2l.75 2.45 2.45.75-2.45.75-.75 2.45-.75-2.45-2.45-.75 2.45-.75.75-2.45z"
        className="ai-sparkles-icon__accent"
      />
      <path
        d="M5.4 14.4l.55 1.8 1.8.55-1.8.55-.55 1.8-.55-1.8-1.8-.55 1.8-.55.55-1.8z"
        className="ai-sparkles-icon__accent"
      />
    </svg>
  );
}
