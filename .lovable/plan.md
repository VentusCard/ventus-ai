

## Plan: Convert Personalized UX & Personalized Rewards to iPad Frame

Both the Engagement and Rewards overlays currently use a narrow phone/browser mockup (440–480px wide with red/yellow/green browser dots and a URL bar). The Wealth view uses a wider iPad frame with a thick slate border, camera dot, status bar with time/battery, and an 820px max-width. The goal is to give the Engagement and Rewards views the same iPad treatment.

### Changes

**1. `src/components/demo/DemoEngagementView.tsx` (PhoneMockup component, ~line 170–190)**
- Replace the phone frame wrapper:
  - Change `max-w-[480px]` → `max-w-[820px]`
  - Replace `rounded-2xl border border-slate-200` browser-style frame with the iPad frame: `rounded-[2rem] border-[10px] border-slate-300` with matching box-shadow
  - Replace the browser bar (red/yellow/green dots + "yourbank.com/app") with:
    - Camera dot row (centered `w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400`)
    - Status bar (`9:41 AM` left, `TCBY Bank` center, battery icon right)
  - Wrap content in `bg-slate-50 rounded-sm overflow-hidden` like Wealth view
  - Update inner content area to use `max-w-2xl mx-auto` for centered content

**2. `src/components/demo/DemoRewardsView.tsx` (RewardsPhoneMockup component, ~line 218–236)**
- Apply the same iPad frame transformation:
  - Change `max-w-[440px]` → `max-w-[820px]`
  - Replace browser frame with iPad frame (thick border, camera dot, status bar)
  - Replace fixed height `max-h-[680px] min-h-[680px]` with natural content flow
  - Wrap content in `bg-slate-50 rounded-sm overflow-hidden`
  - Center inner content with `max-w-2xl mx-auto`

### Technical details
- The iPad frame structure from `DemoWealthView.tsx` lines 115–132 will be replicated exactly
- Both views keep their existing content layout inside the frame — only the outer shell changes
- The deal cards, lifestyle spending grid, local perks section, etc. remain unchanged

