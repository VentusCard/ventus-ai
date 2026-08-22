# Color-scale the "% strong" pills

Make each signal tile's confidence pill take intensity from its own value, in the family's color — the same ramp logic as the strong/likely/emerging bar underneath it.

## Behavior

Four intensity steps based on the strong share:

```text
>= 70%   deepest  — solid family color, white text
55-69%   deep     — mid family tint, dark family text
40-54%   medium   — light family tint, family text
< 40%    faint    — very light tint, muted text
```

So a "82% strong" pill on Life Events reads as a solid violet chip, while a "31% strong" pill is a barely-tinted violet outline. Comparing pills across a family becomes a visual scan instead of reading numbers.

## Technical notes

- Add a `familyColor` field (`sky` | `violet` | `amber` | `emerald` | `rose`) to `SIGNAL_FAMILY_META` in `src/lib/customerDirectoryData.ts`, carried through `SignalFamilyStats` in `src/lib/intelligenceSignalStats.ts`. Needed because Tailwind classes must be static strings, so we look them up from a per-family map rather than build them dynamically.
- In `src/components/tepilot/insights/dashboard/SignalFamilyPanel.tsx`, add a static `STRONG_PILL` map keyed by family color and intensity step, and a small `pillStep(strongPct)` helper. Replace the current fixed slate pill classes with the looked-up ones; keep the existing hover title with the full split.
