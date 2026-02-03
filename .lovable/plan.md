
# Block Mobile Access for /tepilot

## Overview

Add a device check that prevents mobile and small tablet users from accessing the TePilot demo. Users on screens smaller than 1024px will see a friendly message explaining that the demo requires a larger screen, with no password form displayed.

## Approach

The `use-mobile.tsx` hook already defines the breakpoints needed:
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: >= 1024px

Since "large screen tablets are fine," I'll use 1024px as the threshold. Screens below this width will see a blocking message instead of the password form.

## Implementation

### 1. Update TePilot.tsx

**Add import:**
```tsx
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
```

**Add hooks at component top:**
```tsx
const isMobile = useIsMobile();
const isTablet = useIsTablet();
const isSmallScreen = isMobile || isTablet; // < 1024px
```

**Add early return before password form (inside `!isAuthenticated` block):**
```tsx
if (isSmallScreen) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Monitor className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-slate-900">Desktop Required</CardTitle>
          <CardDescription className="text-slate-600">
            The TePilot demo requires a larger screen for the best experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-slate-500">
            Please access this page from a desktop computer or large tablet (landscape mode) 
            to explore the full transaction enrichment and analytics capabilities.
          </p>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Add Monitor icon to imports:**
```tsx
import { ..., Monitor } from "lucide-react";
```

## User Experience

| Screen Size | Behavior |
|-------------|----------|
| Mobile (< 768px) | Shows "Desktop Required" message with home button |
| Small Tablet (768-1023px) | Shows "Desktop Required" message with home button |
| Large Tablet/Desktop (>= 1024px) | Shows normal password form |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/TePilot.tsx` | Add mobile/tablet detection hooks and blocking message |

## Result

Users on phones and small tablets see a centered card explaining that a larger screen is required, with a button to return home. The password form is never shown on these devices.
