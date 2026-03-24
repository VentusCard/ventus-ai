

## Plan: Add WM CoPilot as a Bank-Facing Node Below Financial Journey

### Approach
Add `wmCopilot` as a 3rd bank-facing node in the 3rd pillar row (Phase), stacked below "Life Event Intelligence" and "Financial Journey". This requires adjusting the layout to support 3 bank nodes in that row.

### Changes

**1. `src/components/demo/DemoNetworkDiagram.tsx`**
- Add `"wmCopilot"` to `DemoNodeType` union
- Add a 3rd entry to the Phase row's `bankNodes` array: `{ id: "wmCopilot", label: "WM CoPilot", icon: Briefcase, color: "#7c3aed", audience: "bank" }`
- Import `Briefcase` from lucide-react
- The existing rendering loop already iterates `pillar.bankNodes` dynamically, so adding a 3rd node will auto-render it — but the fixed `BANK_NODE_HEIGHT * 2 + BANK_NODE_GAP` calculation needs to become dynamic: `BANK_NODE_HEIGHT * pillar.bankNodes.length + BANK_NODE_GAP * (pillar.bankNodes.length - 1)`
- The SVG connection lines from engine→bank and bank→consumer also iterate dynamically, so they'll auto-include the new node

**2. `src/hooks/useDemoEnrichment.ts`**
- Add `wmCopilot: "idle"` to `INITIAL_READINESS`
- Add `"wmCopilot"` to `PERIPHERAL_NODES` array

**3. `src/components/demo/DemoDetailOverlay.tsx`**
- Add `wmCopilot` to `NODE_TITLES`: `{ title: "Wealth Management CoPilot", color: "#7c3aed" }`
- Add render case: `if (node === "wmCopilot") return <BankwideWMCopilotView />`
- Add `"wmCopilot"` to `BANK_WIDE_NODES` set (so it gets full-width layout, no customer A/B headers)
- Import `BankwideWMCopilotView`

**4. `src/pages/DemoPage.tsx`**
- Add `"wmCopilot"` to `NODE_ORDER` array (after `"wealth"`)

### Files modified
- `src/components/demo/DemoNetworkDiagram.tsx`
- `src/components/demo/DemoDetailOverlay.tsx`
- `src/hooks/useDemoEnrichment.ts`
- `src/pages/DemoPage.tsx`

