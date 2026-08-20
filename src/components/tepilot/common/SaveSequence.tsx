import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveSequenceStatus } from "@/hooks/useSaveSequence";

interface SaveSequenceProps {
  status: SaveSequenceStatus;
  label: string;
  /** `inline` sits inside a button, `block` is a row/card banner. */
  variant?: "inline" | "block";
  className?: string;
}

/**
 * Presentational save-processing indicator: spinner + staged text,
 * settling into a green check. Light theme only.
 */
export function SaveSequence({ status, label, variant = "inline", className }: SaveSequenceProps) {
  if (status === "idle") return null;

  const done = status === "done";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 animate-fade-in",
        variant === "block" &&
          "w-full rounded-md border px-3 py-2 text-[11px] font-medium",
        variant === "block" && (done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"),
        variant === "inline" && "text-[11px] font-semibold",
        done ? "text-emerald-600" : "text-slate-600",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {done ? (
        <Check className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-500" />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}

/** Wrapper that dims and disables a card while a save sequence runs. */
export function SaveSequenceSurface({
  busy,
  children,
  className,
}: {
  busy: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "transition-opacity duration-200",
        busy && "opacity-60 pointer-events-none select-none",
        className,
      )}
      aria-busy={busy}
    >
      {children}
    </div>
  );
}
