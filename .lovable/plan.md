

## Redesign Relationship Tab: Compact Card + AI Hooks

### What Changes

The relationship tab in `ExecDemoPhoneView` currently renders the full `DemoWealthView` + full `ConsumerAIChatView` in a 50/50 split. This is too dense for a phone mockup. The redesign:

**Top half** — A new compact relationship summary card with:
- Greeting + segment badge
- 4-item financial snapshot (deposits, credit, mortgage, investments) — same data, tighter layout
- Relationship tenure + branch info (one line)
- Wellness score mini-ring

**Bottom half** — AI hook section titled "Insights for You" with 2-3 tappable insight cards that act as teasers. Each card has an icon, a short insight/tip, and a "Chat with AI →" affordance. Clicking any card switches to the "AI" tab. Example hooks:
- "Your savings rate is trending up 12% — want to optimize further?"
- "You have a milestone coming up. Let's plan together."
- "Your spending patterns suggest a travel card could save you $400/yr."

### Files

**1. New: `src/components/exec-demo/RelationshipPhoneView.tsx`**

A self-contained component for the relationship tab:
- Accepts `customer: DemoCustomer` and `onGoToAI: () => void`
- Top section: compact card pulling from `customer.profile.holdings`, tenure, segment
- Bottom section: 2-3 styled insight hook cards, each with `onClick={onGoToAI}`
- Hooks are derived from customer data (holdings, segment, deals) — static but contextual

**2. Update: `src/components/exec-demo/ExecDemoPhoneView.tsx`**

- Import `RelationshipPhoneView`
- Add internal state or callback to switch `consumerTab` to `"ai"` 
- In the `relationship` case, render `<RelationshipPhoneView customer={customer} onGoToAI={() => setConsumerTab("ai")} />`
- Add `consumerTab` as local state initialized from `activeTab` prop, so clicking a hook can switch to the AI tab within the phone

### Layout (phone mockup, 340×660)

```text
┌──────────────────────┐
│  Welcome, Sarah      │
│  ● Premium Member    │
├──────────────────────┤
│  💰 Savings  $45K    │
│  💳 Credit   $12K    │  Compact 2×2 grid
│  🏠 Mortgage $280K   │
│  📈 Invest   $95K    │
├──────────────────────┤
│  ⭐ Member since 2018 │
│  📍 TCBY Westfield   │
│  Wellness: 78 ●●●    │
├──────────────────────┤
│                      │
│  ✨ Insights for You  │
│                      │
│  ┌────────────────┐  │
│  │ 📈 Your savings │  │
│  │ rate is up 12%  │  │
│  │ Chat with AI → │  │
│  └────────────────┘  │
│  ┌────────────────┐  │
│  │ 🎓 Milestone    │  │
│  │ ahead — plan?   │  │
│  │ Chat with AI → │  │
│  └────────────────┘  │
│  ┌────────────────┐  │
│  │ ✈️ A travel card │  │
│  │ could save $400 │  │
│  │ Chat with AI → │  │
│  └────────────────┘  │
└──────────────────────┘
```

### Key Details

- The hooks feel like smart nudges, not ads — consistent with the Ventus thesis
- Clicking any hook transitions the phone to the full AI chatbot tab
- `consumerTab` becomes local state in `ExecDemoPhoneView`, initialized from `TAB_MAP[activeTab]`, so the phone can internally navigate
- The bottom tab bar highlights "AI" when the user clicks through
- No edge function needed — hooks are derived from existing customer data

Two files total: one new component, one updated.

