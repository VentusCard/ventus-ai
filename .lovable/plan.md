

## Plan: Add left feature-card sidebar to consumer iPad overlay

### Layout
Replace the current centered iPad layout with a seamless two-column flex row:
- **Left (~25% width)**: Feature cards for the active tab, no divider/border
- **Right (~75%)**: iPad frame shifted right

### Feature cards per tab

Each tab shows a "Core Analytics" card (always) plus the tab's pillar row bank nodes:

| Tab | Left panel cards |
|-----|-----------------|
| **UX** | Core Analytics + Multi-Category Lifestyle Pillars, Outflow & Subscription Analysis, AI Financial Insights |
| **Rewards** | Core Analytics + Next-Purchase Intelligence, Travel & Perk Aggregation, Deep Personalization |
| **Relationship** | Core Analytics + Life Event Detection, Next-Product Automation, Advisor CoPilot Suite |
| **AI** | Core Analytics (single card) |

Cards use the **same visual style** as the network diagram bank node buttons: `rounded-lg`, `border-l-[3px]` accent, icon badge with colored background, gradient bg, label text.

### File changes

**`src/components/demo/DemoDetailOverlay.tsx`**

1. Extract `PILLAR_ROWS` data — import it from `DemoNetworkDiagram.tsx` (export the constant) or duplicate the minimal card metadata inline

2. Define `TAB_CARD_MAP`:
   - `ux` → PILLAR_ROWS[0].bankNodes (blue/Experience)
   - `rewards` → PILLAR_ROWS[1].bankNodes (green/Rewards)
   - `relationship` → PILLAR_ROWS[2].bankNodes (pink/Relationship)
   - `ai` → empty array (just core analytics)

3. Add a `FeatureCardSidebar` component rendering:
   - A "Core Analytics" card (BarChart3 icon, blue accent, always shown)
   - Then the tab-specific bank node cards, each with icon badge + label, matching the diagram style
   - Vertically centered with `flex flex-col justify-center gap-3`

4. Update `renderConsumerOverlay()` layout:
   ```
   <div className="flex-1 min-h-0 flex p-4 gap-0 overflow-hidden">
     {/* Left: ~25% width, no border */}
     <div className="w-1/4 shrink-0 flex flex-col justify-center px-6 gap-3">
       <FeatureCardSidebar activeTab={activeTab} />
     </div>
     {/* Right: iPad frame */}
     <div className="flex-1 flex items-center justify-center">
       {/* existing iPad frame */}
     </div>
   </div>
   ```

**`src/components/demo/DemoNetworkDiagram.tsx`**
- Export `PILLAR_ROWS` so the overlay can import it

### Style details
- No visible divider between left and right sections
- Cards match diagram styling: `border-l-[3px]` with pillar color, gradient background, icon in colored badge, semibold label
- Cards are static/non-interactive (no click handlers) — they serve as visual context

