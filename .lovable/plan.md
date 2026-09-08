# Signal-first homepage animation

## Goal
Replace the homepage’s transaction-processing animation with a signal-first story that mirrors the strongest logic from `/bankdemo` while using the selected Neural Orchestration Hub composition.

## Experience
- Keep the current headline, supporting copy, Schedule Demo and Learn More actions, floating navigation, and Manrope typography.
- Keep the page light and airy, but make the Customer Intelligence Core a high-contrast deep navy focal point.
- Use an asymmetric converging-stream composition:

```text
Internal Signals ──────╲
                        Customer Intelligence Core ─── Orchestrated Experiences
External Intelligence ─╱      five signal families       customer + bank facing
```

- Remove all raw transaction strings, merchants, dollar amounts, payment rails, category rows, transaction counts, and transaction-led stage names from this homepage animation.

## Scroll sequence
1. **Signal intake** — Internal Signals and External Intelligence appear together as the starting point.
2. **Unify context** — animated paths and restrained traveling dots converge into the intelligence core.
3. **Understand** — Behavioral, Life Event, Financial, Demographic, and Risk illuminate in sequence with concise examples and `1P` / `Ext` / `Both` provenance.
4. **Orchestrate** — outputs appear only to the right: Personalized Experiences, AI Coworker, and Growth Workflows, identified as customer-facing or bank-facing.

Scrolling upward reverses the sequence. Reduced-motion users receive the same states without continuous movement.

## Visual treatment
- Preserve the existing light blue homepage hue field.
- Use a deep navy core with a restrained blue aura, crisp borders, and compact family rows.
- Keep the five established family accents: blue, amber, emerald, violet, and rose.
- Use white glass source/output panels, 8px-or-less card radii, thin slate borders, and stable dimensions.
- Avoid teal developer-console styling, decorative orbs, dense dashboard chrome, or a dark full-page background.

## Responsive behavior
- Desktop retains the complete left-to-right flow and sticky scroll progression.
- Smaller screens stack sources, core, and outputs in reading order without clipped text or overlapping paths.
- The primary headline and actions remain visible and legible throughout the opening view.

## Technical changes
- Refactor `src/components/ScrollDrivenHero.tsx` around source, family, and destination data rather than transaction enrichment and personas.
- Add scoped semantic hero tokens and motion styles to the existing global animation stylesheet.
- Continue using the existing design-system Button and existing homepage background treatment.
- Validate typecheck/build and visually inspect the opening, core, and orchestration scroll states at desktop size.
