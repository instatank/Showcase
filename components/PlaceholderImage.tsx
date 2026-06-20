/**
 * PlaceholderImage — a solid-fill labelled block standing in for a real
 * screenshot (PRD §7). Shows the path where the real asset belongs so it's
 * obvious what to drop in later. Fills its parent; the parent controls aspect.
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
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-100 to-stone-200 p-4 text-center ${className}`}
      role="img"
      aria-label={label}
    >
      <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted">
        Placeholder
      </span>
      <span className="text-sm font-medium text-ink/70">{label}</span>
      <code className="max-w-full truncate text-[11px] text-muted/80">{src}</code>
    </div>
  );
}
