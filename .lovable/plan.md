

## Conditionally Show Disclaimer on Products & AI Tabs Only

### Changes

**1. `src/components/exec-demo/ExecDemoPhoneView.tsx` (line 108)**
- Wrap the disclaimer `<span>` in a condition: only render when `consumerTab === 'product' || consumerTab === 'ai'`

**2. `src/components/demo/DemoDetailOverlay.tsx` (line 230)**
- Same conditional: only render when `activeTab === 'product' || activeTab === 'ai'`

Two one-line edits, no new files.

