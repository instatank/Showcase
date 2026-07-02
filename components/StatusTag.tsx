import type { StatusTag as StatusTagType } from "@/data/apps";

const styles: Record<StatusTagType, string> = {
  "Daily driver": "border-accent-edge bg-accent-soft text-accent-bright",
  Shipped: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  "In progress": "border-amber-400/25 bg-amber-400/10 text-amber-300",
  Prototype: "border-white/10 bg-white/5 text-muted",
};

/** Small mono pill showing an app's status (PRD §6). */
export default function StatusTag({ status }: { status: StatusTagType }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
      {status}
    </span>
  );
}
