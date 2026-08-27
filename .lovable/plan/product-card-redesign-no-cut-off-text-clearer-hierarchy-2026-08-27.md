# Product card redesign: no cut-off text, clearer hierarchy

The compact product cards in the phone mockup currently rely on hard clamps to fit: the product name is clamped to 2 lines, the quote to 4 lines, and the CTA label is chopped at 22 characters. When copy runs long, all three visibly truncate — and the CTA is the worst offender because a trimmed verb phrase reads as broken.

## What changes

**Fit by sizing, not by cutting.**

- The card gets a fixed content budget and the copy is sized to fit it, rather than clipped. Long product names step down one type size instead of clamping to an ellipsis; the quote stays a single complete sentence (already capped at 90 characters by the generation rule) and gets enough room to render in full.
- The CTA button never truncates. The label sits on one line with the chevron pinned to the right; if a generated CTA is unusually long, the button's own text size steps down a notch so the full phrase still shows. The 22-character hard trim is removed.

**Clearer hierarchy** — currently the product name, quote, benefits, and value line all read at similar weight and size.

```text
[icon]  PRODUCT NAME              <- largest, bold, primary anchor
        one-sentence rationale     <- secondary, muted, italic off
        ---------------------------
        - benefit                  <- three tight rows, accent checks
        - benefit
        - benefit
        Est. $450-$680/yr          <- accent-colored value, right-weighted
        [ Personalized CTA      > ] <- full-width solid accent button
```

- Product name becomes the clear top anchor (larger, tighter leading).
- The rationale sentence drops the italic and sits at a calmer muted tone so it supports rather than competes.
- A hairline divider separates the "why" (name + rationale) from the "what you get" (benefits + value), which is the main hierarchy fix.
- The estimated-value line gains slightly more emphasis since it is the strongest conversion signal, and sits directly above the CTA.

Colors keep the existing per-theme accent and gradient system; the strict light theme is unchanged.

## Technical notes

All changes are in `src/components/exec-demo/ProductCardsPhoneView.tsx`:

- Remove `line-clamp-2` on `product_name`; replace with a length-based size step (`text-[14px]` default, `text-[13px]` when the name exceeds ~28 chars).
- Remove `line-clamp-4` on the quote; keep `fitQuote` at 90 chars so it is already guaranteed to fit ~3 lines.
- Replace `fitCta`'s truncation with a size-step: return the full label, and pick `text-[12px]` / `text-[11px]` based on length. Keep the theme fallback map.
- Button becomes `flex items-center justify-center gap-1.5` with `whitespace-nowrap` on the label and `shrink-0` on the chevron, so the chevron never pushes text out.
- Add a `border-t border-black/5` divider above the benefits block and give the value line `text-[13px] font-bold`.
- Verify at 1440px and 1920px with Playwright that no card scrolls inside the mockup and no label is clipped.
