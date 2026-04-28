## Revert panel titles and button to original semantic names

The recent edits replaced "Semantic Enrichment" / "Behavioral Intelligence" with "AI Customer Intelligence for Banks" in the executive demo's Intelligence Panel and Ready button. Revert each occurrence to its original phrasing.

### Changes

**1. `src/components/exec-demo/ExecDemoIntelPanel.tsx`**

- Line 399 — Panel 2 header (persona view default):
  - From: `{ title: "2. AI Customer Intelligence for Banks", sub: "Personas = Multi-category spending patterns" }`
  - To: `{ title: "2. Behavioral Intelligence", sub: "Personas = Multi-category spending patterns" }`

- Line 705 — Panel 1 header (enrichment view):
  - From: `1. AI Customer Intelligence for Banks: <span ...>Source and format agnostic enrichment to gain a full picture</span>`
  - To: `1. Semantic Enrichment: <span ...>Source and format agnostic enrichment to gain a full picture</span>`

- Line 849 — "Ready" CTA button label:
  - From: `<span>AI Customer Intelligence for Banks:</span>`
  - To: `<span>Semantic Enrichment:</span>`

**2. `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`** (line 175 — table header that mirrors panel 1)

- From: `AI Customer Intelligence Infrastructure for Banks <span ...>· AI-labeled semantic intelligence</span>`
- To: `Semantic Enrichment <span ...>· AI-labeled semantic intelligence</span>`

### Not changed

- `src/pages/ExecDemoPage.tsx` (gate tagline + bullets) and `ExecDemoSelectionDialog.tsx` / `ExecDemoLeftPanel.tsx` already say "Semantic Enrichment" / "Behavioral Intelligence" — no change needed.