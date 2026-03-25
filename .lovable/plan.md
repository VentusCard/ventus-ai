

## Plan: Update Folded Card Summaries to Match Current Content

**File: `src/components/demo/DemoPasswordGate.tsx`, lines 9-16**

Update the `BEAT_SUMMARIES` array so each entry is a short takeaway of its beat's actual content:

| Beat | Current Summary | Actual Content | New Takeaway |
|------|----------------|----------------|-------------|
| 0 | "Ventus AI — AI Customer Intelligence Layer..." | Logo + title intro | "AI-powered banking personalization engine." |
| 1 | "Billions in personalization spend — zero customer understanding." | "Billions spent...doesn't truly work" | "Personalized banking doesn't truly work." |
| 2 | "Built on MCC — a 1974 taxonomy for routing, not intelligence." | "The answer is three letters: MCC" | "The root cause is three letters: MCC." |
| 3 | "MCCs are blind — one code that could mean symphony, Celtics, or Monster Jam." | MCC 7922 fans to 6 possibilities | "One MCC code. Six possible meanings. Zero clarity." |
| 4 | "MCCs can't see patterns — three ski purchases, three generic codes." | Baby pattern from pharmacy/maternity/OB-GYN purchases | "Hidden purchase patterns reveal a baby on the way." |
| 5 | "One signal activates personalized rewards, relationship management, and analytics." | Signal + demographics = rewards, relationship, UX | "Signal + demographics activates full personalization." |
| 6 | "Disconnected data — no demographics, no actionable intelligence." | "Currently Landscape" → "Ventus Innovates the Entire Stack" | "From generic banking to full-stack personalization." |

### Change

Replace lines 9-16 with:

```tsx
const BEAT_SUMMARIES = [
  "AI-powered banking personalization engine.",
  "Personalized banking doesn't truly work.",
  "The root cause is three letters: MCC.",
  "One MCC code. Six possible meanings. Zero clarity.",
  "Hidden purchase patterns reveal a baby on the way.",
  "Signal + demographics activates full personalization.",
  "From generic banking to full-stack personalization.",
];
```

