# Add "Growth Opportunities" sidebar section

Create a new left-menu group called **Growth Opportunities** and move the existing **Automated Flows** and **Campaign Builder** tabs into it.

## Menu structure after the change

```text
VENTUS AI
Customer Intelligence
  Customer Insights
  Risk Signals
  Ventus AI Dashboard
  Reports & Query
Personalization Orchestration
  Personalized Deals
  Next Product
  Personalized Relationship
Growth Opportunities
  Automated Flows
  Campaign Builder
```

## Technical notes

- Edit `NAV_GROUPS` in `src/components/tepilot/insights/AnalyticsContainer.tsx`: remove `targeting-automated-flows` and `targeting-campaign-builder` from the Personalization Orchestration group and add a new group after it with those two items (icons `Zap` and `Megaphone` unchanged).
- No tab values, routing cases, or deep links change, so existing links and cross-tab navigation keep working.
