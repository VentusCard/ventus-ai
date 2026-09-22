# Fix: deal collections look static on beat 6.5

## What I found

The rotation is actually running. On 6.5 the "Curated for Ricky" card does change every 2 seconds — I watched five different collections appear in the live preview (tennis → dog → December trip → new home → investing), each with its own picture.

The problem is that you can barely see it:

- The rewards screen shows a stack of static blocks first — the savings bar, "Welcome to New York" perks, "Top Pick For You", and "Expiring Soon". The rotating collection card is the last thing on the screen.
- At the current phone size the card is cut off by the bottom of the scroll area, and the little dots that show which collection you're on sit below the fold entirely.
- So on screen almost nothing appears to move: everything visible stays the same, and only a sliver of the changing card shows.

## The fix

On beat 6.5 only, make the deal collections the focus of the rewards screen:

- Hide the savings bar, city perks, top pick, and expiring-soon blocks while cycling, so the collection card sits near the top of the phone, fully visible with its image, message, merchant pills, and the position dots underneath.
- Keep 6.1–6.4 exactly as they are today (full rewards screen, parked on the tennis collection), and reset cleanly when stepping back from 6.5.

## Technical notes

- `ExactPhone` / `PhoneScene` in `DeckmoBankdemoScenes.tsx`: pass the existing `cycleCollections` flag through to a new focus flag on `ExecDemoPhoneView`.
- `ExecDemoPhoneView.tsx`: forward it to `GeneratedOffersPhoneView` as `focusMode` (the component already supports `focusMode`, which suppresses exactly those upper blocks).
- No changes to rotation timing, the image bank, slide order, beat counts, or `/demo` and `/bankdemo`.
- Verify in the preview at 1540x855 and 1920x1080: on 6.5 the card and its dots are fully visible and all five collections appear within ~10s; 6.4 unchanged.
