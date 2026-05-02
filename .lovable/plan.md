## Goal

Rebuild the Regular Client and Wealth Client cards from scratch, telling **two distinct journeys** with a **hero + supporting** layout. Each card is one cohesive object — not a row of tiles.

- **Regular Client**: an **automated machine** that runs without humans. Hero = the live nurture flow. Supporting (right rail) = the AI chatbot the customer talks to + an "Open" CTA.
- **Wealth Client**: an **AI-prepped human conversation**. Hero = the brief the advisor walks into a meeting with. Supporting (right rail) = the WM Copilot mock + an "Open" CTA.

Same skeleton (`hero left, dark accent rail right`) so the eye instantly compares the two journeys, but the **content metaphor is different** — Regular feels like a pipeline; Wealth feels like a briefing.

```text
┌─ Context (3 pill rows) ──────────────────────────────────────────┐
├──────────────────────────────────────────────────────────────────┤
│  ┌─ REGULAR CLIENT ─────────────────────────────────────────────┐│
│  │ HERO (light gradient)              │ RAIL (deep blue)        ││
│  │ ─────────────────────────          │ ─────────────────────   ││
│  │  Email flow                        │  AI Chatbot             ││
│  │  "Your home journey…"              │  knows: pill·pill·pill  ││
│  │  trigger  → 1·2·3 sequence         │  asks: pill·pill        ││
│  │  channel chip + step rail          │  ──────────────         ││
│  │                                    │  [Open Assistant →]     ││
│  └────────────────────────────────────┴─────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│  ┌─ WEALTH CLIENT (+) ──────────────────────────────────────────┐│
│  │ HERO (light purple gradient)       │ RAIL (deep purple)      ││
│  │ ─────────────────────────          │ ─────────────────────   ││
│  │  Advisor brief                     │  WM Copilot             ││
│  │  Signal pill · 92% Urgent          │  miniature chat bubble  ││
│  │  • Talking point #1                │  user reply             ││
│  │  ●─ next step today                │  ──────────────         ││
│  │  ●─ next step tomorrow             │  [Open Copilot →]       ││
│  └────────────────────────────────────┴─────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

## File

`src/components/exec-demo/NextConversationRationale.tsx` — replace the JSX from the wrapper at line ~860 down through the end of the bottom `</section>` (~line 1095). Keep `ContextPillRows`, all data structures (`PLAYBOOKS`, `STATIC_WEALTH_PREVIEW`, `findPlaybook`, `findWealthPreview`), `KIND_META`, and `ChannelIcon` exactly as they are. No edge-function or data work.

## Content kept (everything stays — just re-presented)

**Regular hero:** automated flow channel + subject + trigger logic + numbered sequence (1·2·3).
**Regular rail:** chatbot "Knows" + "Can answer" — both rendered as compact pills (no bullet lists).

**Wealth hero:** primary signal card (icon + label + confidence + urgency + evidence), then talking points as bullets, then next steps as a 4-step timeline.
**Wealth rail:** WM Copilot mock chat (assistant bubble + user reply + faux input).

Nothing is dropped — but the chatbot lists become inline pills (each "Knows" item is a small chip; "Can answer" is one chip per question).

## Layout & visual rules

### Outer container
- Two rows in a column flex (`gap-3`), each row `flex-1 basis-0 min-h-0` → equal vertical halves.
- Each row is its own card: `rounded-xl border border-slate-200 overflow-hidden` (one object per journey).
- Internal split per card: `grid grid-cols-[minmax(0,1fr)_240px]` — hero left, rail right (fixed-width rail keeps both cards visually identical and prevents the rail from collapsing on narrower viewports).

### Regular card

- **Top edge strip** (8 px tall) — gradient from `#3b82f6` to `#1d4ed8`. Acts as a colored brand bar.
- **Hero (left)** — `bg-gradient-to-br from-blue-50/60 to-white p-3.5 flex flex-col min-h-0`:
  - Tiny eyebrow row: dot + `Regular Client` + `Automated · 0 advisor time` chip on the right.
  - Title block: `Email flow` (text-base bold) with channel icon as a small square badge to the left.
  - Subject in slate-700 medium, italic trigger logic below.
  - **Sequence rail** — horizontal connected pills: `(1)─Educational nudge─(2)─Product spotlight─(3)─Soft CTA`, with thin connector lines between numbered circles and step labels under them. This is the visual hook — looks like a real pipeline.
  - Inner scroll only on the sequence rail if it overflows; rest is fit-to-space.
- **Rail (right)** — `bg-gradient-to-b from-blue-700 to-blue-900 text-white p-3.5 flex flex-col`:
  - Header: `MessageSquare` icon + `AI Chatbot` (text-xs bold, white).
  - "Knows" section: tiny uppercase `KNOWS` label + chips (`bg-white/10 border border-white/20 text-blue-50 text-[10px] rounded-full px-2 py-0.5`).
  - "Can answer" section: same chip style but italic.
  - Push-down spacer, then the CTA button at the bottom: `bg-white text-blue-700 rounded-lg font-bold flex items-center justify-between px-3 py-2`, label `Open AI Assistant`, trailing `→`.
  - Rail content scrolls if it overflows (`min-h-0 overflow-y-auto`), CTA stays pinned via `mt-auto`.

### Wealth card

- **Top edge strip** — gradient from `#8b5cf6` to `#6d28d9`.
- **Hero (left)** — `bg-gradient-to-br from-purple-50/60 to-white p-3.5 flex flex-col min-h-0`:
  - Eyebrow: dot + `Wealth Client (+)` + `Advisor-led · AI prepped` chip.
  - Featured signal pill row — first signal as a banner: icon · label · confidence% · urgency badge · italic evidence underneath. If 2+ signals, second signal compact below.
  - Divider line.
  - **Briefing body** in two stacked mini-sections:
    - `TALKING POINTS` (eyebrow) → 3 bullets, each `· point` in slate-700.
    - `NEXT STEPS` (eyebrow) → vertical purple timeline with `when` (purple-700 semibold) + action.
  - This whole area is `min-h-0 overflow-y-auto exec-light-scroll pr-1`.
- **Rail (right)** — `bg-gradient-to-b from-purple-700 to-purple-900 text-white p-3.5 flex flex-col`:
  - Header: white V-mark badge + `WM Copilot` + tiny `AI` chip.
  - One assistant chat bubble (`bg-white/10 border border-white/20 text-purple-50 rounded-xl rounded-bl-sm px-2.5 py-1.5 text-[11px]`) and one user reply (`bg-white text-purple-900 rounded-xl rounded-br-sm self-end`).
  - Faux input row: `bg-white/5 border border-white/15 rounded-md px-2 py-1` with placeholder + Send icon.
  - CTA at the bottom: `bg-white text-purple-700` button, `Open WM Copilot` + `↗`.

### Shared design tokens

- All copy stays Manrope (project default).
- White text on rail uses `text-white`, secondary uses `text-blue-100` / `text-purple-100`.
- Light theme rule preserved: hero side stays white-on-light; rails are the only saturated areas.
- No new shadcn dependencies. No emojis. No `dark:` utilities.
- Vertical-text buttons removed — buttons live inside the rail and read normally.

## Out of scope

- No changes to Next-Offer or Next-Product tabs.
- No changes to `ContextPillRows` (the 3-row context band stays as-is).
- No data or copy edits — purely a presentation rebuild.

Approve and I'll switch to build mode and apply it.