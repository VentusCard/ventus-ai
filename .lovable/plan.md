

## Make Stage 2 arrive earlier; split Stage 3 evenly across 3 personas

The hero's scroll-driven animation currently spends a lot of scroll runway in Stage 1 (raw transactions, 0–20%) and Stage 2 (profile build, 20–40%) before it ever gets to the persona walkthrough in Stage 3 (40–100%). You want Stage 2 to land earlier so the persona reveals get more breathing room — and you want each of the 3 personas in Stage 3 to take an equal share of the remaining scroll.

### New scroll allocation

| Stage | Old window | New window | Share |
|-------|-----------|-----------|-------|
| Stage 1 (raw feed) | 0% – 20% | **0% – 10%** | 10% |
| Stage 2 (profile built) | 20% – 40% | **10% – 20%** | 10% |
| Stage 3 — Persona 1 (Travel) | 40% – 60% | **20% – ~46.7%** | ~26.7% |
| Stage 3 — Persona 2 (Parent) | 60% – 80% | **~46.7% – ~73.3%** | ~26.7% |
| Stage 3 — Persona 3 (College) | 80% – 100% | **~73.3% – 100%** | ~26.7% |

Net effect: viewers see the enriched profile + persona pills almost immediately, then spend 80% of the scroll on the persona walkthrough — with each persona getting equal stage time.

### File touched

- `src/components/ScrollDrivenHero.tsx` — stage math at lines 225–232 only:
  - `stage = scrollProgress < 0.1 ? 1 : scrollProgress < 0.2 ? 2 : 3`
  - `stage2Progress = (scrollProgress - 0.1) / 0.1`
  - `personaProgress = (scrollProgress - 0.2) / 0.8`
  - `activePersonaIndex = personaProgress < 1/3 ? 0 : personaProgress < 2/3 ? 1 : 2`

No other edits needed — the rest of the component reads off `stage`, `stage2Progress`, and `activePersonaIndex`, so the new pacing flows through automatically (pills, callouts, sub-bubbles, row dimming, etc.).

