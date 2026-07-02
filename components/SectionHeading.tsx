import { ReactNode } from "react";

/**
 * Consistent section heading: a numbered mono eyebrow ("01 / journey") +
 * large display title. The numbering gives the one-page scroll a clear,
 * scannable structure.
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  children,
  align = "left",
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
      }
    >
      {eyebrow && (
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-accent sm:text-sm">
          {index && <span className="text-muted">{index} / </span>}
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
        {title}
      </h2>
      {children && (
        <div className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {children}
        </div>
      )}
    </div>
  );
}
