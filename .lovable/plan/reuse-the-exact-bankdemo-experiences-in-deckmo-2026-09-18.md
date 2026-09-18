# Reuse the exact `/bankdemo` experiences in `/deckmo`

## Goal
Replace the deck-only approximations with the actual customer phone and bank workspace interfaces used in `/bankdemo`. Keep the presentation deterministic by supplying frozen Ricky data and preventing service calls, loading states, timers, or editable mutations.

## Customer phone scenes
- Use the real `/bankdemo` phone frame and its existing Rewards, Membership/product, Budget/activity, and AI-facing presentation components instead of the custom `PhoneShell`, `ActivityPhone`, `RewardsPhone`, and `RelationshipPhone` replicas.
- Add a presentation-safe configuration to the shared phone components so `/deckmo` can select the exact visible tab/card/collection for each slide step without auto-rotation or live semantic search.
- Feed the phone with a fixed Ricky fixture shaped exactly like `/bankdemo` data: customer profile, holdings, enriched activity, offer groups, life events, and product cards.
- Preserve the deck’s staged narrative around the phone, but make the device chrome, navigation, cards, typography, images, and copy come from the same source components as `/bankdemo`.
- Keep Risk out of every customer-facing phone view.

## Bank workspace scenes: pages 22–24
- Replace the current miniature `DatabaseScreen`, `FlowsScreen`, and `CoworkerScreen` recreations with the real `/bankdemo` workspace shell and source views.
- Page 22 will render the actual Intelligence Database overview in a fixed presentation state, including its navigation, priority strip, dashboard content, and visible labels.
- Page 23 will render the actual Automated Flows interface at a deliberate default expanded flow, with controls visually intact but frozen for the presentation.
- Page 24 will render the actual AI Coworker dashboard and its current content, using the same tabs, cards, metrics, and data as `/bankdemo`.
- Scale each full workspace uniformly inside the slide rather than rebuilding or abbreviating its contents, so the composition remains exact while fitting the deck viewport.

## Deterministic presentation mode
- Introduce narrowly scoped presentation props or wrappers to shared `/bankdemo` components; normal `/bankdemo` behavior will remain unchanged.
- Disable prewarming, service requests, search execution, auto-advancing carousels, mutable saves, and other background activity only when rendered inside `/deckmo`.
- Replace remotely fetched phone imagery with locally served copies where needed, while keeping the same selected imagery and crop.
- Keep one centralized frozen fixture for deck inputs; do not duplicate the UI markup or fork future visual changes.

## Cleanup
- Remove the superseded deck-only phone and web-screen replicas after the shared components are in use.
- Retain the existing 28-step order, headings, callout rails, password gate, desktop requirement, keyboard/click navigation, presenter navigator, and strict light theme.

## Verification
- Compare `/bankdemo` and `/deckmo` side by side at the same viewport for each reused phone state and all three bank workspace pages.
- Verify pages 10–24 for clipping, overlap, readable scaling, correct staged states, and unchanged deck navigation.
- Confirm `/deckmo` makes no service/API requests while advancing through every slide; local static asset requests are allowed.
- Confirm Risk appears only in approved bank-facing content and never in the customer phone scenes.
- Run focused type checks and tests, then inspect preview diagnostics and screenshots at 1024×768, 1440×900, and 1920×1080.

## Scope
No changes to `/bankdemo` visuals, data rules, or normal interactions. Shared-component changes will only add a frozen presentation mode used by `/deckmo`.
