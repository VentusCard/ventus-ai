

## Ventus AI Floating Chat — Available on Non-Home Tabs

### Approach
Keep the "Ventus AI" sidebar tab and welcome view as-is. Add a floating "V" button + slide-out chat panel that only appears when the user is on any tab **other than** `ventus-ai`.

### Changes

**`src/components/tepilot/insights/AnalyticsContainer.tsx`**
1. Add `chatOpen` state (`useState(false)`)
2. In the content area wrapper, make it `relative` and add:
   - A floating "V" button (`absolute top-3 right-3 z-20`) — only rendered when `activeTab !== 'ventus-ai'`
   - Clicking toggles `chatOpen`
3. Next to the content `<div>`, conditionally render `<VentusAIChatPanel>` when `chatOpen && activeTab !== 'ventus-ai'`
   - Same width as sidebar: `w-[240px]`, full height, border-left
   - Pass `activeTab` and `onClose` props
4. Auto-close chat when user navigates to `ventus-ai` tab

**`src/components/tepilot/insights/VentusAIChatPanel.tsx`** (new file)
- Slim right-side chat panel:
  - Header: "Ventus AI" + close button
  - Pre-set quick action chips for bank leaders: "Top risks today", "Revenue opportunities", "Fastest growing segments", "Outflow summary", "Life event alerts", "Campaign recommendations"
  - Chat messages with markdown rendering (ReactMarkdown)
  - Input bar at bottom
  - Uses `useAdvisorChat` with bank-wide platform context (reuse `PLATFORM_CONTEXT` pattern from VentusAIWelcomeView)
  - Receives `activeTab` prop so AI knows which module the user is viewing

### Layout when chat is open
```text
┌──────────┬─────────────────────────[V]┬──────────┐
│ Sidebar  │      Content Area          │  Chat    │
│  240px   │                            │  240px   │
└──────────┴────────────────────────────┴──────────┘
```

The floating button and chat panel are hidden when the user is on the Ventus AI home tab.

