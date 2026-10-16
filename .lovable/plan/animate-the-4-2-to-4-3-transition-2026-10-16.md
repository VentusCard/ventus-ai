## Animate the 4.2 to 4.3 transition

When moving from 4.2 (all pills) to 4.3 (signal detail), and back:

1. **Description line** — the subtitle cross-fades: the 4.2 line fades out and the 4.3 line ("Every signal is a cross-category...") fades in with a slight upward slide (~300ms). The title and eyebrow stay still.
2. **Detail and table** — the "Back to all signals" button and the detail panel fade in and slide up (~400ms), and the supporting-transactions table follows with a short delay (~150ms) so it lands just after the key details.
3. Going back from 4.3 to 4.2 uses the same subtitle fade, and the pill rows fade back in.
4. Opening a different pill re-plays the detail/table animation.

## Technical details
- In `RickyStoryScene` (DeckmoDeck.tsx), key the subtitle wrapper by step (`key={step===2?"detail":"pills"}`) with `animate-fade-in` so it re-mounts and animates on each change; 4.1 keeps its hidden-but-reserved subtitle with no animation.
- Wrap the 4.3 body in a container keyed by `signalDetail.label` with `animate-fade-in`; in `RickySignalDetail`, add `animate-fade-in` plus an `animation-delay` of 150ms (`fill-mode: both`) on the table section.
- Respect `motion-reduce:animate-none`. No layout changes, so table widths and the existing tests stay valid; verify in the browser at 1546x903.
