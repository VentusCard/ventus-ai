

## Add Beat 6: "Ventus is next-gen banking infra" before entering the network diagram

Currently there are 6 beats (0–5), with Beat 5 being the last before "Enter Demo". We'll add a new Beat 6 after Beat 5 that serves as a capstone statement about Ventus being next-gen banking experience infrastructure built on deep customer intelligence. The "Enter Demo" button moves to this new beat.

### File: `src/components/demo/DemoPasswordGate.tsx`

1. **Increase `TOTAL_BEATS` from 6 to 7**

2. **Add a new summary** to `BEAT_SUMMARIES` array:
   - `"Ventus: next-gen banking experience infra built on deep customer intelligence."`

3. **Update Beat 5 advance logic** — Currently Beat 5 blocks advancement after `beat5Phase >= 4`. Change this so it allows advancing to Beat 6 (the new final beat) instead of stopping.

4. **Move "Enter Demo" button** from Beat 5 (`beat5Phase >= 4`) to the new Beat 6 content.

5. **Add Beat 6 content** (`displayStep === 6`) — a card-style beat with:
   - Beat number header ("04") matching the card pattern
   - Large headline: **"Ventus is the next-gen banking experience infra built on top of deep customer intelligence."**
   - Styled consistently with other card beats (same font sizes, colors)
   - The "Enter Demo →" button at the bottom

6. **Update keyboard/click handlers** — Adjust the condition that checks for the final beat from `step === 5 && beat5Phase >= 4` to `step === 6` for the Enter Demo trigger.

7. **Update stacked card rendering** — The `if (i < 3) return null` filter stays the same; the new beat 6 card will naturally stack.

### Summary
- One new beat inserted as the final step before entering the demo
- Clean, impactful statement positioning Ventus as infrastructure
- "Enter Demo" button moves to this new beat
- All navigation (arrows, dots, keyboard) updated for 7 beats

