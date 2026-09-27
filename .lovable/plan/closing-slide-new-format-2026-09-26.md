# Closing slide — new format

Rework the final deck slide (section 10, "The Ask") to a new four-beat format, keeping the intro-style full-width stage and one-beat-at-a-time reveal.

## New beat structure

1. **Beat 1** — "Today too many banking experiences are generic and replaceable." (large black line)
2. **Beat 2** — "With Ventus AI your bank can" followed by a vertical ticker that continuously cycles benefit phrases: "grow deposits", "cross-sell more products", "increase card spend", "deepen engagement", "lift NPS". The ticker swaps one phrase at a time with a smooth roll-up animation, aligned inline with the sentence.
3. **Beat 3** — "Because your bank can anticipate and capture customer needs and deliver a differentiated banking experience." (blue emphasis line, matching the current blue closing line styling)
4. **Beat 4** — after a clear gap, the signature block: "Marco Ma — CEO & Cofounder" and "marco@ventusai.com".

## Removed

- The "Today vs with Ventus" comparison reprise
- The outcome pills (More card spend / More products / More deposits)
- The "Schedule a conversation" button and exhibit-hall line

## Technical details

- `src/lib/deckmoScript.ts` — replace `DECKMO.close` copy: new `lines`, new `ticker` array of benefit phrases, new `signature` fields; drop `outcomes`, `cta`, `href`, `exhibit`.
- `src/components/deckmo/DeckmoDeck.tsx` (`Close` component) — render the ticker as an inline animated word swapper (CSS keyframe roll, pauses ~2s per phrase, respects the deck's existing motion override); keep the same Reveal rise animation and clamp typography per beat; short-viewport (`max-height:900px`) tightening stays so nothing clips the footer.
- Beat count stays 4; navigation, counter, and arrow-key behavior unchanged.
- Verify at 1376×1011, 1540×855, 1691×1011: ticker animates, no overlap, signature clears the footer; tsgo + build log clean.
