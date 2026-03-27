## Plan: Add phase 3 to Beat 4 — hide MCCs and update header

Currently Beat 4 has 3 phases (0, 1, 2):

- Phase 0: Show transaction rows with MCC badges only
- Phase 1: Reveal merchant names
- Phase 2: Show "Behavioral Pattern: Expecting a Baby" pill

We add a **phase 3** that:

1. Hides the MCC badge on each row (fade out / collapse)
2. Update each transcation description to blue color
3. Updates the header from "Purchase Patterns Are Hidden by Blind MCCs" to "Semantic Enrichment Reveals Patterns without MCCs"

### Changes in `src/components/demo/DemoPasswordGate.tsx`

1. **Extend `beat4Phase` max from 2 to 3** in the `goForward` callback — change `if (beat4Phase < 2)` to `if (beat4Phase < 3)`, so clicking forward at phase 2 goes to phase 3 instead of advancing to beat 5.
2. **Header text** — conditionally render based on `beat4Phase >= 3`:
  - `< 3`: "Purchase Patterns Are Hidden by Blind MCCs"
  - `>= 3`: "Semantic Enrichment Reveals Patterns without MCCs"
  - Add a transition on the text swap.
3. **MCC badge visibility** — on each transaction row's MCC `<span>`, add transition styles that hide it when `beat4Phase >= 3`:
  - `opacity: beat4Phase >= 3 ? 0 : 1`
  - `width: beat4Phase >= 3 ? 0 : "auto"`
  - `overflow: "hidden"`, `transition` for smooth collapse.
4. **goBack handler** — already handles `beat4Phase > 0`, so going back from phase 3 will work automatically.

### Files modified

- `src/components/demo/DemoPasswordGate.tsx`