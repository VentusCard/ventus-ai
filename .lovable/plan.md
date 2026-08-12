# Restyle the elements inside the Ventus core

The core card already uses the reference's dark gradient shell. The elements inside it — header, signal buttons, the SVG bus, and the team buttons — still use the older look. This change brings them to the same grammar as the reference, with no change to content, click targets, or navigation.

## What changes

Core header
- Keep the Ventus mark + title row, then add a muted one-line description under it (`text-[11.5px] leading-relaxed text-slate-400`) instead of the current bottom-border divider.
- Drop the `border-b border-white/[0.08]` rule so the header reads as the reference's flat block.

Signal rows (left column)
- Replace the icon-pill button with the reference detection row: `rounded-[9px] border-white/[0.08] bg-white/[0.045]`, a 3px left color bar in the signal's color, a 7px dot with a soft color halo, the signal name at `12.5px font-semibold text-slate-100`, and a right-aligned mono `N · 24h` count.
- Second line inside each row: mono/muted "what it feeds" meta text plus a small basis chip on the right (first-party / modeled), matching the reference's `ev → to` line.
- Rows stay buttons; selected state becomes `border-white/25 bg-white/[0.11]` (unchanged behavior).

Team rows (right column)
- Same row shell as the signals: left color bar, 12.5px name, mono meta under it, right-side chip. Removes the current icon tile so both columns read as one family.

Middle bus
- Simplify the SVG: keep the vertical bus bar and center hub, but flatten the gradients/glow to the reference's muted treatment (thin strokes, no `feGaussianBlur` halo, no pulsing radius) and respect `prefers-reduced-motion`.

Column labels
- Keep "Signals detected" / "Teams served" as mono `text-[9.5px] uppercase tracking-wider text-slate-500`, with `whitespace-nowrap` so they never wrap at narrow widths.

## Scope

- Single file: `src/components/tepilot/insights/CapabilitiesView.tsx` (core card block only, roughly lines 844–1030).
- Presentation only — `SIGNALS`, `TEAMS`, and the `selectSignal` / `selectTeam` handlers are reused as-is, so clicking a signal or team still opens the same detail panel.
- Verified afterwards with a Playwright screenshot of `/bankdemo` → System tab.
