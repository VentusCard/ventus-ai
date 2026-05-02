# Redesign Next Conversation Tab — Advisor Brief Panel

## Scope

The Next Conversation tab lives at `/demo` (which renders `ExecDemoPage`). The existing intelligence pills (Spending Habits / Life Event Detection / Risk Factors) are rendered by `ExecDemoIntelPanel` above the tab content. The body of the relationship tab is rendered by `NextConversationRationale`, which today shows the "AI Native Intelligence Layer" + "Personalized Engagement Orchestration" two-row workflow card. The right-side phone/chat column is rendered separately by `ExecDemoPage` and stays untouched.

This change:
1. Keeps the header "3.3 Shared Customer Intelligence" + subtitle (already wired in `ExecDemoIntelPanel`).
2. Keeps the three top tabs Next-Offer / Next-Product / Next Conversation (already wired).
3. Keeps all intelligence pills exactly as they are (they live above the tab content, in `ExecDemoIntelPanel`, not inside `NextConversationRationale`).
4. Keeps the right-side mobile chat UI exactly as it is (rendered as Col 3 in `ExecDemoPage`, independent of this component).
5. **Replaces the entire body of `NextConversationRationale`** with a new Advisor Brief Panel that updates dynamically based on the currently selected pill / signal.
6. Default selected pill becomes "College Preparation for Dependent" when the relationship tab opens (and that life event exists).

No layout change is needed in `ExecDemoIntelPanel` or `ExecDemoPage` — pills + tab bar + phone column already sit outside `NextConversationRationale`. The redesign is contained to the tab body.

## Files to modify

- `src/components/exec-demo/NextConversationRationale.tsx` — replace render body with the new Advisor Brief Panel. Keep the existing prop signature (`selectedSignal`, `availableSignals`, `productCards`, `customerFirstName`, `onOpenAIAssistant`, `onOpenWMCopilot`, `assistantOpen`) so no parent changes are required. Remove the unused `ContextPillRows`, `CONTEXT_ROWS`, and the orchestration two-row article block. Remove the `wmCopilotOpen` and `actionsLoading` rendering paths that will no longer be referenced (props can stay accepted for backwards compatibility but unused).
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — small change only: when `activeTab === "relationship"` and no `selectedSignal` is set yet, default-select the "College Preparation for Dependent" signal (if present in `availableSignals`); otherwise fall back to the first available signal. This mirrors the existing auto-select logic already used for the Next-Offer tab.

## New body structure (inside `NextConversationRationale`)

Single card, full height of the tab content area, scrollable internally.

```text
┌───────────────────────────────────────────────────────────┐
│ College Preparation for Dependent — detected today        │  ← small label row
├───────────────────────────────────────────────────────────┤
│ VENTUS AI INSIGHT                                         │
│ 2-3 sentence paragraph                                    │
│                                                           │
│ TALKING POINTS                                            │
│ • bullet                                                  │
│ • bullet                                                  │
│ • bullet                                                  │
│                                                           │
│ NEXT STEPS                                                │
│ • bullet                                                  │
│ • bullet                                                  │
│ • bullet                                                  │
│                                                           │
│ RECOMMENDED PRODUCTS                                      │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                 │
│ │ Product 1 │ │ Product 2 │ │ Product 3 │                 │
│ │ desc      │ │ desc      │ │ desc      │                 │
│ │ Learn More│ │ Learn More│ │ Learn More│                 │
│ └───────────┘ └───────────┘ └───────────┘                 │
└───────────────────────────────────────────────────────────┘
```

Styling: white background, `border border-slate-200`, `rounded-xl`, padding ~`p-5`, section labels in uppercase tracking-wider 11px slate-500 font-bold; body text ~13px slate-700; product cards small with `border border-slate-200 rounded-lg p-3` and a subtle ghost-style "Learn More" button.

## Brief content map

A typed `BRIEF_LIBRARY` constant inside `NextConversationRationale.tsx`, keyed by canonical signal label, with the schema:

```ts
type Brief = {
  insight: string;            // 2-3 sentences
  talkingPoints: string[];    // 3 bullets
  nextSteps: string[];        // 3 bullets
  products: { name: string; description: string }[]; // 3 cards
};
```

Entries explicitly authored from the user's spec for:
- "College Preparation for Dependent" (default)
- "Home Purchase Planning"
- "Gambling"
- "Financial Vulnerability"
- "Annual Hawaiian Vacations"
- "Seasonal Ski Trips"
- "Subscription Pet Care Routine"

Resolution order when a pill is clicked:
1. Exact match on `selectedSignal.label` in `BRIEF_LIBRARY`.
2. Case-insensitive substring match (e.g. "college" → College brief, "gambling" → Gambling brief, "vacation"/"hawaii" → Hawaii brief, "ski" → Ski brief, "pet" → Pet brief, "vulnerab" → Vulnerability brief, "home" / "mortgage" → Home brief).
3. Kind-aware fallback:
   - `kind === "risk"` → generic sensitive financial-wellness brief.
   - `kind === "lifeEvent"` → generic life-event brief.
   - `kind === "lifestyle"` → generic lifestyle brief built from the pill label (uses label in insight + generic talking points).
4. `kind === "all"` (no specific signal) → render a small "Select a signal pill above to see the advisor brief" empty state.

Detected-time label: derived from `selectedSignal` metadata if available, otherwise "detected today". For risk and life-event signals we already have evidence transactions in scope but to keep this change contained the label simply reads "detected today" unless we extend the prop later.

## Default signal selection

In `ExecDemoIntelPanel.tsx`, alongside the existing first-rollup auto-select, add a one-time effect for the relationship tab:

```ts
// when activeTab becomes "relationship" and selectedSignal is null,
// pick the College Prep life event if present, else first availableSignal
useEffect(() => {
  if (activeTab !== "relationship" || selectedSignal) return;
  const college = availableSignals.find(s =>
    /college/i.test(s.label) && s.kind === "lifeEvent"
  );
  setSelectedSignal(college ?? availableSignals[0] ?? null);
}, [activeTab, availableSignals, selectedSignal]);
```

This makes the default highlighted/active pill "College Preparation for Dependent" when the tab opens, matching the spec.

## What is removed

Inside `NextConversationRationale.tsx`:
- The `CONTEXT_ROWS` array and `ContextPillRows` component (the "Inputs / Capabilities / Out of Scope / Routes To" band).
- The "AI Native Intelligence Layer" header.
- The "Personalized Engagement Orchestration" header and the two stacked workflow articles (Regular Client + Wealth Client cards with Signal → Intent → Personalize → Orchestrate flow and the Open AI Assistant / Open WM Copilot CTAs).
- The orchestration roll-up "all signals" list view (replaced by the empty-state described above).

## What is preserved

- Existing pill rendering and click behavior in `ExecDemoIntelPanel` (no edits to the pills section).
- Header "3.3 Shared Customer Intelligence" and subtitle.
- Three top tabs and their switching logic.
- The right-side phone / mobile chat column rendered by `ExecDemoPage`.
- Pill colors and styles.
- `NextConversationRationale` component name, file location, default export, and prop signature so all call sites continue to compile.

## Out of scope

- No backend / edge-function changes.
- No changes to the phone view, the AI assistant chat, or the WM Copilot.
- No new API calls; brief content is fully static client-side data.
