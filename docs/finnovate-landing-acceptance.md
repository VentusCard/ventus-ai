# Finnovate landing page — acceptance evidence (Direction C, fifth pass)

Branch: `feat/finnovate-landing` (Direction C integrates `-c-w1`, `-c-w2`, `-c-w4` on top of the Direction A engineering).
Spec of record: `docs/finnovate-landing-goal-c.md` §8 as amended by §9 and §10 (the founders' three reviews on 2 Sep). Verified 2 Sep 2026 against a production build served by `vite preview`, headless Chromium via Playwright with the real Newsreader and Manrope faces installed (35 automated checks, all passing), and a visual review of the rendered chapters at 1470 × 956, 1280 × 832 and 375.

## Fifth pass (scroll behaviour, 2 Sep)

- **Pinned Intelligence.** On wide, tall viewports with motion allowed, the whole composition (head + plane + step row) pins as one block for 120vh of scroll; scroll thirds are the stages; the active step's progress line scrubs with the scroll; a click scrolls to the stage. Measured: block 730 px, pin top 88→96 px, dwell 1.20 × vh at 1280 × 900; states understand/decide/activate at 15 / 50 / 85 % of the dwell, block top constant; click on step 03 lands on Activate. **Pass.**
- **Cycle mode** at 1280 × 720 (too short to pin): no sticky element, the plane advances on its own. **Pass.** **Static** under reduced motion: zero sticky, zero animations. **Pass.**
- **Hero drift.** The record drifts −8 % and the glow +5 % of the first 640 px of scroll; zero at rest and under reduced motion (the idle-transform check still passes). **Pass.**
- Page height at 1280 × 900: 4333 px (3339 + the dwell); threshold 4600. Harness 35/35 with the real faces; visual sequence checked at 1470 × 956 and 1280 × 832 (the composition fills the viewport in every state; no empty paper while pinned).

## Fourth pass (polish, 2 Sep)

- **Delivered surfaces.** After the network lights a destination, that surface keeps its action in the muted "already in the system" voice with a faded Filed stamp; verified mid-cycle at 1470: Digital banking *Card upgrade* and CRM *Service follow-up* delivered, Marketing *Onboarding journey* lit, Advisor *Wealth conversation* delivered. Reduced motion: no cycle, advisor only.
- **Heads and bars.** Split headlines at 22ch (Intelligence H2 in two lines); the plane head names the stage once; decision-bar title 11 px like the record and plane bars.
- **Keyboard.** Left/Right (and Up/Down) move between the Intelligence steps and move focus with them.
- **Fonts.** Preconnect links precede the one stylesheet request. Hero bottom padding halved. Harness 34/34, real faces.

## Third-review changes (tightening pass, 2 Sep)

- **Real-font verification.** Newsreader (variable, opsz) and Manrope installed in the sandbox from their npm builds, so the harness now measures the faces the site ships. *Personalization* = 6.05 em; H1 capped at `min(var(--h1), 14cqw)`; gap to the record ≥ 50 px at 900, 1024, 1100, 1200, 1280, 1366, 1440, 1470, 1512, 1680, 1920. The overlap the founders saw was the first build (8de4e0e) in the review folder, which had not been updated while the Mac was offline.
- **Rhythm.** `--section-pad` 64–88 px (the live site's cadence); hero 140 px top, 0.6 × pad bottom, copy top-aligned with the record; split heads top-aligned; head → instrument 32–48 px; closing band margin 40–56 px. Page height at 1280 × 832: **3339 px** (was 5133); at 375: 4987 px (was 5929).
- **Intelligence without a scroller.** The plane spans the shell; the three steps sit in a row beneath it with a progress line on the active step; the plane advances every 5 s while in view (`IntersectionObserver`, 25 %), a click selects a step and holds it 14 s; nothing is `position: sticky`. The plane shows four stations in every state (sources → relationship view → next action → workflow), the current one lit, the ones ahead as faint dashed outlines, rails accumulating left to right. Under reduced motion it does not advance; the steps work as plain tabs.
- **Activation decision bar.** The centred connector chip is a full-width navy bar — Governed decision · Action · Policy · Destination — with a 52 px rails band under it; the network panel is 356 px tall (was 450). On phones the bar wraps into a four-line strip.

## Second-review changes (founder review of the local build, 2 Sep)

- **Hero overlap removed.** The H1 is sized against its own column (`font-size: min(var(--h1), 14.5cqw)` on a `container-type: inline-size` column) and the hero grid is 6/6 at every width ≥ 900 px. Checked at 900, 1024, 1280, 1440 and 1920: *Personalization* stays inside its column at every width.
- **Stepper instead of three screens.** Intelligence is one pinned block — compact stepper left, morphing plane right — held for the scroller's extra distance; scroll progress maps to the three states in thirds; clicking a step jumps to its third. Dwell 105vh at 900 px. Static blocks below 900 px and under reduced motion.
- **Activation reaches every channel.** Split chapter head (H2 left, body right) so the network enters the first viewport; the network cycles Digital banking → CRM → Marketing → Rewards → Advisor every 3.6 s while in view, naming the action in the connector and inside the lit surface (*Card upgrade*, *Service follow-up*, *Onboarding journey*, *Travel offer*, *Wealth conversation*). Rests on Advisor under reduced motion.
- **Choreographed instruments.** Record: a 9 s CSS-timeline cycle (sources light, comets travel the rails, the node ripples, the decision reaches the workflow card, item and stamp appear, rows stamp in sequence). Plane: one composition whose chips and cards move between the three states over `--t-move`. Network: a comet along the lit route, the destination's own screen lighting on arrival. Every duration is a token; all collapse to zero under reduced motion.
- **Original Ventus wordmark** in header and footer (`ventus-logo-transparent.png`, inverted over the night header state).
- **Manrope replaces IBM Plex Sans/Mono** across every label, chip, stamp and row; Newsreader stays on the thesis lines. One font request: Newsreader + Manrope 400/500/600/700.
- **Audience wording.** "Financial institutions" where the page names its audience (eyebrow, SEO title); "your bank" / "the bank" where a sentence addresses the reader.
- **Glass and glow.** Backdrop blur on the header bar and the designated glass cards (record chips and workflow card, plane chips and cards, Governance control panel, five destination surfaces), each with a solid fallback under `@supports not (backdrop-filter)`. Ambient glows behind the record, the plane, the control panel and the lit destination. Mobile panel and modal stay solid.
- Also: the landing Suspense ground is white; the record's mobile row reads *Approved signal families* (no spelled-out count); the form confirmation no longer promises a reply time; the plane's raised row and the destination item wrap on narrow cards instead of clipping; the fifth destination spans the row on mobile.

## Build health

- `npx tsc --noEmit -p tsconfig.app.json` — clean.
- `vite build` — exit 0; only the pre-existing, unrelated warnings (chunk-size advisory, caniuse-lite age).
- `npm run lint` on `src/landing` and `src/App.tsx` — zero errors. The only hit is the pre-existing `react-refresh/only-export-components` warning on `request/context.tsx`, a pattern used in 42 other files in this repo.

## Structure

- Chapters in order: Hero, Intelligence, Governance, Activation, footer. **Pass.**
- Header: Ventus wordmark, exactly three hash anchors (`#intelligence`, `#governance`, `#activation`), one Request Access. No announcement bar. **Pass.**
- Request Access: four DOM nodes (desktop and compact header variants), three visible at any breakpoint — header, hero, closing band. **Pass.**
- `/bankdemo` and every other direct route unchanged (routing untouched in this pass). **Pass.**

## Type and colour

- One Google Fonts request on `/`: Newsreader (opsz/wght) + Manrope 400/500/600/700; no Plex family loads on the landing route. **Pass.**
- Serif renders only on: the H1, the three chapter H2s, the three stage titles, the closing line (eight elements, enumerated from computed styles). **Pass.**
- H1 70.4 px at 1280, 80.8 px at 1470 (real Newsreader), 44 px at 375; chapter H2s 56.3 px. **Pass.**
- Contrast: every visible text node sampled at rest against its composited background (translucent glass layers composited over the next opaque ground) is ≥ 4.5:1 (zero below). **Pass.**
- Palette is the live site's: white ground, gray-900/700/600 copy, blue-600 accent, blue tints, navy `#0A1628` instruments, slate-400 on navy, blue-400 signal, green for approved. No purple; the hero's blue radial is the one the live site uses. **Pass.**

## Surfaces

- `backdrop-filter` is present on 19 elements: the header bar and 18 designated glass cards (`landing-glass-dark` / `landing-glass-light`), nothing else. The mobile panel and the modal are solid (verified: mobile panel `backdrop-filter: none`, `rgb(249,250,251)`; modal zero blurred elements). **Pass.**
- One-pixel `#3B82F6` seams found on: the hero record, the Intelligence plane, the Governance chapter, the Activation connector, the closing band. **Pass.**
- Governance panel shows four stamps; row 03 is the hollow `Human review`. **Pass.**

## Scrolling and motion

- Native scrolling; the only sticky element besides the header is the pinned Intelligence block, and only in pinned mode (see the fifth pass). **Pass.**
- Reduced motion: zero sticky elements, zero elements with a running CSS animation, no record cycle, no plane cycle, no network cycling. **Pass.**
- Idle: computed transforms/opacity of every element outside the three instruments (and the plane's step row) identical across a 2.5 s sample after settle; the only idle motion is inside the record, the plane with its progress line, and the network. **Pass.**
- Page height ≤ 4600 px at 1280 × 900 (measured 4333, of which 1080 is the Intelligence dwell). **Pass.**
- Header material: white glass at the top (`rgba(255,255,255,.72)`, `.86` past 32 px), navy glass once the Governance chapter is behind the bar (`rgba(10,22,40,.72)`, inverted wordmark, signal CTA and underline). **Pass.**
- Active anchor: `Activation` stays active through the footer; returning to the hero clears it. **Pass.**

## Responsive

- 375 × 812: bar → eyebrow → H1 (44 px, clear of the bar) → body → CTA → compact three-row record; CTA within two screens. **Pass.**
- No horizontal overflow at 320, 375, 390, 768, 900, 1024, 1280, 1440. **Pass.**
- Mobile menu: solid paper sheet, three rows at 48 px, no blur. **Pass.**
- Mobile visual review (375, full page): static stages read in order with the plane's cards wrapping their text; Governance panel and stamps intact; network stacks the connector above five surfaces two-up with the last spanning the row; the lit item wraps rather than clips. **Pass.**

## Credibility and accessibility

- Exactly two `<img>` elements on the landing route, both the Ventus wordmark (`alt="Ventus AI"`); no vendor marks, photographs, percentages, dollar figures or counts in the page body (the footer's © year is the only digit sequence). The record shows no name, merchant, amount, date or version. **Pass.**
- Avoid-list search (revolutionary, transformative, seamless, hyper-personalized, unlock, empower, leverage, real-time, guaranteed, before customers ask, future of banking) returns nothing. **Pass.**
- Modal: opens from every CTA, no blur, focus trapped across 14 Tab presses, Escape closes, focus returns to the opening button. **Pass.**
- Request Access still posts through `submit.ts` to `access_requests` (unchanged). The migration has not been applied from this environment (no credentials). **Unchanged.**
- Title and description carry the positioning (*Ventus AI — Governed Decision Intelligence for Financial Institutions*). **Pass.**
- Live region: the network's cycling state is announced through a polite `sr-only` summary; the record carries an `sr-only` description of its illustrative cycle. **Pass.**

## Visual review (main agent)

Rendered at 1920 × 1000 and 1280 × 900 (chapter captures) and 375 (full page). Hero: four elements beside the record instrument (status bar with the four-stage status, dot-grid stage with glass source chips, comet rails converging on the ringed node, glass workflow card, four stamped rows), no overlap at any width. Intelligence: split head; pinned block with the compact stepper (01 Understand active, 02/03 waiting) beside the plane in its Understand composition; the plane morphs to Decide and Activate as the block is scrolled. Governance: the single navy chapter with the glass Decision Control panel over a brand glow and the hollow Human review stamp. Activation: split head with the network in the first viewport; connector → trunk and bus → five destination surfaces; the lit surface, glow, comet and connector value advance together (Advisor → Digital banking *Card upgrade* observed); navy closing band with the blue-400 CTA; white footer with the wordmark.

## Model and tool record (for the PR)

Main agent (W0′, integration, W6′, all three review passes): Claude Fable 5.1. Subagents W1′, W2′, W4′ (first build): Claude Sonnet 5 via the Agent tool. Harness: Playwright + headless Chromium in the build sandbox.

## Known risks

- Backdrop blur on 18 cards is a GPU cost on low-end devices; each card is small and the fallback is solid, but the founders' local review on a MacBook is the sign-off for smoothness.
- The Intelligence plane advances on a 5 s timer while in view; a reader who wants to study one state clicks its step (held 14 s, then the cycle resumes). If the founders prefer a manual-only stepper, `STAGE_MS` is the one constant to change.
- `access_requests` migration still needs `supabase db push` and `supabase gen types` from an environment with credentials before the form is live.
- `src/pages/Privacy.tsx` remains a labelled placeholder pending legal review.
