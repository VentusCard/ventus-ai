
## Goal
1. Convert the **Offers** tab phone view back to a one-product-at-a-time slider (with dots/swipe).
2. Merge that slider into the **Membership** tab, replacing the **Financial Wellness** card.
3. Delete the **Smart Financial Tip** pinned card from the Membership tab.

## Plan

### 1. `src/components/exec-demo/ProductCardsPhoneView.tsx` — single-card slider
Refactor from side-by-side 2-card layout to a one-card-at-a-time horizontal slider:
- Render ALL cards (not just first 2), one visible at a time.
- Use a swipeable horizontal track with `transform: translateX(-index * 100%)`.
- Add tappable dot pagination below + left/right chevron buttons.
- Auto-advance every 6 seconds (pause on user interaction); cards loop.
- Keep the existing single-card visual (theme color border-top, quote, benefits, value, CTA) but let it use the full available width so it reads better at one-up size.
- Add an optional `compact` prop so the slider can render in either context (full Offers tab vs. embedded inside the Membership card area). Compact mode trims vertical padding only — same card design.

### 2. `src/components/exec-demo/RelationshipPhoneView.tsx` — merge slider in, drop tips
- Import `ProductCardsPhoneView` and accept a new prop `productCards?: ProductCard[] | null`.
- **Replace** the entire "Financial Wellness" card block (lines ~115–151) with a section titled "Recommended for You" that renders `<ProductCardsPhoneView cards={productCards} compact />` when cards are present. Show a small `text-slate-300` placeholder ("Personalized offers loading…") otherwise.
- **Delete** the entire pinned "Smart Financial Tip" footer block (lines ~188–225) and its supporting state (`tipDismissed`, `tip`, `generateFinancialTip` import, `MessageSquare`/`Lightbulb`/`CheckCircle2` icons if no longer used).
- Remove now-unused imports (`generateFinancialTip`, `useState` if no other state uses it).

### 3. `src/components/exec-demo/ExecDemoPhoneView.tsx` — wire it up
- Pass `productCards={productCards}` into `<RelationshipPhoneView … />` (line 94).
- The Offers tab already renders `<ProductCardsPhoneView cards={productCards} … />` — leave it; it will now display as a single-card slider automatically.

## Verification
- /demo → wait for product cards → **Offers** tab shows ONE card at a time with dots + arrows; auto-advances; manual nav works.
- **Membership** tab: Financial Wellness card is gone, replaced by the same product-card slider in compact form. Smart Financial Tip footer is gone.
- Other tabs (Rewards, AI) unchanged.

## Out of scope
- Edge functions, generated card content, AI chat, other tabs.
