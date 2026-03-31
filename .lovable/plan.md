

## Add Deprecation Notice to TePilot Password Gate

### Goal
Deter website visitors from entering TePilot by showing a deprecation notice on the password gate screen, directing them to contact the Ventus team instead. Keep the gate functional with a new password for internal use.

### Changes (single file: `src/pages/TePilot.tsx`)

1. **Update password** from `"2026proto"` to `"ventusgang26"` (line 294).

2. **Add a deprecation notice on the password gate screen** — a visible card/banner displayed above or around the password input on the gate UI, with text like:

   > "TePilot is being phased out into client-specific pilots. Please contact the Ventus team for details."

   Include a "Contact Us" link pointing to `/contact`. This is shown to all visitors on the gate — no hover interaction needed, it's always visible and prominent.

3. **Keep the password gate fully functional** — internal users who know the password can still enter.

### What stays untouched
- Everything inside the authenticated TePilot view
- All other pages and components

