

## Split Phone View for "Next Conversation" Tab

### What Changes

**File: `src/components/exec-demo/ExecDemoPhoneView.tsx`** (~15 lines)

When `consumerTab === "relationship"`, instead of rendering just `DemoWealthView`, render a split layout:

- **Top half** (~50%): `DemoWealthView` (the existing relationship/wealth view from /deckmo) in a scrollable container with a subtle bottom border
- **Bottom half** (~50%): `ConsumerAIChatView` (the existing AI chatbot) in a flex container that handles its own scroll

The split only applies to the `relationship` tab — all other tabs remain unchanged.

### Layout

```text
┌──────────────────────┐
│      Status Bar      │
│      Header          │
├──────────────────────┤
│                      │
│   DemoWealthView     │  ← top 50%, overflow-y-auto
│   (Relationship)     │
│                      │
├─ thin divider ───────┤
│                      │
│  ConsumerAIChatView  │  ← bottom 50%, flex col
│   (AI Assistant)     │
│                      │
├──────────────────────┤
│     Tab Bar          │
│   Home Indicator     │
└──────────────────────┘
```

### Implementation Detail

In `renderContent()`, the `relationship` case returns a new wrapper div with `flex flex-col h-full`:
- Top: `<div className="flex-1 min-h-0 overflow-y-auto border-b">` containing `DemoWealthView`
- Bottom: `<div className="flex-1 min-h-0 overflow-hidden flex flex-col">` containing `ConsumerAIChatView`

The parent content div will use `overflow-hidden flex flex-col` (same treatment as the current `ai` tab) when `relationship` is active.

One file, ~15 lines changed.

