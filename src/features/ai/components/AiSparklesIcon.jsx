import aiFolderIcon from '../../../assets/ai-folder.png';

/**
 * AI folder mark — used on Generate with AI controls.
 */
export default function AiSparklesIcon({
  className = 'h-5 w-5',
  title = 'AI',
}) {
  return (
    <img
      src={aiFolderIcon}
      alt={title}
      title={title}
      className={`ai-brand-icon shrink-0 object-contain ${className}`}
      draggable={false}
    />
  );
}
