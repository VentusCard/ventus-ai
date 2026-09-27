# Beat 6.5 collection view — restore deal count, roomier cards

## What to change

In `src/components/exec-demo/GeneratedOffersPhoneView.tsx`, presentation-mode branch of the collection detail view only (the /demo spacious layout stays untouched):

1. **Restore the deal count.** The "N offers available" subline under the collection message is currently hidden in presentation mode (`!presentationMode` condition on that `<p>`). Show it again in both modes — keep it small (9.5–10px, slate-500) so it reads as a subline.

2. **Taller, less cramped deal cards.** The five offer cards are currently very tight (`py-1.5`, 9–11.5px text, `space-y-1.5`). Give each card more air:
   - Card padding: `py-1.5` → `py-2` (keep `px-2`)
   - Row spacing between cards: `space-y-1.5` → `space-y-2`
   - Merchant: 11.5px → 12px, product: 10px → 10.5px, description: 9.5px → 10px with `leading-snug` (two full lines, no truncation)
   - Reward pill and CTA button: 9/9.5px → 10/10.5px, matching the /demo look scaled down

## Constraint

All five offers must still fit inside the phone without scrolling at 1540×855 and 1920×1080 — the taller cards consume roughly the same vertical space that freeing the message-block area provides. Verify with Playwright on beat 6.5 (holiday travel collection) and take screenshots as the tiebreaker.

No new elements, no copy changes, /demo unchanged.
