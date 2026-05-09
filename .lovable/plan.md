## Hide the floating settings gear inside the demo

The bottom-left gear icon comes from `SettingsDialog` rendered with the `floating` prop in `src/components/demo/SimplePasswordGate.tsx` (line ~51). It's mounted after the user passes the password gate, so it appears throughout `/demo`.

### Change
- Remove the `floating` prop on that `<SettingsDialog />` instance (or remove the entire `<SettingsDialog />` mount, since with `floating` removed and no other trigger it will never open).
- Keep the top-right gear on the password gate itself (pre-auth) so admins can still configure the demo before entering.

### Files
- Edit only: `src/components/demo/SimplePasswordGate.tsx`