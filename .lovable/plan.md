## Goal

Re-skin the AI Banking Assistant phone mockup as an **iPad-style** device. Wider aspect ratio uses the column whitespace properly, matches the existing iPad pattern in `DemoDetailOverlay.tsx`, and gives the chat (especially the lifestyle breakdowns) real horizontal room.

## Reference: existing iPad pattern

`src/components/demo/DemoDetailOverlay.tsx` line 219:
- `rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl`
- Camera dot at top-center (2x2 slate-300)
- Status bar with 9:41 AM, "Our Bank" centered, Wifi + Battery on right
- Content: `flex-1 bg-white min-h-0 overflow-hidden flex flex-col` (for AI tab)

## Changes

### 1. `src/components/exec-demo/ExecDemoPhoneView.tsx` — convert frame to iPad

Lines 125-198 (the entire frame markup). Swap the iPhone bezel for the iPad pattern:

- **Outer wrapper**: `relative flex items-center justify-center h-full p-3` (slightly less padding so iPad fills the column).
- **Frame**: `rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col` with explicit `width: 100%` and `height: 100%` (no fixed pixel dims — the column controls width, parent flex controls height). Remove the iPhone-only notch and home indicator.
- **Camera dot** (replaces notch): `flex justify-center pt-1.5 pb-0.5 bg-white` containing `w-2 h-2 rounded-full bg-slate-300`.
- **Status bar**: combine the existing live-dot/firstName header into the iPad-style status bar — `9:41 AM` left, `Our Bank · {firstName}` center (with the green live-dot before it), Wifi+Battery right.
- **Content area**: keep `flex-1 min-h-0 bg-white` with the `overflow-hidden flex flex-col` branch for AI / `overflow-y-auto exec-light-scroll` branch for others. Existing `renderContent()` is unchanged.
- **Tab bar**: keep as-is (already `shrink-0`).
- **Home indicator**: drop it (iPads don't have one in this pattern).

### 2. `src/pages/ExecDemoPage.tsx` — column width for iPad ratio

Lines 1241-1243 and 1271:
- `expandedW`: **440 → 560** (iPad-ish landscape-leaning panel; gives chat ~536px usable width).
- Inner wrapper: `w-[440px]` → `w-[560px]`.
- `collapsedW` stays 40.

The iPad now fills the column edge-to-edge with just the small `p-3` breathing room — no more dead whitespace.

### 3. `src/components/demo/ConsumerAIChatView.tsx` — bubble width

Line 366: `max-w-[88%]` → `max-w-[85%]`. The chat is now genuinely wide; pulling bubbles back from the edge a touch keeps them readable instead of stretching to the full column.

## What stays the same

- Tab logic, prompt dispatch, sliver collapse, animations, all child phone-views (Rewards, Membership, AI).
- Names: file is still `ExecDemoPhoneView.tsx` — internal class name `phone-mockup-frame` stays so any global CSS still applies.
- Border color (slate-300), shadow (shadow-2xl), rounding language all match the existing iPad memory note.
