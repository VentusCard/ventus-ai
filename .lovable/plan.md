# Greyed-out preview state for the 3 personalization tabs

Today, before a customer is picked, all three columns on Personalized Rewards / Product / Relationship show dashed empty boxes with one line of text. Replace that with a dimmed preview of the real layout so the page never looks blank.

## What changes

**1. Key features card**
Show the real feature list for the active surface immediately, rendered in a muted state (greyed text, no blue check accent, slightly reduced opacity, no hover). When a customer is selected, the same rows animate into their normal colored state with the existing staggered reveal — no layout shift.

**2. Unit economics card**
Show the full card structure (three surface rows, total row, assumptions toggle) with dashes/blurred placeholder numbers instead of the dashed empty box. Muted styling, controls disabled. On selection, real numbers fade in.

**3. Phone mockup**
Show the phone frame in place, dimmed with a soft blur and a small centered "Select a customer" label over it, instead of the dashed rectangle. Keeps the exact size and position of the live mockup so nothing jumps when a customer loads.

**4. Customer selection card**
Before a selection, list the five signal family headers (colored dot + family name, same as after selection) with two greyed skeleton pills under each, so the panel reads as "these are the signal families we detect". Header area keeps the search bar as-is.

## Technical notes

- Add a shared `preview` / `muted` mode rather than a second layout: `SurfaceFeaturePanel`, `UnitEconomicsCard`, and the phone column in `CustomerMockupPanel` each render their normal markup wrapped in a container that applies `opacity-60 grayscale pointer-events-none` (light-theme safe) when no customer is selected.
- `UnitEconomicsCard` preview rows use `—` for values and keep the assumptions section collapsed and disabled.
- `CustomerSignalPanel` gains a skeleton branch driven by `SIGNAL_FAMILY_META` (dot + label + two placeholder pills), used by `CustomerMockupPanel` in place of the current dashed empty state.
- Strict light theme, no `dark:` utilities; existing 120ms staggered reveal on selection is preserved.

Files: `src/components/tepilot/insights/CustomerMockupPanel.tsx`, `personalization/SurfaceFeaturePanel.tsx`, `personalization/UnitEconomicsCard.tsx`, `personalization/CustomerSignalPanel.tsx`.
