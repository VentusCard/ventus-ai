# Merge into a single "Personalized Relationship" tab

Combine three sidebar tabs — Relationship Intelligence, AI Banking Assistant, and WM Coworker — into one tab called **Personalized Relationship**, following the same pattern already used for Personalized Deals.

## Result

Sidebar group "Personalization Orchestration" becomes:

```text
Personalized Deals
Automated Flows
Campaign Builder
Next Product
Personalized Relationship   <- new merged tab
```

Inside the new tab, one page header plus three stacked sections:

1. Relationship Intelligence — life events and household relationship signals
2. AI Banking Assistant — customer-facing assistant activity
3. WM Coworker — advisor/leadership coworker threads

## Technical notes

- New `PersonalizedRelationshipView.tsx` in `src/components/tepilot/insights/`, reusing the `Section` wrapper style from `PersonalizedDealsView.tsx`, with a single `TabHeader` at the top.
- It receives and forwards `userDemographics`, `lifestyleSignals`, and `onNavigate` to `RelationshipIntelligenceView`.
- Add a `hideHeader` prop to `RelationshipIntelligenceView`, `AIAssistantActivityView`, and `BankwideWMCopilotView` so their own `TabHeader` is suppressed when embedded (their standalone usage stays unchanged).
- In `AnalyticsContainer.tsx`: replace the three nav items with one `personalized-relationship` item; keep `life-events`, `ai-assistant-activity`, and `wm-copilot` as case aliases routing to the merged view so existing deep links and cross-tab navigation still work.
- Update `src/lib/ventusAiTabContext.ts` with a shared `PERSONALIZED_RELATIONSHIP_CONTEXT` mapped to all four keys, and refresh module lists in `VentusAIWelcomeView.tsx` and `VentusAIChatPanel.tsx`.
- Verify with a typecheck and a browser pass on `/bankdemo`.
