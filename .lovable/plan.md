## Goal

Inside each of the two stacked halves, lay sub-cards out **horizontally** AND move the CTA button into the row as the rightmost column (narrow vertical button), so each half is a single horizontal strip ending in its action button.

```text
┌─ Context (3 pill rows) ────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────────────┤
│ Regular Client                                                     │
│  ┌─ Email flow ─────┬─ AI Chatbot context ──┬─[Open AI Banking]─┐  │
│  │ subject          │ Knows: …              │       (vertical    │  │
│  │ trigger logic    │ Can answer: …         │        button)     │  │
│  │ 1.  2.  3.       │                       │                    │  │
│  └──────────────────┴───────────────────────┴────────────────────┘  │
├────────────────────────────────────────────────────────────────────┤
│ Wealth Client (+)                                                  │
│  ┌─ Signals ──┬─ TalkPts/Steps ─┬─ WM Copilot ──┬─[Open WM CoP.]─┐ │
│  │ sig card   │ • point         │ chat header   │   (vertical    │ │
│  │ sig card   │ • point ●─when  │ chat bubbles  │    button)     │ │
│  │            │ • point ●─when  │ input mock    │                │ │
│  └────────────┴─────────────────┴───────────────┴────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## File

`src/components/exec-demo/NextConversationRationale.tsx` — JSX between lines ~866–1083 only. No data, copy, or playbook changes.

## Changes

### 1. Regular Client half — single horizontal row with button as last column

Replace lines 874–954 (the old vertical scroll container + the full-width button below it) with one grid:

```tsx
<div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2.5">
  {/* Email flow card — column-scrolls */}
  <div className="rounded-lg px-3 py-2.5 flex flex-col min-h-0 overflow-y-auto exec-light-scroll" style={{…blue tint…}}>
    …existing channel header + subject + trigger + numbered sequence…
  </div>
  {/* Chatbot context card */}
  <div className="rounded-lg px-3 py-2.5 flex flex-col min-h-0 overflow-y-auto exec-light-scroll" style={{…blue tint…}}>
    …existing Knows + Can answer lists…
  </div>
  {/* Vertical CTA button */}
  <button
    onClick={onOpenAIAssistant}
    className="w-12 inline-flex flex-col items-center justify-center gap-2 text-[11px] font-bold rounded-lg px-2 py-3 text-white transition-all hover:scale-[1.02] hover:shadow-md shrink-0"
    style={{ background: "linear-gradient(180deg, #3b82f6, #1d4ed8)", boxShadow: "0 2px 8px rgba(59,130,246,.35)" }}
  >
    <MessageSquare className="w-4 h-4" />
    <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} className="tracking-wide leading-none">
      Open AI Banking Assistant
    </span>
  </button>
</div>
```

- `grid-cols-[1fr_1fr_auto]` keeps both content cards equal-wide and the button column tight (`w-12`).
- The button label is rendered top-to-bottom using `writing-mode: vertical-rl` + `rotate(180deg)` (reads bottom-to-top — standard pattern). Icon sits on top.
- Removes the old full-width button and the `mt-3` margin.

### 2. Wealth Client half — same pattern with 3 content columns + button column

Replace lines 966–1082 (the inner content scroll wrapper + full-width WM button) with:

```tsx
<div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-2">
  {/* Col 1 — Signals (scrolls) */}
  <div className="flex flex-col min-h-0 overflow-y-auto exec-light-scroll pr-1">
    <div className="text-[10px] uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
      <Sparkles className="w-2.5 h-2.5" /> Signals
    </div>
    <div className="flex flex-col gap-1.5">
      {wp.signals.map(…existing signal cards…)}
    </div>
  </div>

  {/* Col 2 — Talking Points + Next Steps (scrolls) */}
  <div className="flex flex-col gap-2 min-h-0 overflow-y-auto exec-light-scroll pr-1">
    <div>
      <div className="text-[10px] uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
        <MessageSquare className="w-2.5 h-2.5" /> Talking Points
      </div>
      <div className="space-y-1">…existing pills…</div>
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
        <CalendarCheck className="w-2.5 h-2.5" /> Next Steps
      </div>
      <ol className="relative">…existing timeline…</ol>
    </div>
  </div>

  {/* Col 3 — WM Copilot mock chat */}
  <div className="flex flex-col min-h-0 rounded-lg border border-purple-200 bg-white overflow-hidden">
    …existing header (shrink-0)…
    <div className="px-2 py-1.5 space-y-1.5 flex-1 min-h-0 overflow-y-auto">…bubbles…</div>
    …existing input mock (shrink-0)…
  </div>

  {/* Col 4 — Vertical CTA button */}
  <button
    onClick={onOpenWMCopilot}
    className="w-12 inline-flex flex-col items-center justify-center gap-2 text-[11px] font-bold rounded-lg px-2 py-3 text-white transition-all hover:scale-[1.02] hover:shadow-md shrink-0"
    style={{ background: "linear-gradient(180deg, #8b5cf6, #6d28d9)", boxShadow: "0 2px 8px rgba(139,92,246,.35)" }}
  >
    <ArrowUpRight className="w-4 h-4" />
    <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} className="tracking-wide leading-none">
      Open WM CoPilot
    </span>
  </button>
</div>
```

- Center column `1.2fr` (densest content); side content columns `1fr`; button column `auto` (`w-12`).
- WM Copilot mock chat now flexes to fill its column with internal scroll on bubbles.

### 3. Keep these untouched

- The 50/50 outer split between Regular and Wealth halves.
- `ContextPillRows` band, all data, copy, and the inner content of every sub-card (signal cards, chat bubbles, etc.).

## Out of scope

- No changes to Next-Offer or Next-Product tabs.
- No copy or data changes.
- No font-size changes inside the content cards.

Approve and I'll switch to build mode and apply it.