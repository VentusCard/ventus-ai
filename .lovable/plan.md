## Goal

In `NextConversationRationale` (the Relationship tab of the exec demo's right panel), the two CTA cells — **Open AI Assistant** (Regular Client row) and **Open WM Copilot** (Wealth Client row) — currently sit shorter than the neighboring Signal → Intent / Personalize / Orchestrate cards because the button has fixed `py-2` padding inside a vertically-centered cell. They should fill the row height. They should also reflect when their target assistant is already shown by displaying a subtle 'Open' badge while remaining clickable.

## Changes

### 1. `src/components/exec-demo/NextConversationRationale.tsx`

**a. Add new prop** to the component's props interface (around line 731):

```ts
assistantOpen?: boolean;       // AI Banking Assistant currently visible
wmCopilotOpen?: boolean;       // WM Copilot currently visible
```

Default both to `false` in the destructured args. (We'll wire `wmCopilotOpen` later if needed; for now `assistantOpen` is the one available.)

**b. Make CTA cells stretch to row height** — change the wrapper from `flex items-center` to `flex items-stretch` and make the button `h-full` so it visually matches the neighboring rounded cards' height. Apply at both call sites (lines ~931 and ~1000).

```tsx
<div className="min-w-0 flex items-stretch">
  <button
    onClick={onOpenAIAssistant}
    className="w-full h-full inline-flex items-center justify-between gap-1.5 text-[11px] font-bold rounded-lg px-2.5 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
  >
    <span className="inline-flex items-center gap-1.5">
      Open AI Assistant
      {assistantOpen && (
        <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider rounded-full bg-white/20 border border-white/40 px-1.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          Open
        </span>
      )}
    </span>
    <ArrowUpRight className="w-3.5 h-3.5" />
  </button>
</div>
```

Same pattern for the purple **Open WM Copilot** button, gated on `wmCopilotOpen`.

### 2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`

- Add `assistantOpen?: boolean` and `wmCopilotOpen?: boolean` to `ExecDemoIntelPanelProps` (near line 60 where `assistantOpen` is already declared — it's currently unused, just pass it through).
- In the `<NextConversationRationale ... />` render (line ~802), forward both: `assistantOpen={assistantOpen}` and `wmCopilotOpen={wmCopilotOpen}`.

### 3. `src/pages/ExecDemoPage.tsx`

- `assistantOpen={aiTabTrigger > 0}` is already passed (line 1219). Add a sibling prop `wmCopilotOpen={...}` if a similar piece of state exists for the WM Copilot overlay; if not, leave it `false` for now (the wealth CTA simply won't show the badge until that state lands).

## Visual result

- Both CTA buttons grow to span the full vertical height of their grid row, visually matching the three neighbor cards.
- When the Banking Assistant tab is currently being shown in the phone mockup, the blue **Open AI Assistant** button gains a small white-translucent pill containing a pulsing emerald dot and the word **Open**. The button remains fully clickable (clicking it still re-focuses the AI tab in the phone view).
- Same treatment for the purple WM Copilot button once its open-state signal is available.

## Out of scope

- Changing button colors, copy beyond adding the badge, or icon swaps.
- Restructuring the grid columns.
