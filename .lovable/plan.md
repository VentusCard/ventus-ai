

## Add Password Gate to `/demo` and `/deckmo`

### Approach
Create a simple, shared password gate component that prompts for a password before showing any content. Both `/demo` and `/deckmo` will use it. Password is hardcoded as `"ventus2026"`. Access is persisted in `sessionStorage` so it survives page refreshes within a session.

### Changes

**1. New: `src/components/demo/SimplePasswordGate.tsx`**
- Clean, minimal full-screen password input (Manrope font, white/slate theme)
- Ventus logo at top, single password field, submit button
- On correct password (`ventus2026`), sets `sessionStorage.setItem("demo_password_access", "true")` and renders children
- On wrong password, shows inline error message
- Checks sessionStorage on mount to skip gate if already authenticated

**2. Modify: `src/pages/ExecDemoPage.tsx`**
- Wrap the entire return in `<SimplePasswordGate>...</SimplePasswordGate>`

**3. Modify: `src/pages/DemoPage.tsx`**
- The existing `DemoPasswordGate` is a multi-beat presentation opener, not a password gate
- Wrap the existing `<DemoPasswordGate>` inside `<SimplePasswordGate>` so the password is required first, then the beat-by-beat opener plays, then the demo loads

Both pages share the same sessionStorage key, so entering the password once unlocks both.

