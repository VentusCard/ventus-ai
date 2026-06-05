## Goal
On the next-product tab of `/demo`, add a horizontal card that lets the user pick how a product recommendation is delivered: **Mobile Banking** (current view), **Email**, or **SMS / Text**. The phone mockup on the right re-renders to show the corresponding channel preview using the same `productCards` data.

## Changes

### 1. New shared state — delivery channel
In `src/pages/ExecDemoPage.tsx`:
- Add `const [productDeliveryChannel, setProductDeliveryChannel] = useState<"mobile" | "email" | "sms">("mobile");`
- Pass it down to both `ExecDemoIntelPanel` (so the selector card knows the current value + setter) and `ExecDemoPhoneView` (so the phone reflects it).

### 2. New horizontal selector card
New component `src/components/exec-demo/ProductDeliveryChannelCard.tsx`:
- Horizontal card rendered inside `NextProductRationale` (above or below the existing product cards block).
- Three pill/segment options laid out horizontally with icons (`Smartphone`, `Mail`, `MessageSquare`), labels, and one-line descriptions ("In-app push card", "Personalized email", "SMS nudge").
- Active state visually highlighted (border + accent ring); click sets the channel.

Wire it through:
- `NextProductRationale` gets new props `deliveryChannel` + `onDeliveryChannelChange` and renders the new card.
- `ExecDemoIntelPanel` forwards those props from `ExecDemoPage`.

### 3. Phone mockup reflects channel
In `src/components/exec-demo/ExecDemoPhoneView.tsx`:
- Accept new prop `productDeliveryChannel`.
- When the active tab maps to `relationship` (the next-product tab):
  - `mobile` → render existing `RelationshipPhoneView` (unchanged).
  - `email` → render new `EmailPreviewPhoneView` (Gmail-style inbox + opened message styled from the first product card: theme color header, subject = `card.product_name`, body uses `card.quote` + `benefits` + CTA).
  - `sms` → render new `SmsPreviewPhoneView` (Messages-style thread with bank avatar, 2–3 chat bubbles built from the first product card: short hook, benefit, CTA link).
- Both new previews live in `src/components/exec-demo/phone-channels/` (`EmailPreviewPhoneView.tsx`, `SmsPreviewPhoneView.tsx`). They accept `cards: ProductCard[]` and `customerName` and use the existing `THEME_STYLES` palette from `ProductCardsPhoneView.tsx` (exported if needed) for visual continuity.

### 4. Behavior details
- Channel selection is presentation-only: no backend calls, no edge function changes.
- Default channel = `mobile` so current demo behavior is preserved on first load.
- When `productCards` is empty/loading, the email/sms views show the same "loading…" placeholder pattern already used by `RelationshipPhoneView`.

## Files touched
- `src/pages/ExecDemoPage.tsx` — add channel state, pass props.
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — forward props to `NextProductRationale`.
- `src/components/exec-demo/NextProductRationale.tsx` — render the new selector card.
- `src/components/exec-demo/ProductDeliveryChannelCard.tsx` — new.
- `src/components/exec-demo/ExecDemoPhoneView.tsx` — accept channel, branch render.
- `src/components/exec-demo/phone-channels/EmailPreviewPhoneView.tsx` — new.
- `src/components/exec-demo/phone-channels/SmsPreviewPhoneView.tsx` — new.
- `src/components/exec-demo/ProductCardsPhoneView.tsx` — export `THEME_STYLES` for reuse (no behavior change).

No backend, schema, or routing changes.
