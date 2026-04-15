

## Add life-event "How we can help" + advisor card to Relationship tab

### What
Replace the current AI Hooks section in `RelationshipPhoneView` with the life-event-driven card from `DemoWealthView` — the two-column layout with "How we can help" suggestions, CTAs, and the James Rivera advisor card. Keep the greeting, holdings grid, and tenure row.

### Changes

**File: `src/components/exec-demo/ExecDemoPhoneView.tsx`**
- Pass `detectedLifeEvents` through to `RelationshipPhoneView` as a new prop

**File: `src/components/exec-demo/RelationshipPhoneView.tsx`**
1. Add `detectedLifeEvents` prop (reuse the `LifeEvent` type)
2. Copy the `EVENT_META` map and `resolveEventMeta` logic from `DemoWealthView` — maps event names like "Education Funding" to icon, color, suggestions, and CTAs
3. Replace the "Insights for You" AI hooks section with the life event card:
   - Event header: icon + event name + description
   - Two-column grid below:
     - Left: "How we can help" with 3 bullet suggestions + 2 CTA buttons
     - Right: Advisor card — JR avatar, "James Rivera", "Senior Relationship Manager", personalized quote, Schedule + Message buttons
4. Scale down slightly for phone viewport (text sizes ~1-2px smaller than the iPad version to fit without scrolling)
5. If no detected events, show the first event from `EVENT_META` as a fallback (Education Funding) so the card always renders
6. Keep the `onGoToAI` prop — wire the "Message" button to it

### Layout (phone-sized)
```text
┌──────────────────────────┐
│ Welcome, Sarah           │
│ ● Preferred Member       │
├──────────────────────────┤
│ [Savings] [Credit]       │
│ [Mortgage][Investments]  │
│ ★ Member since 2018  📍 │
├──────────────────────────┤
│ 🎓 Education Funding     │
│ "Education is a big..."  │
│ ┌───────────┬──────────┐ │
│ │How we can │  JR      │ │
│ │help       │James R.  │ │
│ │• Edu svgs │"Hi Sarah"│ │
│ │• Flex pay │[Sched]   │ │
│ │• Scholar  │[Message] │ │
│ │[529][HY]  │          │ │
│ └───────────┴──────────┘ │
└──────────────────────────┘
```

Single-file logic change + one prop pass-through. No new components or edge functions.

