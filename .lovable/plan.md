

## Smoother, more even persona reveal as you scroll

Right now the 3 personas reveal/highlight in jumpy thirds of Stage 3 (40–53%, 53–66%, 66–100%) — the third one gets twice as much scroll runway as the first two, so the pacing feels uneven and the last persona drags. We'll redistribute Stage 3's scroll range into 4 equal beats so each persona gets the same amount of scroll-time, plus a final "all-three-visible" beat at the end to let the viewer absorb the full profile.

### New scroll choreography

Stage 3 spans scroll progress 0.4 → 1.0 (60% of the page). Split into 4 equal beats of 15% each:

| Scroll range | Active persona | Pills visible |
|---|---|---|
| 0.40 – 0.55 | Leisure Traveler | 1 |
| 0.55 – 0.70 | Young Parent | 2 |
| 0.70 – 0.85 | College-Bound Child | 3 |
| 0.85 – 1.00 | College-Bound Child (held) | 3 |

This gives the eye equal time on each persona and a calm closing beat where the full picture sits assembled before the user scrolls past.

### File touched

- `src/components/ScrollDrivenHero.tsx` — only the Stage 3 progress math (~lines 229–232):
  - Replace `personaProgress < 0.33 ? 0 : personaProgress < 0.66 ? 1 : 2` with even quartile thresholds (`< 0.25`, `< 0.5`, `< 0.75`, else 2)
  - Pill reveal logic (`activePersonaIndex >= i`) already keys off this index, so it picks up the smoother pacing automatically — no other edits needed.

No new files, no animation tweaks, no layout changes.

