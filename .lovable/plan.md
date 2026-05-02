## Goal

Inside each of the two cards (Regular Client and Wealth Client) in `NextConversationRationale.tsx`, replace the current hero-left / dark-rail-right split with a **single horizontal flow** that reads left → right as:

```text
SIGNAL  →  ENRICHMENT / INTENT  →  PERSONALIZATION  →  ORCHESTRATION
```

So each card becomes one continuous pipeline that visualizes how a raw signal turns into a customer-facing action — instead of two unrelated panels (hero + AI rail).

```text
┌─ Context (3 pill rows) ──────────────────────────────────────────────┐
├──────────────────────────────────────────────────────────────────────┤
│  REGULAR CLIENT — automated machine                                  │
│  ┌─ SIGNAL ──┐→┌─ INTENT / ENRICH ─┐→┌─ PERSONALIZE ─┐→┌─ ORCHESTRATE ─┐ │
│  │ icon      │ │ "Home buyer"       │ │ Email flow    │ │ 1·2·3 sequence │ │
│  │ label     │ │ trigger logic      │ │ Subject line  │ │ + AI Chatbot   │ │
│  │ evidence  │ │ chatbot knows…     │ │ channel chip  │ │ [Open AI →]    │ │
│  └───────────┘ └───────────────────┘ └───────────────┘ └────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│  WEALTH CLIENT (+) — AI-prepped human conversation                   │
│  ┌─ SIGNAL ──┐→┌─ INTENT / ENRICH ─┐→┌─ PERSONALIZE ─┐→┌─ ORCHESTRATE ─┐ │
│  │ primary   │ │ confidence + 2nd   │ │ Talking pts   │ │ Next-step       │ │
│  │ signal    │ │ signal + evidence  │ │ for advisor   │ │ timeline +      │ │
│  │ icon/lbl  │ │                    │ │               │ │ WM Copilot CTA  │ │
│  └───────────┘ └───────────────────┘ └───────────────┘ └────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

The dark "rail" disappears as a vertical column. The orchestration step (chatbot for Regular, Copilot + CTA for Wealth) becomes the **last stage of the flow**, accented by the brand color so it still reads as the activation moment, just oriented horizontally like every other stage.

## File

`src/components/exec-demo/NextConversationRationale.tsx`, lines ~865–1083 (the JSX returned for a single selected signal). Keep `ContextPillRows`, all data structures (`PLAYBOOKS`, `STATIC_WEALTH_PREVIEW`, `findPlaybook`, `findWealthPreview`), `KIND_META`, `URGENCY_STYLES`, and `ChannelIcon` exactly as-is. Keep the "All Signals" branch and props unchanged.

## Layout per card

Each card becomes a single horizontal grid:

```tsx
<article className="flex-1 basis-0 min-h-0 rounded-xl border border-slate-200 overflow-hidden bg-white">
  {/* Brand strip stays on top */}
  <div className="h-[6px]" style={{ background: regularGradient }} />

  {/* Eyebrow row — client type + automation chip */}
  <div className="px-3.5 pt-2 pb-1.5 flex items-center gap-2">…</div>

  {/* Horizontal flow — 4 stages with arrow connectors */}
  <div className="grid grid-cols-[minmax(0,1fr)_12px_minmax(0,1fr)_12px_minmax(0,1fr)_12px_minmax(0,1.05fr)] gap-0 px-3.5 pb-3 flex-1 min-h-0">
    <Stage label="SIGNAL">…</Stage>
    <Arrow />
    <Stage label="INTENT">…</Stage>
    <Arrow />
    <Stage label="PERSONALIZE">…</Stage>
    <Arrow />
    <Stage label="ORCHESTRATE" accent>…</Stage>
  </div>
