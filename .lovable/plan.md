## Goal

Make the AI Banking Assistant phone column wider and use the extra width efficiently — wider phone frame, wider chat bubbles — without breaking the iPhone proportions.

## Changes

### 1. `src/pages/ExecDemoPage.tsx` (phone column)

Around line 1241-1242 and 1271:
- `expandedW`: **360 → 440**
- Inner wrapper `w-[360px]` → `w-[440px]`

### 2. `src/components/exec-demo/ExecDemoPhoneView.tsx` (phone frame)

Around line 130:
- Frame width **340 → 420**, keep height 740 (iPhone-ish ratio stays believable; ~1.76 vs original ~2.18 — still phone-shaped, just a slightly taller modern device).
- If proportion looks off in QA, alternative: width 400 / height 760.

### 3. `src/components/demo/ConsumerAIChatView.tsx` (chat bubble width)

The bubbles currently cap at a small max-width. Around line 440-ish, the message bubble has a `max-w-[...]` class — bump from `max-w-[80%]` (or whatever's there) to `max-w-[88%]` so the extra horizontal room is actually used by markdown breakdowns (the new lifestyle bullets benefit most).

I'll verify the exact class during implementation.

## What stays the same

- Collapse/expand sliver behavior (`collapsedW = 40`).
- Tabs, header, scroll behavior, padding inside the phone.
- Rewards & Membership phone views — they re-flow naturally.
