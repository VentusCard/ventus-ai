## Redesign Membership tab: Financial Wellness Dashboard + AI Tip Card

### What

Replace the current Membership tab content (holdings grid + advisor card) with a compact financial wellness dashboard and an AI-powered financial tip card that connects to the existing AI chatbot tab.

### Layout

```text
┌──────────────────────────────┐
│ Welcome, Sarah               │
│ ● Preferred Member Since 2018│
├──────────────────────────────┤
│ Total Relationship    $380K  │
│ ▓▓▓▓▓▓░░░░ segmented bar    │
│ 💰Savings 💳Credit 🏠Mort 📈Inv│
├──────────────────────────────┤
│ Financial Wellness     82/100│
│ ● On-time payments      ✓   │
│ ● Emergency fund         ✓   │
│ ● Debt-to-income ratio   ⚠   │
│ ● Savings momentum       ✓   │
├──────────────────────────────┤
│ (JR) James Rivera            │
│ "Major milestone ahead?"     │
│ [Schedule] [Message]         
_________________________________
│ 💡 Smart Financial Tip       │
│ "Pay off your credit card    │
│  balance early to save $47"  │
│ [Got it ✓] [Need help ⚠]    │
│ ─ or ─                       │
│ [💬 Ask AI about this]       ││
└──────────────────────────────┘
```

### Design Details

1. **Header** — Keep existing greeting + segment badge (unchanged)
2. **Total Relationship** — Parse dollar strings from `customer.profile.holdings`, sum them, display with a thin segmented color bar showing proportional split across Savings/Credit/Mortgage/Investments
3. **Financial Wellness Score** — A computed score (0-100) displayed as a circular or linear progress indicator. Four checklist items derived from holdings data:
  - On-time payments (always positive for demo)
  - Emergency fund status (based on savings amount)
  - Debt-to-income ratio (based on credit vs savings)
  - Savings momentum (always positive for demo)
4. **Advisor Card** — Keep the existing James Rivera card at bottom (unchanged)
5. **AI Financial Tip Card** — Inline version of the existing `FinancialTipCard` logic (reuse `generateFinancialTip` from `wellnessIntelligenceEngine.ts`). Two response buttons: "Got it" and "Need help". Both navigate to the AI tab (`onGoToAI`) with context about the tip and the user's response, so the chatbot continues the conversation

### Changes

**File: `src/components/exec-demo/RelationshipPhoneView.tsx**`

- Import `generateFinancialTip` from `wellnessIntelligenceEngine`
- Add helper to parse `$XX,XXX` strings and sum holdings
- Add wellness score computation (simple deterministic formula from holdings)
- Replace the 2×2 holdings grid with:
  - Total relationship value + segmented bar
  - Wellness score with 4 status items
  - Inline financial tip with two CTA buttons that call `onGoToAI` with tip context
- Keep advisor card at bottom
- Remove the "Member since 2018" / branch row (already in header badge)

Single file change. Uses existing `generateFinancialTip`, existing `onGoToAI` prop to connect to the AI chatbot tab.