# Add Value/Benefits Block to Beats 5–8

## Goal

Below the left-side text block (eyebrow, title, subtitle) on beats 5, 6, 7, and 8, add a compact "value for the bank" stat block:

- Beat 5 (Immediate): **-9% Customer Service inquiries**
- Beat 6 (Mid-term: Profit): **8% yield for the bank**
- Beat 7 (Mid-term: Growth): **6.5% LTV boost**
- Beat 8 (Long-term: Retention & NPS): **6%+ In-app engagement and NPS score**

## Content

Add an optional `value: { metric, label }` entry to `DECKMO.immediate`, `DECKMO.midTerm`, `DECKMO.longTerm`, and `DECKMO.retention` in `src/lib/deckmoScript.ts`:

- `immediate.value` → metric `-9%`, label `Customer Service inquiries`
- `midTerm.value` → metric `8%`, label `yield for the bank`
- `longTerm.value` → metric `5.5%`, label `LTV boost`
- `retention.value` → metric `4.5%+`, label `In-app engagement and NPS score` (typo "enagegement" corrected)

## Rendering

- Extend `SceneHeader` in `src/components/deckmo/DeckmoBankdemoScenes.tsx` with an optional `value` prop rendering below the subtitle: a left-blue-accented, light-blue panel matching the existing "Product" block style on the activation scene — small uppercase blue label "VALUE FOR THE BANK", the metric large and bold in the deck navy, and the label beneath it in slate. Beats 5, 6, 7, and 8.3 pass the value through automatically since they all use `SceneHeader`.
- Beat 8.4 (`RetentionShowcase`) renders its own header row (eyebrow/title left, subtitle right). Add the same value block in a compact form directly under the beat 8.4 title so the stat is visible on both halves of beat 8.
- Blocks are static deck content only; no changes to phones, callouts, navigation, /demo, or any other beats.

## Verification

- Playwright at 1540×855 and 1920×1080: navigate to each of beats 5–8 and confirm the block renders below the left text, is fully visible without clipping or overlapping the phone/callout column, and the beat 8 block appears on both 8.3 and 8.4.
- Confirm clean build in `/tmp/observability/build-errors.log`.