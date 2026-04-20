## Goal

Update the dynamic header subtitles for the three executive demo tabs to include the business outcome (LTV, AUM, retention).

## Updated copy


| Tab                                | Title (bold)                 | Subtitle (gray)                                            |
| ---------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| `analytics` (Next-Offer)           | Curated Deal Collections     | Persona-fit deals lift engagement and grow customer LTV    |
| `product` (Next-Product)           | Next Financial Product       | Behavioral signals surface the right product to grow AUM   |
| `relationship` (Next-Conversation) | Shared Customer Intelligence | Retail insights empower wealth managers to boost retention |


Default (no tab selected) stays: **Behavioral Intelligence: Personas = Multi-category spending patterns**

## Plan

### `src/components/exec-demo/ExecDemoIntelPanel.tsx` (~line 367)

Replace the hardcoded `<p>` header with an `activeTab`-driven lookup:

```tsx
const headerCopy = (() => {
  switch (activeTab) {
    case "analytics":
      return { title: "Curated Deal Collections", sub: "Persona-fit deals lift engagement and grow customer LTV" };
    case "product":
      return { title: "Next Financial Product", sub: "Behavioral signals surface the right product to grow AUM" };
    case "relationship":
      return { title: "Shared Customer Intelligence", sub: "Retail insights empower wealth managers to boost retention" };
    default:
      return { title: "Behavioral Intelligence", sub: "Personas = Multi-category spending patterns" };
  }
})();

<p className="font-bold text-slate-800 mb-1.5 text-lg">
  {headerCopy.title}: <span className="text-slate-500 font-semibold">{headerCopy.sub}</span>
</p>
```

No other files touched. No layout/animation changes.

## Verification

- /demo → run a customer → click each of the three tabs → header shows new outcome-focused subtitle (LTV / AUM / retention).