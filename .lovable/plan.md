# Cache the correct Hawaii answer on slide 8.1

## What changes
The opening question on slide 8.1 ("How much have I spent on my last trip to Hawaii?") will always show the same, correct answer instantly — no waiting on the assistant, and no "having trouble connecting" message. Follow-up questions you type still go to the live assistant.

The fixed answer:

```text
Your Dec 2025 Hawaii trip spend breakdown:

Lodging — $7,420 (Hilton Waikoloa Village, Grand Wailea Resort, Koa Kea Hotel Kauai)
Air Travel — $2,705 (Hawaiian Airlines HNL)
Dining — $801 (Luau Kalamaku Kauai, Beach House Restaurant Kauai, Mama's Fish House Maui)
Experiences — $189 (Boss Frog Snorkel Tour)

Total: $11,115
```

Same bolding and spacing as today, with a short "typing" pause so it still feels like the assistant is answering.

## Technical details
- `DeckmoBankdemoScenes.tsx`: add `HAWAII_CANNED_ANSWER` (markdown string above, bold category lines and total) and pass it to the phone as a `cannedAnswers={{ [openingPrompt]: HAWAII_CANNED_ANSWER }}` prop.
- Thread the prop through `ExecDemoPhoneView` to the consumer AI chat view. In its send handler, if the message matches a canned key, wait ~700ms then append the assistant message (no actions) and skip the edge-function call.
- Also treat the canned answer as the fallback if a live follow-up fails only when it is the opening prompt; other failures keep the current error message.
- /demo chat untouched (prop is optional). Verify on 8.1 at 1540×855: answer appears with all eight merchants and $11,115, no network request for the opening prompt.
