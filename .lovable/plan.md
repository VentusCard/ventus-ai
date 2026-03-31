

## Update Module Card Descriptions

Each of the 4 module cards in the right column of the Demo Settings dialog will get a 3-line layout:

1. **Line 1** (existing label, no change)
2. **Line 2** (team name)
3. **Line 3** (question from the network diagram)

### Mapping

| Module | Team | Question |
|--------|------|----------|
| Ventus AI Customer Intelligence & Analytics | Transaction Analytics Team | Core transaction classification, spending analytics, and customer profiling |
| AI & UX | Banking Experience Team | How can we help our customers understand their spending? |
| Rewards | Rewards Team | How can we support and reward their lifestyle? |
| Relationship | Growth / Wealth Team | What's their next product to live a better life? |

### Changes

**File: `src/components/demo/DemoCustomerPanel.tsx`**

1. Update `MODULE_CONFIG` to add a `team` field to each entry and update descriptions:
   - Analytics: team = "Transaction Analytics Team", description stays as-is (no network diagram question for this one)
   - AI & UX: team = "Banking Experience Team", description = "How can we help our customers understand their spending?"
   - Rewards: team = "Rewards Team", description = "How can we support and reward their lifestyle?"
   - Relationship: team = "Growth / Wealth Team", description = "What's their next product to live a better life?"

2. Update the card render to show 3 lines:
   - Label (bold, existing)
   - Team name (small, muted, e.g. `text-[11px] text-slate-400`)
   - Question/description (small, italic or regular, `text-[12px] text-slate-500`)

