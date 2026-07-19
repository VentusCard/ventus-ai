## Compile intel pills into a single row on the "Next" tabs; grey Financial + Risk on Next-Offer

Scoped entirely to `src/components/exec-demo/ExecDemoIntelPanel.tsx`, only the collapsed layout used when a Next-* tab is active (`isCollapsed = !pillsExpanded && !!activeTab`). Fully expanded panel (used when no tab is active or the user opens the "expand pills" toggle) keeps today's 5-header layout unchanged.

### Behavior

When `isCollapsed` is true (any Next-* tab open):

1. **Drop the 5 section headers** (`Spending Habits`, `Life Event Detection`, `Financial Signals`, `Demographic`, `Risk Factors`) and their `w-[140px]` label column + tooltip trigger for the collapsed layout.
2. **Render one unified pill strip** that concatenates, in this order:
   - Spending habit rollup pills (`rollupPills`)
   - Life event pills (`lifeEventPills`)
   - Financial signal pills (`finSignals.map(...)`)
   - Demographic pills (`demoShifts.map(...)`)
   - Risk pills (`riskPills`)
   Same `flex flex-nowrap gap-2.5 overflow-x-auto exec-light-scroll py-0.5` container so it scrolls horizontally the way each individual row does today.
3. **Per-tab treatment**
   - `activeTab === "analytics"` (Next-Offer): financial and risk pills render greyed/disabled (same treatment already applied to risk via `riskPillsMuted` — slate border, grey text, `grayscale(1)`, reduced opacity, `pointer-events-none`, `✕` marker, and tooltip title `"Not applicable for offer targeting"`). Introduce a parallel `financialPillsMuted = activeTab === "analytics"` and apply the identical style block to the financial-signal pill span (skip the violet `Ext` badge tooltip when muted).
   - `activeTab === "product"` (Next-Product) and `activeTab === "relationship"` (Next-Conversation): all five families render in their current active/clickable styling. No muting.
4. **Empty families** (e.g. no financial signals detected, no life events) simply contribute zero pills — no placeholder, no empty section.

### Out of scope

- Expanded view (`pillsExpanded` or no active tab) — keeps the five labeled rows exactly as today.
- Any downstream offer/product/conversation generator payloads — no backend or edge-function changes.
- Click routing (`onTriggerPillClick`, AI prompt dispatch on Next-Conversation) — unchanged for the pill families that stay active.

### Implementation sketch

- Extract the current `finSignals` and `demoShifts` render blocks (lines ~1069-1122 and ~1153-1207) into memoized `financialPills` and `demographicPills` arrays alongside the existing `rollupPills` / `lifeEventPills` / `riskPills` (lines ~767-992).
- Thread a `financialPillsMuted` boolean into the financial pill span mirroring the existing `riskPillsMuted` styling.
- Replace the five `<div className="flex items-center gap-3 …">` header-row wrappers (lines ~1004-1233) with a single conditional:
  - `isCollapsed` → one `<div className={pillRowClass}>{[...rollupPills, ...lifeEventPills, ...financialPills, ...demographicPills, riskPills].flat()}</div>`
  - else → today's five labeled rows unchanged.