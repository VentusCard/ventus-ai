

## Remove "Profile" Tab & Map "rewards" activeTab Directly

### Problem
The phone mockup has a "Profile" (ux) tab that should be removed. When the intel panel's "Next-Offer" tab is active (`activeTab === "rewards"`), the phone should go directly to the Rewards tab instead of Profile.

### Changes — Single file: `src/components/exec-demo/ExecDemoPhoneView.tsx`

1. **Remove the "ux" / "Profile" entry** from the `CONSUMER_TABS` array (line 24). The bottom bar will show 4 tabs: Rewards, Offers, Membership, AI.

2. **Update `ConsumerTab` type** — remove `"ux"` from the union.

3. **Update `TAB_MAP`** — change `analytics: "ux"` to `analytics: "rewards"` so the analytics intel tab also maps to the Rewards phone tab (since Profile no longer exists).

4. **Update default tab** — change the fallback from `"ux"` to `"rewards"` (line 42).

5. **Remove the `case "ux"` branch** in `renderContent()` that renders `DemoEngagementView`. The `DemoEngagementView` import can also be removed.

