/**
 * Brand AI mark from /public/ai.png — used on Generate / Ask AI controls.
 */
export default function AiSparklesIcon({
  className = 'h-5 w-5',
  title = 'AI',
}) {
  return (
    <img
      src="/ai.png"
      alt={title}
      title={title}
      className={`ai-brand-icon shrink-0 object-contain ${className}`}
      draggable={false}
    />
  );
}
