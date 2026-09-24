# Wire up "View Details" and "View Travel Deals" on slide 8.1

Today both buttons under the Hawaii answer do nothing when tapped. This makes them work, on the deck phone only (/demo chat stays as is).

## What each button does

**View Details**
- Opens an in-phone "Hawaii Trip" screen sliding over the chat (same style as the slide 5 transaction detail page, with a Back button).
- Shows every Hawaii purchase, grouped under Lodging, Air Travel, Dining, Experiences — each row: date, clean merchant name, amount — with a subtotal per group and the $11,115 total at the bottom.
- Back returns to the chat with the conversation intact.

**View Travel Deals**
- Opens an in-phone "Travel Deals for your next trip" screen (same slide-over, Back button).
- Shows the travel-related deals already generated for Ricky (hotels, airlines, resorts, experiences), one per row in the existing deal-row style with the neutral [logo] placeholder and reward pill.
- If fewer than 3 travel deals exist, falls back to a short curated list of Hawaii-relevant offers (resort, airline, island tour) so the screen is never empty.

## Behaviour notes
- Arrow-key navigation keeps working; leaving 8.1 and coming back resets to the chat.
- Fits inside the phone without page scrolling at 1024×768, 1590×855, 1920×1080 (the list scrolls inside the phone if needed).
- Strict light theme, existing typography.

## Technical details
- `ConsumerAIChatView`: add optional `onAction?: (label: string) => void` prop; replace the no-op onClick with `onAction?.(action)`. Pass through `ExecDemoPhoneView` as `onAIAction`.
- `RetentionPhone` (DeckmoBankdemoScenes.tsx): hold `overlay: null | "details" | "deals"` state, reset when `active` or step changes away; render an absolute slide-over inside the phone screen area. Details built from existing `HAWAII_ROWS` + `hawaiiGroup`. Deals filtered from `fixture` offers by travel categories, with curated fallback.
- Verify with Playwright: reach 8.1, wait for answer, tap each button, screenshot, Back.
