# Fix Cal.com Embed with Official React Component

## Goal
Replace the iframe with Cal.com's official React embed so the scheduler is smaller and reliably light-themed.

## Changes

1. **Use the official React embed**
   - Install `@calcom/embed-react`.
   - Add a `CalEmbed` component (or inline it) that imports `Cal` and `getCalApi`.
   - Call `getCalApi({ namespace: "30min" })` in `useEffect` and apply UI options.

2. **Force light theme and compact layout**
   - Pass `config={{ theme: "light", layout: "week_view", useSlotsViewOnSmallScreen: "true" }}` to the `Cal` component.
   - Use `week_view` instead of `month_view` so the embed is shorter.

3. **Control size**
   - Wrap the embed in a container with a fixed height of `560px` (down from `680px`) and `overflow: hidden`.
   - Keep it responsive with `width: 100%`.

4. **Verify**
   - Run `bun run build` to confirm the new dependency and component compile cleanly.

## Files touched
- `src/pages/ContactUs.tsx`
- `package.json` / lockfile (via `bun add @calcom/embed-react`)

## Technical note
The official React embed supports `config.theme` and `config.layout` directly, which avoids the iframe query-param theming issues and gives Cal.com control over the rendered height.
