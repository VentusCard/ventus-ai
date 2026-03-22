

## WM Copilot: Mock Bank Sign-In → Load Enrichment Client → New Tab

### Flow
1. Click "WM Copilot" in analytics sidebar → opens a **sign-in dialog** styled as "Bank of Ventus Wealth Management" (navy/gold branding, bank logo feel)
2. Mock login form (advisor email + password) → click "Sign In" → brief loading animation
3. After "sign in," the dialog auto-detects the **current enrichment flow's customer profile** (`userDemographics` already passed into `AnalyticsContainer`). Displays the client name/segment/AUM as a confirmation card: "Signing in as advisor for [Client Name]"
4. Click "Launch Copilot" → stores client profile in `sessionStorage` (`wm_copilot_launch_client`) → calls `window.open('/tepilot/advisor-console', '_blank')` → dialog closes
5. If no enrichment profile exists, show a message: "No active client profile. Run the enrichment flow first."

### Changes

**New: `src/components/tepilot/insights/WMCopilotSignInDialog.tsx`**
- Dialog component with "Bank of Ventus" branding (navy `#0f172a` header, gold accent `#d4a843`, serif-style heading)
- Step 1: Mock sign-in form (pre-filled advisor email, password field, "Sign In" button with spinner)
- Step 2: Client confirmation card showing `userDemographics.name`, `segment`, `aum` — single "Launch Copilot" button
- On launch: write profile to `sessionStorage`, `window.open`, close dialog
- Props: `open`, `onOpenChange`, `userDemographics: ClientProfileData | null`

**Update: `src/components/tepilot/insights/AnalyticsContainer.tsx`**
- Add `showSignIn` state
- When "WM Copilot" nav item clicked → set `showSignIn = true` instead of `setActiveTab`
- Render `<WMCopilotSignInDialog>` passing `userDemographics` prop through
- Remove `wm-copilot` from `TabValue`, remove its switch case, remove `BankwideWMCopilotView` import

**Update: `src/pages/AdvisorConsolePage.tsx`**
- On mount, check `sessionStorage` for `wm_copilot_launch_client`
- If found, parse it, store as `tepilot_client_profile`, set `selectedClientId` and `viewMode = "client"`, then remove the key

