

## Plan: Keep Only High-Affinity Financial Upsell Automations

### What Changes

Filter `AutomatedFlowsSection` to only show templates where there's a clear, compelling product upsell reason.

**Keep (9 templates):**

| Template | Upsell Product | Why It's Strong |
|----------|---------------|-----------------|
| New Parents | High-Yield Savings | New expenses → savings vehicle |
| Pre-Retirees | Wealth Suite | Retirement planning → wealth mgmt |
| Home Buyers | Mortgage | Home signals → mortgage product |
| Travel Enthusiasts | Travel Card | Heavy travel spend → travel rewards |
| Food & Dining | Rewards Card | Dining spend → dining multiplier card |
| Cashback → Travel | Travel Card | Already spending on travel without travel card |
| Travel → Hotel | Premium Card | Hotel spend without premium benefits |
| Premium Upgrade | Premium Card | High spend on basic card → upgrade |
| Holiday Travelers | Travel Card | Seasonal travel spike → travel card if they lack one |

**Remove (4 templates):**
- **Back-to-School** — cashback is generic, no specific product fit
- **Fitness & Wellness** — cashback is generic
- **Pet Parents** — cashback is generic
- **Tax Season** — wealth suite is a stretch from tax prep spend

### Implementation

**`src/components/tepilot/campaigns/AutomatedFlowsSection.tsx`**:
- Add an allowlist of 9 template IDs
- Filter `SEGMENT_TEMPLATES` through it in `filteredTemplates` memo
- Remove `seasonal` from category filter since only Holiday Travelers remains — recategorize it as `lifestyle` or keep seasonal with just that one entry
- Update badge counts accordingly
- Clean up the `SIGNAL_CATEGORIES`, `getDefaultAudienceFilters`, and other template-specific maps by removing the 4 dropped IDs

