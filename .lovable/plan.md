## Changes

1. **Rename heading** in `CoworkerInboxView.tsx` — change "What your AI coworker does" to "Ventus AI Coworker Capabilities".

2. **Make collapsible** — wrap the capabilities grid in a collapsible container, using a local `useState` (default: collapsed). Add a chevron toggle in the section header. When collapsed, only the header row is visible.