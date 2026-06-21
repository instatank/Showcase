import { ReactNode } from "react";

/**
 * DeviceFrame — wraps a screenshot in one consistent phone frame so every app
 * is presented identically (PRD §7: "same frame, same shadow/treatment").
 *
 * Presentational only: it draws the bezel, notch and shadow and constrains the
 * screen area to a phone aspect ratio. Pass the screenshot (real <Image> or a
 * <PlaceholderImage>) as children.
 */
export default function DeviceFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    // ~25% smaller than the original 300px so the detail-page screenshots sit
    // more compactly (DeviceFrame is only used on the app detail page).
    <div className={`mx-auto w-full max-w-[225px] ${className}`}>
      <div className="relative rounded-[2.5rem] border border-hairline bg-ink p-2.5 shadow-[0_30px_60px_-20px_rgba(27,26,24,0.35)] ring-1 ring-black/5">
        {/* screen */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-surface">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
          {children}
        </div>
      </div>
    </div>
  );
}
