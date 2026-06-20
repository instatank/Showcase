import { ReactNode } from "react";

/** Consistent section heading: small eyebrow label + larger title. */
export default function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {children && (
        <div className="mt-4 text-lg leading-relaxed text-muted">{children}</div>
      )}
    </div>
  );
}
