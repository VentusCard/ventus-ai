# Beat 8.4: Continuous Smooth Rolling Carousel

## Goal
Replace the current "swap 3 phones every 6 seconds" carousel with one continuous, smooth, right-to-left rolling marquee of all seven AI-chatbot phones.

## Changes

### `src/components/deckmo/DeckmoBankdemoScenes.tsx` — `RetentionShowcase`
- Replace the `carouselIndex` interval and 3-item `visibleItems` slicing with a single horizontal track containing the seven phones (Hawaii "AI assistant" plus the six showcase phones) **rendered twice back-to-back** for a seamless loop.
- Track layout: `flex` row with fixed phone width (`aspect-[11/20]`, current height clamp `clamp(470px,66vh,650px)` kept), gap matching the current `clamp(18px,2.5vw,44px)`.
- Apply a CSS animation on the track: `translateX(0) → translateX(-50%)` over ~45–60s, `linear infinite` — because the content is duplicated, -50% lands exactly on the loop point with no visible jump.
- Pause the roll when the user interacts with any chatbot: set `animation-play-state: paused` on the track while focus is inside (existing `onFocusCapture`/`onBlurCapture` interaction detection is reused) and also on hover, so the user can read/type without the phone sliding away. Resume on blur/mouse-leave.
- Duplicated phone instances share the same `chatPersistKey` per phone id, so each conversation's seeded messages and typed state stay consistent between the two copies. Remove the now-unused `deckmo-carousel-group` key/animation class.

### `src/styles/animations.css`
- Add `@keyframes deckmo-carousel-roll { to { transform: translateX(-50%); } }` and a `.deckmo-carousel-track` rule (`animation: deckmo-carousel-roll 50s linear infinite; will-change: transform;`), gated under `prefers-reduced-motion: no-preference`.
- Under `prefers-reduced-motion: reduce`: no animation — static track showing the first phones.
- Remove the obsolete `.deckmo-carousel-group-enter` keyframes/rule.

## Kept unchanged
- Phone size, 11:20 proportions, enlarged bold labels, heading/subtitle, slide position.
- All seven conversations, customer-/AI-initiated message order, Hawaii cached answer and per-phone chat persistence.
- Arrow-key-only slide navigation; the carousel animation never triggers slide navigation. `/demo` untouched.

## Validation
- Playwright at 1540×855 and 1920×1080: phones roll continuously and smoothly, loop is seamless (no jump at wrap), roll pauses while typing in a chatbot and resumes after, no clipping of phones or bottom nav at either size, arrow navigation still works.
- Confirm clean build in `/tmp/observability/build-errors.log`.
