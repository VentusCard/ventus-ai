

## Restructure Demo Diagram: 5 Nodes → 6 Nodes in 3 Sections

The user wants exactly 6 nodes, grouped into 3 labeled sections of 2 each:

```text
Section 1: UX & Analytics
  ├── Customer Engagement
  └── Bank-Wide Analytics

Section 2: Personalized Rewards
  ├── Consumer Rewards
  └── Travel Experiences

Section 3: Life Cycle Intelligence
  ├── Life Event Detection Dashboard  (NEW)
  └── Wealth Management Copilot
```

### Files to Modify

**1. `src/components/demo/DemoNetworkDiagram.tsx`**
- Update `DemoNodeType` to 6 values: `"engagement" | "analytics" | "rewards" | "travel" | "lifeEvents" | "wealth"`
- Restructure `NODES` array into 3 sections with 2 nodes each, adding section header labels and a new `lifeEvents` node (icon: `CalendarHeart` or `Activity`)
- Add section group labels rendered as small uppercase text above each pair of nodes on the right side
- Adjust vertical spacing for 6 nodes + 3 section headers
- Update connector line rendering for 6 output paths

**2. `src/hooks/useDemoEnrichment.ts`**
- Add `lifeEvents` to `INITIAL_READINESS` and `NodeReadiness` type
- Mark `lifeEvents` as processing/ready alongside the lifestyle signals phase (it maps to the same enrichment data)

**3. `src/components/demo/DemoDetailOverlay.tsx`**
- Add `lifeEvents` entry to `NODE_TITLES` and routing logic
- Create or import a `DemoLifeEventsView` component for the overlay content

**4. New file: `src/components/demo/DemoLifeEventsView.tsx`**
- Side-by-side view showing detected life events per customer (derived from enriched transaction patterns — e.g., "New Home", "New Baby", "Career Change")
- Use existing lifestyle signal data from enrichment to populate event cards
- Follow the same A/B comparison layout as other demo views

### Visual Layout (Right Side of Diagram)

```text
  UX & ANALYTICS ──────────────
  [📱 Customer Engagement     ]
  [📊 Bank-Wide Analytics     ]

  PERSONALIZED REWARDS ────────
  [🎁 Consumer Rewards        ]
  [✈️ Travel Experiences      ]

  LIFE CYCLE INTELLIGENCE ─────
  [📅 Life Event Detection    ]
  [📈 Wealth Management       ]
```

Each section header is a small blue uppercase label. Node buttons remain clickable with the same readiness states.

