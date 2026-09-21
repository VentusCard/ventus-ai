# Opener label: "with" + Ventus AI logo

On the deck opener slide, the second comparison label currently reads "With Ventus" (deckmoScript.ts `opener.comparison.ventus.label`). Change it to the word "with" followed by the Ventus AI logo image (the same mark used in the website header), inline and aligned to the label baseline.

## Changes

1. **`src/components/deckmo/DeckmoDeck.tsx` — Opener component**
   - In the label row (the `<p>` at ~line 110), when the row is the Ventus row (`blue`), render `with` text plus an inline `<img src="/ventus-ai-logo.png" alt="Ventus AI">` instead of the plain label text. The "Today" row keeps its plain label.
   - Logo sized to sit naturally in the label line (roughly label-cap height, ~14–18px tall, `h-auto w-auto object-contain`), vertically aligned with the text via flex items-center so it reads as "with [logo]".
   - Keep the existing reveal behavior (step >= 4, blue color for the text) unchanged.

2. **`src/lib/deckmoScript.ts`**
   - Change `opener.comparison.ventus.label` from `"With Ventus"` to `"with"` (the logo comes from the renderer, not the data string).

3. Leave line 539 ("With Ventus, the experience evolves with every customer.") untouched — it's a different slide.

## Verification

- Playwright at 1540×855: open /deckmo (sessionStorage `demo_password_access='true'`), advance to beat 4.1, confirm the label shows "with" followed by the logo, baseline-aligned, with the rest of the Ventus equation intact; check 1920×1080.
- Confirm build log clean.
