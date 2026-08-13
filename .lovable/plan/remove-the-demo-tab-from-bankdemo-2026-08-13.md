# Remove the Demo tab from /bankdemo

The Demo tab inside /bankdemo currently mounts the full executive demo permanently and pre-fires the whole enrichment pipeline (classification, persona synthesis, offer generation, product cards, risk) the moment /bankdemo loads — even if nobody opens the tab. That work will be removed. The same demo stays fully available at `/demo`, unchanged.

## What changes

1. **Sidebar**: delete the "Demo" entry from the VENTUS AI nav group.
2. **Persistent mount**: remove the always-mounted `ExecDemoPage` block from the container, so no model calls fire from /bankdemo at all.
3. **Routing cleanup**: drop the `exec-demo` tab value and its no-op switch case; if a stale saved tab resolves to it, fall back to the Intelligence Dashboard.
4. **Customer View panels** (Personalized Deals / Product / Relationship): these read from the demo session store. With no in-app demo run they already fall back to the default demo customer and static mockup content. The "Run the demo" button, which pointed at the removed tab, becomes a link that opens `/demo` in a new tab.

## What does not change

- `/demo` (`ExecDemoPage` standalone route) keeps its selection dialog, full pipeline, and every downstream panel.
- No edge functions are deleted — `/demo` still calls them.
- Governance, System, and Context tabs are untouched.

## Technical notes

- `src/components/tepilot/insights/AnalyticsContainer.tsx`: remove the `ExecDemoPage` import, the `exec-demo` NAV_GROUPS item, the `case 'exec-demo'`, the `'exec-demo'` member of `TabValue`, and the persistent mount div.
- `src/components/tepilot/insights/CustomerMockupPanel.tsx`: replace the `onNavigate("exec-demo")` button with an anchor to `/demo`; drop the now-unused nav prop wiring if nothing else uses it.
- `ExecDemoPage`'s `prefireOnMount` prop becomes unused by the app; leave the prop in place (harmless) or remove it — either way `/demo` behavior is identical.
- Verify with a typecheck plus a browser pass on /bankdemo (no demo-related network calls on load) and /demo (pipeline still runs end to end).

## LLM audit of /bankdemo

Confirmed by tracing every `functions.invoke` call reachable from `AnalyticsContainer`:

- **Automatic on page load**: only the Demo tab's pre-fire chain — `synthesize-persona`, `analyze-lifestyle-signals`, `generate-next-offers`, `detect-risk-transactions`, `generate-product-cards`, `generate-product-actions`. Removing the tab and its persistent mount means /bankdemo makes **zero** model calls on load.
- **Still present, but only when a user explicitly acts**: Ask Ventus AI chat, Query console (`generate-analytics-query`) and its takeaway (`summarize-query-result`), campaign intent/brief (`parse-campaign-intent`, `generate-campaign-brief`), deal personalization preview (`deal-personalization`), and the AI assistant activity chat (`consumer-chat`). These are the product's own features, not demo pre-fire, so they stay unless you want them stripped too.
