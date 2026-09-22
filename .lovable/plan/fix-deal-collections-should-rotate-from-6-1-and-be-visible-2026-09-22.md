# Fix: deal collections should rotate from 6.1 and be visible

## What I found

The rotation works, but only from beat 6.5, and even there it is hard to see:

- Rotation is gated to `step >= 4` (beat 6.5). On 6.1–6.4 the phone is parked on the tennis collection.
- On 6.5 the card does change every 2 seconds (tennis → dog → December trip → new home → investing, each with its own picture), but the rewards screen shows static blocks first — savings bar, city perks, "Top Pick For You", "Expiring Soon" — and the rotating card is last, cut off at the bottom, with its position dots below the fold. So almost nothing visible moves.

## The fix

1. Start rotation as soon as the rewards phone appears on 6.1, and keep it running through 6.5.
2. Make the collections the focus of the rewards screen while cycling: hide the savings bar, city perks, top pick and expiring-soon blocks so the collection card sits near the top, fully visible with its image, message, merchant pills, and the position dots underneath.
3. Long-term / other phone slides stay exactly as they are.

## Technical notes

- `DeckmoBankdemoScenes.tsx`: `PhoneScene` passes `cycleCollections={tab === "rewards"}` (drop the `step >= 4` gate); `ExactPhone` forwards it both as `autoRotateCollections` and as a new focus flag.
- `ExecDemoPhoneView.tsx`: forward the focus flag to `GeneratedOffersPhoneView` as `focusMode` (already supported — it suppresses exactly those upper blocks).
- No changes to rotation timing (2s), the image bank, slide order, beat counts, or `/demo` and `/bankdemo`.
- Verify in the preview at 1540x855 and 1920x1080: on 6.1 the card and dots are fully visible and collections cycle; all five appear within ~10s; other slides unchanged.
