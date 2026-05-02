## Goal

Rework the two cards in `NextConversationRationale.tsx` so they showcase the **workflow itself**, not the specific signal that's currently selected. Right now each stage dumps the selected signal's label, evidence, confidence, talking points, etc. Instead, each stage should describe **what the engine does at that step** — pill-agnostic, generic, repeatable. The cards become a "how it works" diagram, not a data readout.

The signal-specific detail already lives in the context band (`ContextPillRows`) above and in the other panels. The two journey cards should explain the **method**.

## File

`src/components/exec-demo/NextConversationRationale.tsx`, lines ~887–977 (Regular flow) and ~997–1083 (Wealth flow). Keep card chrome (brand strip, eyebrow row, outer `article`), the 4-stage grid layout, chevron connectors, accented Orchestrate stage, and CTA buttons. Drop all per-signal data references inside the stages.

## What changes per stage

Both cards keep the same 4-stage shape: SIGNAL → INTENT → PERSONALIZE → ORCHESTRATE. Each stage gets a small icon, a short headline describing the engine's job at that step, and 2–3 generic descriptor chips/lines that apply to any signal — no `effectiveSignal.label`, no `playbook.signalSource`, no `primarySignal.evidence`, no `wp.talkingPoints`, no `playbook.automatedFlow.subject`.

### Regular Client (automated)

```text
┌─ SIGNAL ─────────┐→┌─ INTENT ─────────┐→┌─ PERSONALIZE ─┐→┌─ ORCHESTRATE ──────┐
│ icon: Activity   │ │ icon: Brain      │ │ icon: Sparkles│ │ icon: Send         │
│ "Behavior        │ │ "Intent          │ │ "Message      │ │ "Automated         │
│  detected"       │ │  classified"     │ │  generated"   │ │  delivery"         │
│                  │ │                  │ │               │ │                    │
│ • Transaction    │ │ • Maps to        │ │ • Channel     │ │ • Multi-step       │
│   pattern        │ │   playbook       │ │   selected    │ │   sequence         │
│ • Merchant +     │ │ • Confidence     │ │ • Subject +   │ │ • AI chatbot       │
│   category       │ │   scored         │ │   body crafted│ │   on standby       │
│ • Velocity shift │ │ • Trigger fires  │ │ • Personalized│ │ • Zero advisor     │
│                  │ │                  │ │   to customer │ │   time             │
│                  │ │                  │ │               │ │ [Open AI Assistant]│
└──────────────────┘ └──────────────────┘ └───────────────┘ └────────────────────┘
```

### Wealth Client (advisor-led)

```text
┌─ SIGNAL ─────────┐→┌─ INTENT ─────────┐→┌─ PERSONALIZE ─┐→┌─ ORCHESTRATE ──────┐
│ icon: Radar      │ │ icon: Sparkles   │ │ icon: FileText│ │ icon: CalendarCheck│
│ "Multi-signal    │ │ "AI synthesis"   │ │ "Brief built  │ │ "Conversation      │
│  detected"       │ │                  │ │  for advisor" │ │  scheduled"        │
│                  │ │                  │ │               │ │                    │
│ • Primary +      │ │ • Cross-signal   │ │ • Talking     │ │ • Next-step        │
│   secondary      │ │   correlation    │ │   points      │ │   timeline         │
│   triggers       │ │ • Urgency +      │ │ • Risk &      │ │ • WM Copilot       │
│ • Cross-pillar   │ │   confidence     │ │   opportunity │ │   prepped          │
│   evidence       │ │ • Wealth context │ │   framing     │ │ • Advisor in       │
│ • Time horizon   │ │   layered        │ │ • Tailored to │ │   the loop         │
│                  │ │                  │ │   advisor     │ │ [Open WM Copilot]  │
└──────────────────┘ └──────────────────┘ └───────────────┘ └────────────────────┘
```

## Stage component shape

Each stage becomes a uniform structure (no per-card branching, no `effectiveSignal`/`primarySignal`/`playbook`/`wp` reads inside):

```tsx
<div className="min-h-0 min-w-0 flex flex-col rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1.5 overflow-hidden">
  <div className="text-[9px] font-bold uppercase tracking-wider text-blue-500 mb-1">
    {stageLabel}            {/* SIGNAL / INTENT / PERSONALIZE / ACTIVATE */}
  </div>
  <div className="flex items-center gap-1.5 mb-1">
    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-blue-200">
      <Icon className="w-3 h-3 text-blue-600" />
    </span>
    <div className="text-[12px] font-semibold text-slate-900 leading-tight">
      {stageHeadline}
    </div>
  </div>
  <ul className="space-y-0.5 mt-1">
    {bullets.map(b => (
      <li className="text-[10.5px] text-slate-600 leading-snug flex gap-1.5">
        <span className="mt-[5px] w-1 h-1 rounded-full bg-blue-300 shrink-0" />
        <span>{b}</span>
      </li>
    ))}
  </ul>
</div>
```

Orchestrate stage keeps its accented treatment (`bg-blue-50/70 border-blue-300` / `bg-purple-50/70 border-purple-300`), the same bullets pattern, and the CTA button pinned at the bottom via `mt-auto`.

## Code cleanup

- Remove all reads of `effectiveSignal.label`, `playbook.signalSource`, `playbook.automatedFlow.triggerLogic`, `playbook.chatbotContext.knows`, `playbook.automatedFlow.channel/subject/sequence` **inside the two cards**. The `playbook` lookup, `KIND_META`, `URGENCY_STYLES`, `ChannelIcon`, `findPlaybook`, `findWealthPreview` stay because they're used by `ContextPillRows` and other branches — just stop consuming them in the card stages.
- Remove `primarySignal`/`secondarySignal`/`PrimaryIcon`/`SecondaryIcon`/`wp.talkingPoints`/`wp.nextSteps` reads inside the Wealth card stages. The `wp` lookup can stay if still referenced elsewhere; otherwise drop it from this branch.
- Replace icons used in stages with: `Activity`, `Brain`, `Sparkles`, `Send` (Regular) and `Radar`, `Sparkles`, `FileText`, `CalendarCheck` (Wealth). All from `lucide-react`. Add any missing imports.
- Keep CTA buttons (`onOpenAIAssistant`, `onOpenWMCopilot`) and the brand strip / eyebrow rows untouched.

## Visual rules

- Light theme, Manrope, no `dark:` utilities.
- Stage eyebrow stays brand-colored (`text-blue-500` / `text-purple-500`).
- Headline `text-[12px] font-semibold text-slate-900`; bullets `text-[10.5px] text-slate-600`.
- Orchestrate stage gets `p-2.5` and the colored border/background; other 3 stages stay `px-2 py-1.5` with neutral chrome.
- Chevron connectors unchanged.
- No internal scrolling needed since bullets are now bounded (≤3 per stage); drop `overflow-y-auto exec-light-scroll` from the stage bodies.

## Out of scope

- `ContextPillRows` (the band above the cards) — still shows the selected signal's specifics.
- All Signals roll-up branch.
- Next-Offer / Next-Product tabs.
- Data structures (`PLAYBOOKS`, `STATIC_WEALTH_PREVIEW`) — still used elsewhere, just not consumed inside the two stage flows.

Approve and I'll switch to build mode.