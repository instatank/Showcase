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
    <div className={`mx-auto w-full max-w-[300px] ${className}`}>
      <div className="relative rounded-[2.5rem] border border-white/10 bg-[#1c1c21] p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-black/40">
        {/* screen */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-surface">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#1c1c21]" />
          {children}
        </div>
      </div>
    </div>
  );
}
