import { cn } from "@/lib/utils";

interface PulseDotProps {
  /** Tailwind background color class, e.g. "bg-emerald-500" */
  colorClass?: string;
  /** Inline background color (when the color is not a Tailwind class) */
  color?: string;
  /** Dot diameter class pair, e.g. "h-2 w-2" */
  sizeClass?: string;
  /** Disable the halo animation */
  pulse?: boolean;
  /** Stagger the halo so lists don't blink in unison */
  delayMs?: number;
  className?: string;
}

/**
 * Small status indicator: a solid dot with a soft same-color halo that
 * expands and fades behind it. Reduced-motion users get the solid dot only.
 */
export function PulseDot({
  colorClass = "bg-emerald-500",
  color,
  sizeClass = "h-2 w-2",
  pulse = true,
  delayMs = 0,
  className,
}: PulseDotProps) {
  return (
    <span
      className={cn("relative inline-flex flex-none items-center justify-center", sizeClass, className)}
    >
      {pulse && (
        <span
          className={cn(
            "ventus-pulse-halo absolute inset-0 rounded-full opacity-60",
            !color && colorClass,
          )}
          style={{
            ...(color ? { background: color } : null),
            animationDelay: `${delayMs}ms`,
          }}
        />
      )}
      <span
        className={cn("relative rounded-full", sizeClass, !color && colorClass)}
        style={color ? { background: color } : undefined}
      />
    </span>
  );
}
