# Slide 8: Hawaii question asks itself only once

## What changes
- The Hawaii question and its answer show up the first time you reach slide 8.
- After that, moving off the slide and coming back leaves the conversation as it was. The question isn't asked again.
- A new question only appears when you type one yourself. The earlier question and answer stay above it.
- The /demo chat doesn't change.

## Cause
The phone passes the opening question only while the beat is active (`pendingAIPrompt={active ? RETENTION_OPENING_PROMPT : null}`). Leaving the beat switches that value to null, and coming back sets it again. Each switch changes `messageNonce` (undefined → 1), which clears the chat's "already sent" guard. The question then fires again.

## Technical details
- `DeckmoBankdemoScenes.tsx` / `RetentionPhone`: keep a flag that turns on the first time `active` is true. Once it's on, always pass `RETENTION_OPENING_PROMPT`, the same constant object, and never null. The nonce then stays at 1, so the guard in `ConsumerAIChatView` never clears.
- If the phone is removed from the page when you leave the slide, save the chat state (messages plus a "sent" flag) outside the component, in a deck-only store tied to the retention phone. That way coming back shows the same conversation. Do this with an optional `persistKey` prop on `ConsumerAIChatView`, passed through `ExecDemoPhoneView`. Without the prop, the chat works as it does today.
- Check in the browser: go to 8.1, then 7.x, then back to 8.1 a few times. The question should appear once. Then type a follow-up and confirm it shows up below the earlier answer.
