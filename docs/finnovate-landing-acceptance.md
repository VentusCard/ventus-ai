# Finnovate landing acceptance report

Date: 2026-08-31  
Branch: `feat/finnovate-landing`  
Baseline: `origin/dev@1595b9a80fa43da45916e4d8c2ff33b7688861a8`  
Local preview: `http://127.0.0.1:8081/`

## Build and static checks

| Check | Result | Evidence |
| --- | --- | --- |
| Production build | Pass | `npm run build`; Vite completed successfully. Existing large legacy chunk warnings remain. |
| Landing-scoped lint | Pass, zero output | `eslint src/landing src/App.tsx supabase/functions/request-access/index.ts` |
| Landing source QA | Pass | `npm run qa:landing`; 22 landing files checked. |
| Repo-wide lint baseline | Known failure outside scope | 353 errors and 89 warnings; recorded before landing integration. |
| Dirty draft preserved | Pass | Original `ventus-ai-dev-wave-b-audit-9a2b` worktree remains unchanged. |
| Landing bundle isolation | Pass | `LandingPage-*.js` contains no legacy FAQ, Solutions, Schedule Demo, or Learn More strings; legacy `Index-*.js` is a separate lazy chunk. |

## Structure and content

- [x] Page order is Hero → Intelligence → Governance → Activation → minimal footer.
- [x] Header contains the wordmark, three real hash anchors, and Request Access.
- [x] Root page exposes no subpage, FAQ, Learn More, or secondary CTA links.
- [x] `/bankdemo`, `/classic`, `/contact`, `/platform`, and a representative solution route return HTTP 200 locally.
- [x] Closed landing page renders `Request Access` exactly three times.
- [x] Modal title is `Request access`; submit control is `Submit request`.
- [x] No banned phrase, vendor name, dollar figure, percentage, customer count, or unsupported integration claim is rendered on `/`.
- [x] Landing route requests Inter Tight and IBM Plex Mono only; legacy font families are route-scoped separately.
- [x] Exactly six named glass regions exist when the modal is open: header, hero decision plane, Intelligence plane, Governance plane, Activation network, Request Access modal.

## Responsive evidence

The browser viewport override was set to each requested size. The browser backend reserves approximately 15 px for its scrollbar, so page `innerWidth` and saved image width are correspondingly smaller; overflow passed because `scrollWidth <= innerWidth` in every case.

| Requested viewport | Page inner width | Horizontal overflow | Hero copy + CTA in first viewport | Navigation mode | Intelligence mode | Screenshot |
| --- | ---: | --- | --- | --- | --- | --- |
| 320×800 | 320 | None | Pass; CTA bottom 641 px | Compact menu | Static stages | [320](./landing-qa/screenshots/landing-320x800.png) |
| 375×812 | 375 | None | Pass; CTA bottom 545 px | Compact menu | Static stages | [375](./landing-qa/screenshots/landing-375x812.png) |
| 768×1024 | 768 | None | Pass; CTA bottom 432 px | Compact menu | Static stages | [768](./landing-qa/screenshots/landing-768x1024.png) |
| 900×1024 | 900 | None | Pass; CTA bottom 436 px | Desktop anchors | Sticky story | [900](./landing-qa/screenshots/landing-900x1024.png) |
| 1024×768 | 1024 | None | Pass; CTA bottom 450 px | Desktop anchors | Sticky story | [1024](./landing-qa/screenshots/landing-1024x768.png) |
| 1280×800 | 1280 | None | Pass; CTA bottom 563 px | Desktop anchors | Sticky story | [1280](./landing-qa/screenshots/landing-1280x800.png) |
| 1440×900 | 1440 | None | Pass; CTA bottom 659 px | Desktop anchors | Sticky story | [1440](./landing-qa/screenshots/landing-1440x900.png) |

Additional evidence:

- [Mobile menu](./landing-qa/screenshots/mobile-menu-375x812.png): 48 px anchor rows, 44 px menu control, body scroll lock, Escape close.
- [Intelligence](./landing-qa/screenshots/intelligence-1440x900.png): integrated chapter head and single sticky FlowPlane.
- [Decide state](./landing-qa/screenshots/intelligence-decide-1440x900.png): active stage and plane state change together.
- [Governance](./landing-qa/screenshots/governance-1440x900.png): one plane and one rail, no nested cards.
- [Activation](./landing-qa/screenshots/activation-1440x900.png): mineral ground, deep-teal signal, five plain destinations.
- [Request Access](./landing-qa/screenshots/request-access-1280x800.png): modal form and glass surface.
- [Reduced motion](./landing-qa/screenshots/reduced-motion-1440x900.png): desktop story disabled, three static states rendered, animations `none`, transitions `0s`.

## Interaction and motion

- [x] Anchor navigation lands below the fixed header and updates `aria-current="location"`.
- [x] No header item is active over the hero; Activation persists as active at the final chapter.
- [x] Intelligence is the only sticky content beyond the fixed header.
- [x] Measured sticky dwell at 1440×900: 1,216 px / 135.14vh, inside the 120–140vh target.
- [x] Below 900 px, sticky content is removed and all three static states render in normal flow.
- [x] Reduced motion uses `scroll-behavior:auto`, no animations, no transitions, and static Intelligence states.
- [x] No autoplay, looping animation, carousel, snap point, or scroll hijacking.

## Accessibility and contrast

- [x] Header and modal controls have visible focus treatment.
- [x] Mobile menu exposes `aria-expanded` / `aria-controls`, locks body scrolling, and closes on Escape.
- [x] Modal has an accessible title/description, labelled fields, inline validation, honeypot, focus trap, Escape close, and focus return to the invoking CTA.
- [x] Required modal fields surface `aria-invalid` and specific errors.
- [x] All tested foreground/background token pairs exceed 4.5:1: text/night 17.20, muted/night 8.26, text/panel 14.20, muted/panel 6.82, ink/mineral 15.72, muted-light/mineral 6.13, teal-deep/mineral 7.51, signal/night 13.54.

## Request Access endpoint

- [x] Client validates Name, Work email, Institution, and Role; decision is optional.
- [x] Client invokes the dedicated Supabase `request-access` Edge Function rather than `mailto:`.
- [x] Edge Function validates and escapes payloads, honors a honeypot, restricts CORS, and sends through Resend to `info@ventusai.com` with reply-to set to the requester.
- [ ] Edge Function deployed to the approved Supabase project.
- [ ] `RESEND_API_KEY` and sender domain verified in the deployed environment.
- [ ] Live success and failure paths exercised against the deployed endpoint.

## Deployment and performance gates

- [ ] Feature branch pushed and an Amplify dev/PR preview URL recorded.
- [ ] Preview routes and Request Access smoke-tested on Amplify.
- [ ] Lighthouse run against the preview with throttled 4G; LCP under 2.5 s confirmed.
- [ ] Human UI/copy approval recorded before any merge.
- [ ] Zoheb remains the production merge/deployment owner; no production deployment performed.

