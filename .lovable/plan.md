

## Fix Bank-Facing Node → Tab Mapping

**File: `src/components/demo/DemoDetailOverlay.tsx`**

### Issues Found

| Bank Node | Diagram Label | Current Tab | Correct Tab | Why |
|-----------|--------------|-------------|-------------|-----|
| `analytics` | Behavioral Analytics | `dashboard` | `dashboard` | ✅ Correct |
| `outflow` | Outflow Analysis | `dashboard` | `wallet-share` | Wallet Share Intelligence covers outflow analysis |
| `travel` | Reward Intelligence | `rewards-intelligence` | `rewards-intelligence` | ✅ Correct |
| `locational` | Locational Experience | `rewards-intelligence` | `location-experience` | Exact name match exists as its own tab |
| `lifeEventIntel` | Life Event Intelligence | `life-events` | `life-events` | ✅ Correct |
| `wealth` (bank) | Financial Journey | `life-events` | `targeting` | The "Financial Journey" tab (`targeting`) is the exact match |

### Fix
Update `BANK_WIDE_TAB_MAP` in DemoDetailOverlay.tsx:

```typescript
const BANK_WIDE_TAB_MAP: Partial<Record<DemoNodeType, string>> = {
  analytics: "dashboard",        // ✅ unchanged
  outflow: "wallet-share",       // 🔧 was "dashboard"
  travel: "rewards-intelligence", // ✅ unchanged
  locational: "location-experience", // 🔧 was "rewards-intelligence"
  lifeEventIntel: "life-events", // ✅ unchanged
  wealth: "targeting",           // 🔧 was "life-events" → Financial Journey tab
};
```

Three lines changed, no structural modifications needed.

