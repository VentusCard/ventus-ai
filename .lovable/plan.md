

## Plan: Increase Text Size in Personalization Cards

The three personalization cards (Rewards, Relationship, UX) each contain a 4-column grid of items. The label text inside those items currently uses `text-[10px]`. This will be increased to `text-xs` (12px) for better readability.

### File: `src/components/demo/DemoPasswordGate.tsx`

**Lines 515, 531, 547** — Change `text-[10px]` to `text-xs` on the `<span>` inside each grid item across all three cards.

