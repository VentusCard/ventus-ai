# Glassmorphic pass on the home page

Bring the frosted-glass depth and soft color hues from Cobalt-style enterprise sites onto `/`, while staying inside the strict light theme (white base, no dark mode).

## Visual direction

- **Light glass, not dark glass.** Panels are white at 55-70% opacity with a 12-20px backdrop blur, a 1px hairline border in white/70 over slate-200, and a soft outer shadow. No heavy translucency over busy content.
- **Hues as ambient wash, not fill.** Large, very low-opacity radial blobs (sky, indigo, violet — the same family the priority sliver uses) sit behind sections and bleed through the glass. Nothing above ~10% opacity so text contrast stays enterprise-safe.
- **One accent.** Ventus blue stays the only saturated CTA color.

## Where it applies

1. **Floating nav** — sticky pill/bar with backdrop blur, translucent white, hairline border; becomes slightly more opaque on scroll.
2. **Hero (`ScrollDrivenHero`)** — soft sky/indigo hue field behind the headline; the scroll card sits on a glass surface with a subtle inner highlight along the top edge.
3. **Capability cards** — glass surface with the existing per-layer accent showing as a faint tinted glow behind each card instead of a flat white card.
4. **Problem statement / Solution sections** — one ambient hue blob per section, alternating warm-neutral and cool, so the page has rhythm rather than one continuous gradient.
5. **Integration section + CTA** — the CTA block becomes the strongest glass moment: tinted gradient wash, blurred panel, single blue button.
6. **FAQ** — left as-is structurally; accordion sits on a light glass panel.

## Technical notes

- Add reusable tokens/utilities in `src/index.css` (or the shared styles file): `--glass-bg`, `--glass-border`, `--glass-shadow`, plus a `.ventus-glass` and `.ventus-hue-blob` utility so sections don't hand-roll blur values.
- Use `backdrop-blur` with a solid fallback background for browsers without backdrop-filter support.
- Keep all colors as semantic tokens; no hardcoded `bg-white/…` sprinkled across components beyond the shared utility.
- Files touched: `src/index.css`, `src/components/ScrollDrivenHero.tsx`, `CapabilityCards.tsx`, `ProblemStatementSection.tsx`, `SolutionSections.tsx`, `IntegrationSection.tsx`, `CTA.tsx`, the nav component, and `src/pages/Index.tsx` for section wrappers.
- Blur is GPU-costly: cap the number of simultaneously blurred surfaces per viewport and avoid animating blur radius.

## Out of scope

- No dark mode, no changes to `/bankdemo` or other demo routes, no copy changes.
