## New Tab: AI Assistant Activity

A new banker-facing view in the `/bankdemo` analytics sidebar that surfaces what consumers are asking the Ventus AI chatbot about, paired with a live iPad mockup that auto-plays curated conversations and lets the banker take over with real LLM responses.

### 1. Navigation

Add a new sidebar group **"Conversations"** at the top of `NAV_GROUPS` in `src/components/tepilot/insights/AnalyticsContainer.tsx` (just under "Home").

```text
Home
  Ventus AI
  System
Conversations            ← NEW
  AI Assistant Activity  ← NEW (icon: MessagesSquare)
Analytics
...
```

- New `TabValue`: `'ai-assistant-activity'`
- New `MODULE_NAV_GROUP_MAP` entry so the group shows whenever the Analytics module is enabled.
- New `TAB_LABELS` entry in `VentusAIChatPanel` plus quick-actions ("Top topics today", "Rising intents", "Unresolved questions", "Life-event signals from chat").

### 2. New view component

`src/components/tepilot/insights/AIAssistantActivityView.tsx` — split-panel layout matching other interactive demos.

```text
┌─────────────────────────────────────────────────────────────┐
│ TabHeader: "AI Assistant Activity"                          │
├──────────────────────────┬──────────────────────────────────┤
│ LEFT (≈60%)              │ RIGHT (≈40%)                     │
│                          │                                  │
│ Top KPIs strip           │       ╭───────────────╮          │
│ • Conversations / 24h    │       │ iPad mockup   │          │
│ • Avg msgs / convo       │       │ (live)        │          │
│ • Top intent             │       │               │          │
│ • Resolution rate        │       │ ConsumerAIChat│          │
│                          │       │   View        │          │
│ Trending Topics feed     │       │               │          │
│ (clickable cards)        │       ╰───────────────╯          │
│ ────────────────────     │  "Watching: <Topic>" caption     │
│ 🎿 Ski trip spend  ↑42%  │  [Pause] [Take over]             │
│ 🏠 First-home resources  │                                  │
│ ✈️  Holiday travel plan  │                                  │
│ 💍 Wedding savings       │                                  │
│ 👶 New baby budgeting    │                                  │
│ 🚗 EV vs gas TCO         │                                  │
│ 📈 401k rebalance        │                                  │
│ 💳 APR / debt payoff     │                                  │
│ 🎓 529 plan setup        │                                  │
│ 🍽 Dining budget tune-up │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

#### Left panel: Trending Topics feed
Curated list (constant data file) of ~10 topics. Each card shows:
- Emoji + label (e.g. "Ski trip spend recap")
- Vaguely-specific volume + delta ("Trending across many high-income skiers, ↑ this week")
- Top intent tag (Spend recap / Resource request / Life event / Product question)
- One representative anonymized question snippet
- "Play in mockup" affordance — clicking loads that scripted conversation into the iPad

Per memory rules: no exact transaction counts or specific spend amounts in copy; use vaguely-specific behavioral phrasing. No risk/stress language.

A small "Live conversation stream" sub-card at the bottom shows a slow auto-rotating anonymized feed of one-line questions (purely visual, no metrics).

#### Right panel: Live iPad mockup
Reuses the iPad chrome from `src/components/exec-demo/ExecDemoPhoneView.tsx` (status bar, frame, "Our Bank · {first name}" indicator). New thin wrapper `AIAssistantActivityPhone.tsx` renders just the iPad frame + status bar and embeds `ConsumerAIChatView` directly (skipping the bottom tab bar and other consumer tabs — chat only).

Two modes:
1. **Scripted/auto-play (default)** — feeds a queued user message into `ConsumerAIChatView` (already supports `initialMessage` + `messageNonce`), waits for the AI stream to complete via `consumer-chat` edge function, pauses ~5s, then advances to the next scripted question. Cycles through the selected topic's 2–4 turn conversation, then moves to the next trending topic.
2. **Take over** — banker can type into the chat directly; auto-rotation pauses until they hit "Resume demo".

Caption under the iPad reads "Watching: Ski trip spend recap" so the banker knows which topic is playing.

### 3. Data

`src/lib/aiAssistantActivityData.ts` — exports `TRENDING_TOPICS: TrendingTopic[]` with:

```ts
type TrendingTopic = {
  id: string;
  emoji: string;
  label: string;
  intent: "spend-recap" | "resource-request" | "life-event" | "product-question";
  volumeBlurb: string;     // "Trending across many high-income skiers"
  deltaBlurb: string;      // "↑ this week"
  sampleQuestion: string;  // shown on the card
  script: string[];        // 2-4 user turns to feed the iPad sequentially
};
```

Seed topics include: ski trip spend recap, first-home buying resources, holiday travel planning, wedding savings, new baby budgeting, EV vs gas TCO, 401k rebalance question, debt payoff strategy, 529 plan setup, dining budget tune-up.

### 4. Wiring

- `AnalyticsContainer.renderContent`: add `case 'ai-assistant-activity': return <AIAssistantActivityView />;`
- No backend / schema changes. Uses the existing `consumer-chat` edge function via the unchanged `ConsumerAIChatView`.
- No new dependencies.

### Technical notes

- Reusing `ConsumerAIChatView` keeps the actual chat behavior identical to what consumers see (markdown rendering, streaming, persona-aware system prompt).
- The auto-rotation effect listens to `ConsumerAIChatView`'s existing `onInitialMessageConsumed` callback plus a small "stream finished" signal we'll thread through via a new optional `onAssistantDone` prop (one-line addition, defaults to undefined so other call sites are unaffected).
- iPad frame styling stays consistent with the memory rule on iPad mockups (slate-300 border, rounded-[20px], inner scroll container).
- Strict light theme; no `dark:` utilities anywhere in the new files.
