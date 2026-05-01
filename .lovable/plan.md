# Restructure Wealth column on Next-Conversation into 3 stacked sections

In `src/components/exec-demo/NextConversationRationale.tsx`, replace the right-hand "Wealth Client" column body with three equally-tall stacked sections (each ~1/3 of the available column height). This applies to **all pills** (life event, lifestyle, risk, segment, all) — content adapts to the selected signal but the layout stays the same.

## Layout (right column)

The column wrapper stays as-is (`pl-3 border-l border-slate-200 flex flex-col h-full`), keeping the existing purple header label at top and the "Open WM CoPilot" CTA at the bottom. The middle content area becomes a `flex-1 flex flex-col gap-2 min-h-0` container with three children, each `flex-1 basis-0 min-h-0 overflow-hidden` so they share height equally.

```text
┌─ Wealth Client ──────────────┐
│ [signal cards]      1/3      │
├──────────────────────────────┤
│ [prepped content]   1/3      │
├──────────────────────────────┤
│ [WM copilot chat]   1/3      │
├──────────────────────────────┤
│ [Open WM CoPilot button]     │
└──────────────────────────────┘
```

### 1. Signals (top 1/3)

Compact cards derived from the currently selected pill. Two cards per pill: a primary signal card + a corroborating card. Each card is a purple-bordered rounded-lg, `px-2 py-1.5`, with:
- Tiny icon (Lucide, mapped per signal kind: `Home`, `Baby`, `PiggyBank`, `Landmark` for life events; `Sparkles` for lifestyle; `ShieldAlert` for risk; `Users` for segment)
- Signal label (e.g. "Home Buyer", "Premium Traveler", "Liquidity Stress")
- Confidence % pill + urgency badge (Urgent=rose, Soon=amber, Upcoming=slate)
- One-line evidence in `text-[11px] italic text-slate-500`

Stacked vertically inside a `flex flex-col gap-1.5 overflow-y-auto h-full pr-1`.

### 2. Prepped Content (middle 1/3)

Two side-by-side sub-blocks inside `grid grid-cols-2 gap-2 h-full`, both internally scrollable:

- **Talking Points** — header `MessageSquare` + "Talking Points" (text-[11px] uppercase bold purple). 3 rows in `bg-slate-50 rounded-md px-2 py-1 text-xs text-slate-700`.
- **Next Steps Timeline** — header `CalendarCheck` + "Next Steps". Vertical dot-and-line timeline (read-only), 4 items: small purple dot + connector line, `when` in `text-[10px] font-semibold text-purple-700`, `action` in `text-xs text-slate-700`.

### 3. WM Copilot Chat (bottom 1/3)

Static, non-functional chat preview styled to mirror `VentusAIChatPanel`:
- Header row: small purple "V" avatar + "WM Copilot" (text-xs font-semibold text-purple-900) + "AI" pill
- Two stacked mock messages (signal-aware content):
  - Assistant bubble (left, `bg-purple-50 border border-purple-100 rounded-lg px-2 py-1.5 text-xs text-slate-700`)
  - User bubble (right, `bg-slate-100 rounded-lg px-2 py-1.5 text-xs text-slate-600 ml-auto max-w-[85%]`)
- Disabled-look input row at bottom: `border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-400 italic` showing "Ask WM Copilot…" + tiny send icon. Not interactive.

The existing "Open WM CoPilot" gradient button stays beneath this section as the actionable CTA (clicking it opens the real copilot).

## Static data per pill

A single `STATIC_WEALTH_PREVIEW` map keyed by playbook key (lowercased). Each entry contains:

```ts
{
  signals: [{ icon, label, confidence, urgency, evidence }, ...2],
  talkingPoints: [string, string, string],
  nextSteps: [{ when, action }, ...4],
  chatPreview: { assistant: string, user: string },
}
```

Authored entries cover the existing playbook keys used by the rationale view (home buyer, new parent, retirement, wealth transfer, premium traveler, dining enthusiast, liquidity risk, gambling risk, mass affluent, etc.) plus a generic fallback used when no key matches. Selection logic mirrors the existing `playbook` lookup already in this file — no new prop wiring.

## Behavior

- Layout is identical for every pill; only the populated content changes.
- Switching pills swaps all three sections at once.
- Left "Regular Client" column is unchanged.
- The current dynamic `Advisor brief` paragraph and `matchedActions` action pills in the right column are removed (replaced by the three new sections). Helper logic that derived `matchedActions`, `wowActions`, `standardActions` from the playbook is removed if no longer used elsewhere in this file.
- No new props, no parent rewiring, no backend calls. Chat is purely visual mock.

## Files to change

- `src/components/exec-demo/NextConversationRationale.tsx` — add `STATIC_WEALTH_PREVIEW` map, replace right-column body with the 3-section equal-height layout, remove the now-unused advisor-brief block and action-pill derivation.

## Out of scope

- Wiring the chat input to a real LLM.
- Changes to the left "Regular Client" column.
- Changes to other tabs (Next-Offer, Next-Product) or to `ExecDemoIntelPanel`.
- New files or parent component changes.
