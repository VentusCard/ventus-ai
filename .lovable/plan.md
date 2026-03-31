

## Plan: Add descriptions to consumer overlay sidebar cards

### What changes
In `src/components/demo/DemoDetailOverlay.tsx`, update the `FeatureCardSidebar` component to show a one-sentence description beneath each card label.

### Description map
A `CARD_DESCRIPTIONS` record keyed by node `id`:

| Card ID | Description |
|---|---|
| *(Core Analytics — hardcoded)* | Transforms raw transactions into rich lifestyle dimensions, enabling every experience below to feel personally crafted. |
| `analytics` | Organizes spending into lifestyle categories like Dining, Fitness, and Travel — so the app feels like it truly knows the customer. |
| `outflow` | Surfaces forgotten subscriptions and spending leaks, positioning your bank as a proactive financial guardian. |
| `aiFinancialInsights` | Delivers timely, personalized money tips and alerts that make customers feel coached — not just served. |
| `travel` | Anticipates what a customer needs next and delivers the right offer before they even search for it. |
| `locational` | Identifies travel and surfaces local perks and experiences, positioning your bank as a travel and life companion. |
| `dealPersonalization` | Matches offers to individual habits so every reward feels hand-picked — driving higher engagement and redemption. |
| `lifeEventIntel` | Recognizes major life moments — a new home, a baby, retirement — so your bank can show up when it matters most. |
| `lifeEvents` | Recommends the right financial product at the right life stage, turning routine banking into proactive guidance. |
| `wmCopilot` | Arms relationship managers with AI-prepared context so every client conversation feels informed and personal. |

### Implementation
1. Add a `CARD_DESCRIPTIONS: Record<string, string>` constant with the above entries.
2. In the **Core Analytics** card, add a `<p>` subtitle below the label span with the core analytics description, styled `text-[9px] text-slate-400 leading-tight mt-0.5`.
3. In the **bankNodes `.map()`** loop, add the same subtitle `<p>` using `CARD_DESCRIPTIONS[node.id]`.
4. Wrap both label + description in a `<div className="flex flex-col">` so they stack vertically while the icon stays left-aligned.

### Files modified
- `src/components/demo/DemoDetailOverlay.tsx` — sidebar card rendering only

