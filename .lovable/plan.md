

## Next Conversation Intel Panel: Regular vs Wealth Split View

### What We're Building
Replace the static `IntelCardContent` in the "Next Conversation" tab with a side-by-side comparison showing two engagement strategies, populated with actual capabilities from the codebase.

### Design

```text
┌─────────────────────────────────────────────┐
│  Next Conversation Strategy                 │
├──────────────────────┬──────────────────────┤
│  👤 REGULAR CLIENTS  │  💎 WEALTH CLIENTS   │
│  Scalable · Digital  │  High-Touch · Advised │
│                      │                      │
│  AI Chatbot          │  WM Copilot          │
│  · Spending Q&A      │  · Client psychology  │
│  · Budget alerts     │  · Meeting prep briefs│
│  · Product discovery │  · Financial timeline │
│                      │                      │
│  Automated Flows     │  Assisted Engagement  │
│  · New Parent →      │  · Life event calls   │
│    529 Plan nudge    │  · Portfolio review    │
│  · Home Buyer →      │  · Tax planning       │
│    Mortgage offer    │    consultation       │
│  · Travel threshold  │  · Estate strategy    │
│    → Card upgrade    │    advisory           │
│                      │                      │
│  Campaign Engine     │  Advisor Actions      │
│  · Life event flows  │  · Follow-up emails   │
│  · Lifestyle cohorts │  · Transcript analysis│
│  · Cross-sell auto   │  · Psychological      │
│                      │    profiling          │
└──────────────────────┴──────────────────────┘
```

### Content Sources (from codebase)

**Regular Clients** — drawn from `AutomatedFlowsSection.tsx` + `segmentData.ts`:
- AI Chatbot (consumer chat): spending Q&A, budget alerts, product discovery
- Automated Flows: New Parents → 529 plan, Home Buyers → mortgage pre-approval, Travel threshold → card upgrade, Pre-Retirees → wealth suite, Cross-sell triggers (cashback→travel card)
- Campaign Engine: life event targeting, lifestyle cohort campaigns, personalized creative briefs

**Wealth Clients** — drawn from `AdvisorConsole` + `VentusChatPanel` + `ActionWorkspacePanel`:
- WM Copilot: AI-powered advisor chat, client psychology profiling, financial timeline projections, meeting notes analysis
- Assisted Engagement: life event preparation, portfolio reviews, tax planning consultations, estate strategy
- Advisor Actions: follow-up email generation, action item checklists, transcript insights, next meeting scheduling

### Technical Details

**New file:** `src/components/exec-demo/NextConversationRationale.tsx`
- Two-column layout with blue accent (left/regular) and purple accent (right/wealth)
- Each column has 3 capability sections with icon, title, and 3 bullet points
- Entrance animation consistent with other tab content
- No persona dependency needed — content is static comparison

**Edit:** `src/components/exec-demo/ExecDemoIntelPanel.tsx` (line 374-375)
- Replace `<IntelCardContent card={intelligence.relationship} />` with `<NextConversationRationale />`
- Add import for new component

