
## Make persona pills truly sequential instead of all visible at once

Right now the pill reveal is still tied to `stage2Progress > i * 0.3`, which means all three can become visible during Stage 2 before the Stage 3 walkthrough begins. That is why they still appear together. The fix is to move visibility control fully onto the Stage 3 active-persona progression.

### What to change

- Update the persona pill visibility logic in `src/components/ScrollDrivenHero.tsx`
- Replace the current Stage 2-based reveal gate:
  - `opacity: stage2Progress > i * 0.3 ? 1 : 0`
  - `transform: stage2Progress > i * 0.3 ? "translateY(0)" : "translateY(8px)"`
  - `transitionDelay: \`${i * 200}ms\``
- With Stage 3 sequential reveal logic:
  - `const isRevealed = stage === 3 && activePersonaIndex >= i`
  - Use `isRevealed` for opacity/transform
  - Remove the fixed stagger delay so reveal timing comes only from scroll progress

### Resulting behavior

- **Stage 1:** No pills visible
- **Stage 2:** Still no pills visible
- **Stage 3 / beat 1:** Only Leisure Traveler appears
- **Stage 3 / beat 2:** Young Parent appears, Leisure Traveler remains visible
- **Stage 3 / beat 3+:** College-Bound Child appears, all three remain visible
- The active border/count styling keeps rotating as it already does now

### File touched

- `src/components/ScrollDrivenHero.tsx`
  - Only the persona pill `.map()` block in the card header area

### Technical detail

The pacing math for `activePersonaIndex` is already set up to advance evenly through Stage 3. The only issue is that the pill rendering still listens to `stage2Progress`, so the reveal logic and the walkthrough logic are currently disconnected. This change reconnects them so the UI matches the intended scroll narrative.
