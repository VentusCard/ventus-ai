# Hover Explanations for Behavioral Intelligence Labels

On `/demo`, in the Behavioral Intelligence step (`ExecDemoIntelPanel.tsx`, lines ~828–857), wrap each of the three row labels in a shadcn `Tooltip` so hovering reveals what Ventus detects under that category.

## Tooltip copy

**Spending Habits** (cyan label)

> Dynamic behavioral labels derived from 3-tier semantic enrichment . Patterns adapt to the customer's life: e.g. "Club tennis player (summer season)", "Weeknight Thai takeout regular", "Luxury fitness loyalist".

**Life Event Detection** (amber label)

> 20+ major life events detected  before the customer tells you — new baby, home purchase, relocation, marriage, divorce, new job and more. 

**Risk Factors** (red label)

> Obfuscated behavioral risk signals across Financial Vulnerability Indicators, trend deterioration, vice exposure, and fraud/AML patterns. 

## Implementation notes

- Use the existing `@/components/ui/tooltip` primitives (`Tooltip`, `TooltipTrigger`, `TooltipContent`, with a single `TooltipProvider` wrapping the three rows).
- Trigger: wrap the `<p>` label with `TooltipTrigger asChild` and add a subtle `cursor-help` plus a small `Info` icon (lucide `Info`, `w-3 h-3`, same color as the label) inline after the label text so users know it's hoverable.
- `TooltipContent`: `max-w-xs`, `text-xs leading-relaxed`, `side="top"`, `align="start"`. Strict light theme (white bg, slate-200 border, slate-700 text) per project memory — no dark mode utilities.
- Keep copy "vaguely specific" — no exact transaction counts or dollar figures (per Core memory).
- No changes to pill logic, animations, or data — labels only.

## Scope

- One file edited: `src/components/exec-demo/ExecDemoIntelPanel.tsx`.
- No backend, schema, or routing changes.