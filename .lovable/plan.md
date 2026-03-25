

## Remove WM Copilot Sign-In Gate

### What changes
Currently, clicking "WM Copilot" in the sidebar opens a sign-in dialog that blocks access if no client profile exists. We'll remove the dialog entirely and instead render `BankwideWMCopilotView` directly as a tab, just like the other sidebar items.

### File: `src/components/tepilot/insights/AnalyticsContainer.tsx`

1. **Add `wm-copilot` to the `TabValue` type** and add it to the Relationship nav group with the Briefcase icon
2. **Add case in `renderContent`**: `case 'wm-copilot': return <BankwideWMCopilotView />;`
3. **Remove** the standalone WM Copilot button at the bottom of the sidebar (the one that calls `setShowSignIn(true)`)
4. **Remove** the `WMCopilotSignInDialog` component render and its `showSignIn` state
5. **Remove** the `WMCopilotSignInDialog` import

### Technical details
- `BankwideWMCopilotView` already generates its own dashboard clients internally, so it works standalone without any client profile dependency
- The sign-in dialog file (`WMCopilotSignInDialog.tsx`) can remain on disk but will no longer be referenced