</article>
```

- 4 equal-width stages separated by 12 px arrow columns (`→` chevron in slate-300, vertically centered).
- Each stage is `flex flex-col min-w-0 min-h-0`; an uppercase eyebrow at top, content scrolls inside if it overflows (`overflow-y-auto exec-light-scroll`).
- Last stage is the **Orchestrate** stage; it gets the brand-colored treatment (light tinted background + colored border, e.g. `bg-blue-50/70 border border-blue-200` for Regular, `bg-purple-50/70 border border-purple-200` for Wealth) and contains the CTA pinned at its bottom via `mt-auto`.
- Card outer: same `flex-1 basis-0 min-h-0` so both cards stay 50/50 vertically.
- No more deep blue/purple rail. The journey contrast comes from the **content** in each stage, not from a dark column.

### Regular Client stage contents

1. **SIGNAL** — small colored icon badge (using `KIND_META[effectiveSignal.kind]`) + `effectiveSignal.label` (sm semibold) + `playbook.signalSource` as italic evidence underneath.
2. **INTENT / ENRICH** — eyebrow "Detected intent" + bold playbook key (e.g. `Home buyer`) + `playbook.automatedFlow.triggerLogic` italic + 2–3 chatbot `knows` items as small chips (`bg-slate-100 text-slate-700`). This is what the engine learned from the signal.
3. **PERSONALIZE** — eyebrow "Message crafted" + channel icon badge + `playbook.automatedFlow.channel` chip + `playbook.automatedFlow.subject` quoted in semibold slate-900 + 1 line "Personalized to {customerFirstName}".
4. **ORCHESTRATE** (accented blue) — eyebrow "Activated" + horizontal mini-sequence: numbered circles `(1)→(2)→(3)` with step labels under them, compactly stacked. Below: tiny `MessageSquare` icon + "AI Chatbot ready" line + the existing **Open AI Assistant** button pinned at bottom (`bg-blue-600 text-white`).

### Wealth Client stage contents

1. **SIGNAL** — primary signal icon badge (purple) + `primarySignal.label` semibold + `primarySignal.evidence` italic.
2. **INTENT / ENRICH** — eyebrow "AI prepped" + confidence row (`{primarySignal.confidence}%` + urgency badge using `URGENCY_STYLES`) + secondary signal compact line (icon + label + `{secondary.confidence}%`) if present.
3. **PERSONALIZE** — eyebrow "Advisor brief" + bullet list of `wp.talkingPoints` (purple dots, slate-700 text). Scrolls internally.
4. **ORCHESTRATE** (accented purple) — eyebrow "Conversation queued" + vertical `wp.nextSteps` timeline (compact: `when` purple-700 bold + `action` slate-700, with the existing left-bordered timeline). Pinned at bottom: the **Open WM Copilot** button (`bg-purple-600 text-white`). The faux chat input and assistant/user bubble mock are dropped — they were rail decoration and don't fit a horizontal stage. The Copilot is represented by the eyebrow + CTA.

## Visual rules

- Light theme preserved. No `dark:` utilities. No saturated dark columns.
- Manrope everywhere (project default), italic only for evidence/trigger text.
- Arrow connector: simple `ChevronRight` in `text-slate-300 w-3 h-3` centered vertically; on the Wealth card use `text-purple-200`, on Regular use `text-blue-200` so the flow direction reads as branded.
- Stage eyebrow: `text-[9px] font-bold uppercase tracking-wider`, color = brand-500 for the matching card.
- Stage body: `text-[11px]` slate-700 default, `text-sm` semibold slate-900 for the one headline element per stage (signal label / playbook key / subject / first next-step time).
- Stage internal padding: `px-2 py-1.5` for non-accented, `p-2.5` for the accented Orchestrate stage so the CTA gets breathing room.
- Each stage is `min-h-0 overflow-hidden flex flex-col`; only the densest sub-list inside (chatbot knows, talking points, next steps) gets `overflow-y-auto exec-light-scroll`.

## Out of scope

- No content rewrites — same data, just laid out as 4 horizontal stages.
- No changes to the All Signals roll-up branch, `ContextPillRows`, `Next-Offer`, or `Next-Product` tabs.
- No new dependencies; reuse `ChevronRight`, `MessageSquare`, `ArrowUpRight`, `Mail`, `Bell` from existing `lucide-react` imports already in the file.

Approve and I'll switch to build mode and apply it.