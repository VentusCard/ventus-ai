

# Collapse Left Panel on Enrichment Start

## Overview
When enrichment begins (`isProcessing` becomes true or `currentPhase` leaves "idle"), the left panel slides off-screen and is replaced by a small floating button in the top-left corner. Clicking the button re-expands the panel. The panel also stays collapsed once enrichment completes so the network diagram gets full width.

## Changes — `src/pages/DemoPage.tsx`

1. Add `panelCollapsed` state, default `false`
2. Set `panelCollapsed = true` when `handleEnrich` fires
3. Wrap the left panel div with a conditional transition:
   - When collapsed: `translate-x` off-screen + `w-0 overflow-hidden` with CSS transition
   - When expanded: normal 30% width
4. Add a floating button (top-left, `z-50`) visible only when collapsed:
   - Small pill with the Ventus logo or a `PanelLeft` icon + "Show Panel"
   - `onClick` → `setPanelCollapsed(false)`
5. The network diagram `flex-1` naturally fills the freed space

No other files need changes. Pure layout toggle in DemoPage.

