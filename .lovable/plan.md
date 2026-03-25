

## Make Transaction Card Clickable to Expand Left Panel

### Problem
When the left panel is collapsed and the user clicks the transaction/user node in the network diagram, nothing happens — it's a plain `div`.

### Changes

**1. `src/components/demo/DemoNetworkDiagram.tsx`**
- Add a new callback prop `onTxCardClick?: () => void`
- Change the TxCard wrapper (line 297) from a `div` to a clickable `button`/`div` with `onClick={() => onTxCardClick?.()}` and a pointer cursor when customer exists

**2. `src/components/demo/DemoPage.tsx`**
- Pass `onTxCardClick={() => setPanelCollapsed(false)}` to `DemoNetworkDiagram`
- This re-expands the left customer panel when the user clicks the transaction card node

### Result
Clicking the user/transaction node in the network diagram expands the left panel back out, giving intuitive access to customer details from the diagram.

