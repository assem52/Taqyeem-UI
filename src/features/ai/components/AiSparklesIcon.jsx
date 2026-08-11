/**
 * AI folder mark from /public/ai-folder.png — used on Generate with AI controls.
 */
export default function AiSparklesIcon({
  className = 'h-5 w-5',
  title = 'AI',
}) {
  return (
    <img
      src="/ai-folder.png"
      alt={title}
      title={title}
      className={`ai-brand-icon shrink-0 object-contain ${className}`}
      draggable={false}
    />
  );
}
