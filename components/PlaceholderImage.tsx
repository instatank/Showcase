/**
 * PlaceholderImage — a labelled block standing in for a real screenshot
 * (PRD §7). Shows the path where the real asset belongs so it's obvious what
 * to drop in later. Fills its parent; the parent controls aspect.
 *
 * To swap in a real image, replace usages of this with next/image <Image>
 * (see the <Visual> component for the single place to change).
 */
export default function PlaceholderImage({
  label,
  src,
  className = "",
}: {
  label: string;
  src: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-raised to-surface p-4 text-center ${className}`}
      role="img"
      aria-label={label}
    >
      <span className="rounded-full border border-hairline bg-paper/60 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
        Placeholder
      </span>
      <span className="text-sm font-medium text-ink/60">{label}</span>
      <code className="max-w-full truncate font-mono text-[11px] text-muted/70">
        {src}
      </code>
    </div>
  );
}
