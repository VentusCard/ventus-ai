import { getSourceColor, getSourceLabel } from "@/lib/sampleData";

type Size = "xs" | "sm";

const SIZE_CLASSES: Record<Size, { wrap: string; prefix: string; name: string }> = {
  xs: {
    wrap: "px-1.5 py-px text-[9px]",
    prefix: "text-[9px]",
    name: "text-[9px]",
  },
  sm: {
    wrap: "px-1.5 py-0.5 text-[10.5px]",
    prefix: "text-[10px]",
    name: "text-[10.5px]",
  },
};

interface Props {
  source?: string | null;
  size?: Size;
  className?: string;
}

/**
 * Two-axis source label:
 *   • monospace bracket prefix [CARD] / [ACH] / [WIRE] / [ZELLE] …
 *   • subtle color tint (cards only) — direct funds stay neutral slate
 */
export function SourceTag({ source, size = "sm", className = "" }: Props) {
  if (!source) {
    return <span className="text-[11px] text-slate-400">—</span>;
  }
  const label = getSourceLabel(source);
  const color = getSourceColor(source);
  const s = SIZE_CLASSES[size];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border whitespace-nowrap font-medium ${s.wrap} ${color} ${className}`}
    >
      <span className={`font-mono opacity-70 ${s.prefix}`}>[{label.prefix}]</span>
      {label.isCard && label.name && (
        <span className={s.name}>{label.name}</span>
      )}
    </span>
  );
}
