## Goal

Add section numbering to the remaining intelligence panel headings to match the "1. Semantic Enrichment" prefix already added.

## Numbering scheme

- **1. Semantic Enrichment** — already done (the enrichment table heading)
- **2. Behavioral Intelligence** — the persona/rollup heading shown when no tab is active
- **3.1 Curated Deal Collections** — Next-Offer tab (`activeTab === "analytics"`)
- **3.2 Next Financial Product** — Next-Product tab (`activeTab === "product"`)
- **3.3 Shared Customer Intelligence** — Relationship tab (`activeTab === "relationship"`)

## Change

**File:** `src/components/exec-demo/ExecDemoIntelPanel.tsx` (lines 391–402)

Update the `headerCopy` object inside the rollup section heading so each branch's `title` carries the numeric prefix.

```tsx
const headerCopy =
  activeTab === "analytics"
    ? { title: "3.1 Curated Deal Collections", sub: "Persona-fit deals lift engagement and grow customer LTV" }
    : activeTab === "product"
    ? { title: "3.2 Next Financial Product", sub: "Behavioral signals surface the right product to grow AUM" }
    : activeTab === "relationship"
    ? { title: "3.3 Shared Customer Intelligence", sub: "Retail insights empower wealth managers to boost retention" }
    : { title: "2. Behavioral Intelligence", sub: "Personas = Multi-category spending patterns" };
```

No other files affected.