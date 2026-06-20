import type { StatusTag as StatusTagType } from "@/data/apps";

const styles: Record<StatusTagType, string> = {
  "Daily driver": "bg-accent-soft text-accent",
  Shipped: "bg-emerald-50 text-emerald-700",
  "In progress": "bg-amber-50 text-amber-700",
  Prototype: "bg-stone-100 text-stone-600",
};

/** Small pill showing an app's status (PRD §6). */
export default function StatusTag({ status }: { status: StatusTagType }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
