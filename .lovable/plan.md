# Recolor Data sources wrappers and cards to cool greys

## Goal
In `/bankdemo` → System tab → Data sources column, move the Internal signals / External signals wrappers and their source cards away from sky/amber tints to a cohesive grey-based palette that reads as calm, technical, and easy on a large screen.

## What will change

All edits in `src/components/tepilot/insights/CapabilitiesView.tsx`.

1. **Section wrappers**
   - Replace `border-sky-100 bg-sky-50/40` (Internal) and `border-amber-100 bg-amber-50/40` (External) with two distinct cool-grey tints.
   - Proposed pair: Internal `bg-slate-50/50 border-slate-200`, External `bg-zinc-50/60 border-zinc-200` — both light, but visibly different.
2. **Section header pills**
   - Drop sky/amber pills.
   - Internal: `bg-slate-200 text-slate-700`.
   - External: `bg-zinc-200 text-zinc-700`.
3. **Section taglines**
   - Keep the bold 14px treatment but switch to matching dark greys: Internal `text-slate-800`, External `text-zinc-800`.
4. **Source cards (`SourceGroupCard`)**
   - Icon tile: swap sky/amber for the wrapper's grey family, e.g. `bg-slate-100 text-slate-600` / `bg-zinc-100 text-zinc-600`.
   - Active ring: `border-slate-300 ring-slate-200` for Internal, `border-zinc-300 ring-zinc-200` for External.
   - Default border stays `border-slate-100` / hover `border-slate-200` for both (or per-section subtle variant).
5. **Preserve**
   - Layout, typography sizes, status pills, click behavior, detail panel, and connector colors.

## Style rules
- Strict light theme; no `dark:` utilities.
- Keep AA contrast; dark greys (`slate-700`/`zinc-700` and `slate-800`/`zinc-800`) on white/grey surfaces.
- Avoid introducing new accent colors beyond the two greys.

## Out of scope
- Intelligence Core dark panel, signal family cards, and Activation destinations column stay as-is.
- No functional or data changes.

## Verification
- Type check passes.
- Screenshot of `/bankdemo` System tab Data sources column confirms the two sections are clearly distinguished by grey tone and no sky/amber remains in that column.
