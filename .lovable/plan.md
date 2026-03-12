

## Password-Protect /demo Route

Create a simple password gate component that wraps the DemoPage. When a user visits `/demo`, they see a centered password input. Entering "2026demo" stores a flag in `sessionStorage` and renders the actual demo. No backend needed.

### Changes

**1. New file: `src/components/demo/DemoPasswordGate.tsx`**
- Full-screen centered card with password input and submit button
- On correct password ("2026demo"), set `sessionStorage.setItem("demo_access", "true")` and render children
- On mount, check sessionStorage to skip prompt if already authenticated this session
- Show error message on wrong password

**2. `src/pages/DemoPage.tsx`**
- Wrap the entire return in `<DemoPasswordGate>...</DemoPasswordGate>`

