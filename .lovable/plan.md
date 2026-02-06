

# Navigate to Advisor Console Client View

## Overview
Update the primary "Access Wealth Management CoPilot" button to navigate to `/tepilot/advisor-console` with the client view, while the secondary "Access Relationship Intelligence Dashboard" button continues to open the dashboard view.

## Changes Required

### 1. Update TePilot.tsx Primary Button
**File: `src/pages/TePilot.tsx`**

Change the primary button's `onClick` handler to navigate to advisor-console with client view state:
```typescript
onClick={() => {
  // ... existing session storage logic ...
  navigate('/tepilot/advisor-console', { state: { initialView: 'client' } });
}}
```

### 2. Update AdvisorConsolePage.tsx to Read Initial View State
**File: `src/pages/AdvisorConsolePage.tsx`**

Add `useLocation` import and read the navigation state to set initial view:
```typescript
import { useNavigate, useLocation } from "react-router-dom";

// Inside component
const location = useLocation();
const initialView = (location.state as { initialView?: ViewMode })?.initialView;

const [viewMode, setViewMode] = useState<ViewMode>(initialView || "dashboard");
```

## Button Behavior Summary

| Button | Route | Initial View |
|--------|-------|--------------|
| Access Relationship Intelligence Dashboard | `/tepilot/advisor-console` | Dashboard (default) |
| Access Wealth Management CoPilot | `/tepilot/advisor-console` | Client |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/TePilot.tsx` | Update primary button to navigate with `{ state: { initialView: 'client' } }` |
| `src/pages/AdvisorConsolePage.tsx` | Add `useLocation` hook and read initial view state |

