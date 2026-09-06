# Goal: Direction C — "The Decision Record" landing page

**Status:** built and delivered for local review (2 Sep 2026), amended three times by the founders' reviews (§9, §10) finished with a polish pass (§11), and given scroll behaviour on request (§12). First review: the palette is re-based on ventusai.com's existing colours (Appendix A is superseded by `src/landing/tokens.css`), the hero is tightened to four elements (eyebrow, headline, one sentence, one action — no audience line, no value cues), the three visualizations are rebuilt at product fidelity. Second review: see **§9 · Second-review amendments** below — they supersede the matching lines of §8 and Appendices B and F.
**Spec of record:** `Ventus AI/landing-redesign-review-2026-09-02/ventus-decision-record-2026-09-02.html` (also published as the artifact "Ventus Decision Record"). Where this goal and that document disagree, the spec wins; where the spec is silent, this goal decides.
**Supersedes:** `landing-redesign-review-2026-08-31/FINNOVATE-LANDING-GOAL.md` for everything visual. Its engineering decisions stand.

---

## 0. Model assignment

| Role | Model | Why |
|---|---|---|
| Main agent (W0′, integration, W6′ QA, delivery) | **Claude Fable 5.1**, this session | Holds the full context (spec, repo state, worktrees, QA harness, the reasons behind each decision). The judgment-heavy steps are here: whether the serif is set right, whether the record reads, whether the built page matches the spec. Switching models keeps the conversation, so nothing is lost by staying; a weaker main agent is where "almost right" typography would slip through. |
| Subagents W1′, W2′, W4′ (parallel implementation) | **Claude Sonnet 5** (`model: "sonnet"` on the Agent tool) | Each is a tightly scoped restyle against locked tokens and a locked spec. Sonnet 5 already built W1–W5 on this exact codebase with zero conflicts and clean type-check/build/lint on every branch. |
| Not used | Haiku / Opus | Haiku is too light for design-sensitive component work; Opus adds nothing over Fable for the main role. |

PRs must list model/tool used, files changed, tests run, scope and known risks (`CLAUDE.md`). Record the table above in the PR body.

---

## 1. Objective

Replace the visual layer of the Direction A build on `feat/finnovate-landing` with Direction C while keeping its engineering, so that the landing route renders **one governed decision, followed all the way, on mineral paper with a single dark instrument** — and passes the acceptance checklist in §8.

Outcome: a branch the founders can review locally, then hand to Zoheb for the PR to `dev`. Nothing is pushed to `origin` and nothing is merged by an agent.

## 2. Decisions confirmed (do not reopen)

1. **Direction C over Direction A.** Paper ground, one dark chapter (Governance), the record as the only motif.
2. **Hero headline:** `Personalization your bank can stand behind.` Supporting line: `Ventus brings customer context, bank policy, and activation together in one governed intelligence layer, delivered through the systems your bank already uses.`
3. **Serif thesis:** Newsreader 500 (optical sizing on) for the H1, the four chapter H2s, the three stage titles and the closing line. Nowhere else.
4. **Glass retreats to navigation:** backdrop blur on the header and its mobile panel only. Record, planes, chip, closing band and modal are solid.
5. **The hollow stamp stays:** Governance row 03 shows `Human review` as a hollow stamp.

## 3. Non-negotiables (carried from the 31 Aug goal, still binding)

- One public page; chapter order Hero → Intelligence → Governance → Activation → footer. Header: wordmark + exactly three hash anchors (`#intelligence`, `#governance`, `#activation`) + one `Request Access`. No sub-pages, dropdowns, FAQ, secondary CTAs, announcement bar.
- `/bankdemo` and every other route keep working; none is linked from the landing page. Legacy routes keep their own fonts and `noindex` as built.
- No vendor marks, photographs, percentages, dollar figures, counts, names, merchants, dates or version numbers anywhere on the page or in the record.
- Avoid list (text search must return nothing): revolutionary, transformative, seamless, hyper-personalized, unlock, empower, leverage, real-time, guaranteed, before customers ask, future of banking.
- One sticky sequence (Intelligence) at 120–140vh measured at a 900 px viewport; nothing else sticky except the header. Full reduced-motion branch (all durations zero, three static stages, no smooth scroll).
- Request Access: header, hero, closing band only; the built Supabase insert path is unchanged.
- UI/UX changes need human review before merge (`CLAUDE.md`). Agents open nothing against `dev`.

## 4. Repo setup

- Base: branch `feat/finnovate-landing` at commit `1ff55b5` ("W0/W6: integrate landing workstreams, add acceptance evidence"). It exists in the cloud clone (`/home/claude/ventus-ai`, this session) and on the Mac at `Ventus AI/ventus-ai-finnovate-landing-review/` (same commit; `_delete_me_node_modules_attempt/` there is disposable).
- W0′ commits directly on `feat/finnovate-landing`. Subagents work in `git worktree`s on branches `feat/finnovate-landing-c-w1`, `-c-w2`, `-c-w4` cut from the W0′ commit, `node_modules` symlinked from the base clone as before.
- `npm ci` outside the Lovable sandbox needs the lockfile URL rewrite (`europe-west4-npm.pkg.dev/lovable-core-prod/sandbox-npm-cache/` → `registry.npmjs.org/`) applied locally and reverted before commit. Never commit the rewritten lockfile.
- Verification per commit: `npx tsc --noEmit -p tsconfig.app.json`, `node node_modules/.bin/vite build --logLevel warn`, `npm run lint` (zero new errors; the repo's pre-existing `supabase/functions/**` errors are not ours).

## 5. Workstreams

### W0′ · Foundation (main agent, first, ~half day)

Files: `src/landing/tokens.css` (replace), `src/landing/landing.css` (restyle), `src/landing/LandingPage.tsx` (font request), `src/landing/copy.ts` (hero + record strings), `src/landing/motif/Stamp.tsx` (new), `src/App.tsx` (one literal: landing Suspense/fallback background → `#EDF3F4`).

1. Replace `tokens.css` with Appendix A. Keep existing token *names* the build already consumes where the meaning survives (`--night`, `--panel`, `--signal`, `--signal-strong`, `--approved`, `--muted`, `--text`, `--t-*`, `--shell`, `--section-pad`); add the paper set; delete `--ambient-violet` and every plane-glass token. Grep the tree for removed names and fix every consumer in the files W0′ owns; leave subagent-owned files compiling by mapping old names to new values in a short `/* legacy aliases — remove in W6′ */` block at the bottom of `tokens.css`.
2. `landing.css`: retire `.landing-chapter--light`; add `.landing-chapter--dark` (Governance): `background: var(--night); color: var(--text-dark); border-top/bottom: 1px solid var(--seam); padding-block: calc(var(--section-pad) + 24px)`. Remove `.landing-glass` from everything except the header; add `.landing-instrument` (night fill, `border-left: 1px solid var(--seam)`, shadow `0 24px 60px rgba(2,8,16,.28)`, highlight `inset 0 1px 0 rgba(216,242,255,.06)`) and `.landing-stamp` (see Appendix C). Keep `.landing-chapter-head`, `.landing-reveal`, `.landing-cta` (restyle: ink fill / paper text, 42 px, radius 6; `--compact` 36 px; `.landing-cta--on-dark` signal fill / night text), `.sr-only`.
3. `LandingPage.tsx`: `LANDING_FONTS_HREF` = Appendix B. Nothing else.
4. `copy.ts`: hero headline + supporting per §2; add `record` strings (Appendix D); everything else unchanged.
5. `Stamp.tsx`: `Stamp({ state: "filled" | "hollow", tone?: "paper" | "night", children })` per Appendix C.
6. Commit: `W0': Direction C tokens, paper shell, fonts, copy, Stamp`. Cut the three worktrees from it.

### W1′ · Header, modal, footer (Sonnet, parallel)

Files: `src/landing/header/GlassHeader.tsx`, `header.css`, `src/landing/request/modal.css`, `src/landing/footer/Footer.tsx`, `footer.css`. Do not touch `RequestAccessModal.tsx`, `submit.ts`, `context.tsx`.

- Header material: paper glass `var(--glass-header)` blur 20 px, hairline border, radius 6; after 32 px scroll fill `.88` + shadow `0 8px 24px rgba(7,26,43,.08)`. **Polarity swap:** the existing "on-light" detection (Activation behind the bar) becomes "on-dark" detection (`#governance` behind the bar) → night glass `rgba(7,17,29,.62)` blur 24, text `--text-dark`, CTA `--on-dark`. Everything else in the component (IntersectionObserver, `whenElementReady`, mobile menu, scroll lock, Escape, focus return, safe areas) unchanged.
- Anchors: Plex Mono 12.5 px, caps, +.08em; default `--muted`, hover `--ink`, active `--ink` with a 1 px ink underline (signal underline over Governance). **Remove the pill.** Wordmark: mono, +.14em.
- Mobile: bar 50 px, panel is a paper sheet (`--sheet`, hairline, mono rows 48 px); closed-bar indicator is the 1 px underline under the wordmark.
- Modal (`modal.css` only): sheet `--sheet`, radius 4, shadow `0 8px 24px rgba(7,26,43,.08)`, ink controls, Plex Sans; confirmation state styled as a one-line record (mono key `RECORD` · value `Request received. We will reply from info@ventusai.com within two business days.`). No blur.
- Footer: paper, hairline top, 96 px, same contents (wordmark, ©, mailto, Privacy).

### W2′ · Hero record and the Intelligence plane (Sonnet, parallel)

Files: `src/landing/hero/Hero.tsx`, `hero.css`, `src/landing/hero/DecisionPlane.tsx` → rename to `DecisionRecord.tsx` (update the import in `Hero.tsx`), `src/landing/intelligence/FlowPlane.tsx`, `intelligence.css`. Do not touch `Intelligence.tsx`.

- Hero: same 5/7 grid and one-time entrance; eyebrow mono teal; H1 serif (`--h1`, lh .96, −.022em); supporting Plex Sans 19 px; CTA ink; fine print mono 12.5 px muted. Value cues unchanged, on hairlines (`--hair-strong`).
- `DecisionRecord.tsx`: `.landing-instrument`; header row (mono: `DECISION RECORD` / `VENTUS · GOVERNED` in signal); the path drawing (inline SVG: four muted nodes → one signal node with a 4 px ring at 14% → one lit rail → bordered slot; labels `APPROVED CONTEXT`, `DECISION`, `EXISTING WORKFLOW`); five field rows per Appendix D with `Stamp`s (Approved · Passed · hollow `No human step`). `aria-hidden` on the drawing only; an `sr-only` paragraph summarising the record. Mobile: three rows (Context, Policy, Destination), stamps below values.
- `FlowPlane.tsx` / `intelligence.css`: keep the three always-mounted crossfading layers and the `computeUseSticky` branches exactly; restyle the plane as `.landing-instrument`, header `CONTEXT PLANE` / stage name in signal, workflow slot with mono label; stage titles in serif 24–28 px, inactive titles `--muted` (never below 4.5:1), active `--ink`.

### W4′ · Governance chapter and Activation network (Sonnet, parallel)

Files: `src/landing/governance/Governance.tsx`, `governance.css`, `src/landing/activation/ActivationNetwork.tsx`, `activation.css`. `Activation.tsx` and `ClosingBand.tsx`: token changes only if needed to compile.

- Governance: `<section id="governance" class="landing-chapter landing-chapter--dark">`; 5/7 grid; chapter head in serif/`--text-dark`; the Decision Control panel: `--panel` fill, `--hair-dark` border, mono header `DECISION CONTROL` / `● POLICY ACTIVE` in `--approved-dark`; four rows (01–04) each with title (Plex Sans 500, 15 px), sub-line (13.5 px `--muted-dark`), and a `Stamp` on the right: `Approved` · `Passed` · **hollow** `Human review` · `Retained`; one vertical rail down the left. Motion: rows stamp in via the existing `useRevealed` stagger — opacity 0→1 and scale .97→1 over `--t-stamp` (160 ms), 60 ms apart, at 40% threshold. Reduced motion: present at rest.
- Activation: paper chapter (drop `--light` modifier; it is the default now). `ActivationNetwork`: dark chip (`.landing-instrument`, mono `GOVERNED DECISION` / `approved destination`), hairline trunk (`--hair-strong`), five paper slots (`--sheet`, `--hair-strong` border, radius 0, small ink square glyph, label Plex Sans 500 13.5 px): Digital banking, CRM, Marketing, Rewards, Advisor. Advisor is `lit`: `--teal` border, filled round glyph, mono `FILED` label. Slots light once in sequence (40 ms stagger); hover raises 2 px. Whole diagram `aria-hidden` + `sr-only` summary, as built. Remove the inline Rail colour override; use `--rail`.
- `ClosingBand`: already a dark band on a light surface; ensure it uses `.landing-instrument` and `.landing-cta--on-dark`.

### W6′ · Integration and acceptance (main agent, last)

1. Merge `-c-w1`, `-c-w2`, `-c-w4` into `feat/finnovate-landing` (`--no-ff`). Resolve nothing by hand if scopes were respected; if a conflict appears, the file's owner above wins.
2. Delete the legacy-alias block from `tokens.css`; grep for every removed token and `.landing-glass` outside the header; type-check, build, lint.
3. Run §8 with the Playwright harness (screenshots at 320/375/768/900/1024/1280/1440 + reduced motion; overflow; dwell; blur census; seam census; CTA census; font-request census; avoid-list search; contrast; focus trap). Rewrite `docs/finnovate-landing-acceptance.md` with the evidence.
4. Deliver for local review: delta bundle `origin/dev..feat/finnovate-landing` into `Ventus AI/`, refresh `ventus-ai-finnovate-landing-review/` to the new tip, message the founders with what changed and what needs a human eye (the serif, the record, the stamp moment).

## 6. Sequencing and time

W0′ (½ day) → W1′ ‖ W2′ ‖ W4′ (1 day) → W6′ (½ day). Two days of agent time from go to a reviewable branch.

## 7. Verification gates (every commit)

- `tsc --noEmit` clean · `vite build` exit 0 · `npm run lint` zero new errors.
- No file outside the workstream's scope touched (check `git diff --stat`).
- Every commit message names the workstream (`W2': DecisionRecord + hero restyle`).

## 8. Acceptance checklist (Direction C)

**Structure**
- [ ] Five chapters in order; header = wordmark + 3 hash anchors + 1 Request Access; no announcement bar.
- [ ] Request Access in header, hero, closing band only (two header DOM variants, one visible per breakpoint).
- [ ] `/bankdemo` and all direct routes resolve; none linked from `/`.

**Type and colour**
- [ ] One Google Fonts request on `/` carrying Newsreader + IBM Plex Sans + IBM Plex Mono; no other family loads on `/`.
- [ ] Serif appears only in H1, four H2s, three stage titles, closing line.
- [ ] H1 72–92 px at 1440, 44–52 px at 375; H2 44–60; body 17–19.
- [ ] No `#8BE7FF` / `#3ECAEF` text on any paper tone; every text/ground pair ≥ 4.5:1 (spot-check muted on stone: 4.8:1).
- [ ] No purple, no visible gradient, no coloured shadow.

**Surfaces**
- [ ] `backdrop-filter` present on the header bar only; the mobile panel is a solid paper sheet; record, planes, chip, closing band, modal are solid.
- [ ] One-pixel `#3ECAEF` seam at every dark/paper boundary: record left edge, plane left edge, chip, closing band, both edges of Governance.
- [ ] Governance plane shows four stamps, row 03 hollow.

**Scrolling and motion**
- [ ] Native scroll; only sticky besides header is the Intelligence plane; dwell 120–140vh at 900 px.
- [ ] Governance stamps appear once in sequence; nothing animates during 30 s idle.
- [ ] Anchor clicks land titles below the header; active underline updates within a frame.
- [ ] Reduced motion: no smooth scroll, three static stages, stamps present, header updates.

**Responsive**
- [ ] 375 × 812: first two screens show bar, eyebrow, full H1, body, CTA, compact record; no overlap.
- [ ] No horizontal scroll at 320/375/768/900/1024/1280/1440.
- [ ] Touch targets ≥ 44 px.

**Credibility and accessibility**
- [ ] No vendor marks, photographs, percentages, dollar figures, counts; record has no name, merchant, amount, date, version.
- [ ] Avoid-list search returns nothing.
- [ ] Tab reaches everything; visible focus; modal traps and returns focus; Escape closes.
- [ ] Request Access inserts a row and shows the confirmation record; failure shows the fallback address.
- [ ] Title/description carry the positioning; LCP < 2.5 s on throttled 4G.

---

## 9. Second-review amendments (founders' review of the local build, 2 Sep)

The founders reviewed the first local build and asked for eight things. Each one changes the spec as follows; where a line below contradicts §8 or an appendix, this section wins.

1. **Hero overlap.** The H1 is sized against its own column (`min(var(--h1), 14.5cqw)` on a container-query column) and the hero grid is 6/6 at every width ≥ 900 px, so *Personalization* can never run under the record. §8 "H1 72–92 px at 1440" stands; at 1280 the H1 is ~70 px, at 375 it is 44 px.
2. **Whitespace around Understand / Decide / Activate.** The three stages are no longer three stacked screens. One pinned block — a compact stepper on the left, the plane on the right — holds for the scroller's extra distance, and scroll progress maps onto the three states in thirds; clicking a step jumps to its third. Dwell is **105vh** at 900 px (§8 "120–140vh" is superseded by "100–140vh"). Below 900 px and under reduced motion the stages are static blocks.
3. **Whitespace beside the Activation head; only the advisor lit.** Chapter heads on Intelligence and Activation are split (H2 left, body right, 7/5) so the diagram enters the first viewport, and the network cycles through every destination — Digital banking, CRM, Marketing, Rewards, Advisor — one every 3.6 s while it is in view, with the action named in the connector and inside the lit surface. Under reduced motion it rests on Advisor.
4. **Fidelity of the animations.** The record runs a choreographed 9 s cycle (sources light, signals travel the rails as comets, the node ripples, the decision travels to the workflow card, the item and stamp appear, the rows stamp in sequence); the plane morphs between its three compositions in one continuous scene rather than crossfading three; the network carries the decision along the rails as a comet and the surface's own screen lights on arrival. All timings are tokens and collapse to zero under reduced motion.
5. **Logo.** The original Ventus wordmark (`src/assets/ventus-logo-transparent.png`) is used in the header and the footer, inverted over the night header state. §8 "no vendor marks, photographs" still holds; the Ventus mark is the one permitted image (two `<img>` elements, both `alt="Ventus AI"`).
6. **Fonts in the visualizations.** IBM Plex Sans and IBM Plex Mono are dropped. Manrope carries every label, chip, stamp and row in the instruments (uppercase, tracked, 600–700), with Newsreader unchanged on the thesis lines. Appendix B's request becomes Newsreader + Manrope 400/500/600/700.
7. **"Bank" or "financial institutions".** Both, by role: "financial institutions" where the page names its audience (the eyebrow *Decision intelligence for financial institutions*, the SEO title); "your bank" / "the bank" where a sentence addresses the reader, because it is shorter and more direct in a headline. No sentence says "banks" as a market category.
8. **Elevation — glassmorphism.** Glass is now permitted on the header bar and on designated cards only: the record's source chips and workflow card, the plane's chips and cards, the Governance control panel (`.landing-glass-dark`), and the five destination surfaces (`.landing-glass-light`), each with a solid fallback under `@supports not (backdrop-filter)`. Ambient glows (`--glow-brand`, `--glow-signal`) sit behind the record, the plane, the control panel and the lit destination. The mobile menu panel and the modal stay solid. §8 "backdrop-filter on the header bar only" is superseded.

Also in this pass: the landing route's Suspense ground is white (was the old mist); the record's mobile row reads *Approved signal families* (the spelled-out count is gone); the form's confirmation no longer promises a reply time.

## 10. Third-review amendments (2 Sep, evening)

The founders' third look (the first two points restated, then two new ones) and the one question it raised:

1. **Hero overlap.** Reproduced only on the *first* local build (8de4e0e), which the review folder still held because the Mac was offline when the second pass landed. The second pass has no overlap; this pass verifies it with the real faces (Newsreader + Manrope installed in the build sandbox) at 900–1920 px: *Personalization* measures 6.05 em, the cap is now `min(var(--h1), 14cqw)`, and the word never reaches within 50 px of the record. The hero copy is fully visible at rest (a CSS entrance from 0.55, no observer).
2. **Whitespace.** The page moves to the live site's ~80 px cadence: `--section-pad: clamp(64px, 6vw, 88px)` (was up to 128), the hero at 140 px top / 0.6 × pad bottom, chapter head → instrument gap 32–48 px, closing band margin 40–56 px. The pinned Intelligence scroller is gone (its 105 vh dwell was the largest single block of empty paper): the plane now spans the shell and **cycles on its own** every 5 s while in view, with the three steps in a row beneath it as its caption, each carrying a progress line; clicking a step selects it and holds for 14 s. Page height at 1280 × 832: 5133 px → 3339 px.
3. **Positioning of text and animation.** Every text block now shares an edge with its visual: the hero copy is top-aligned so the eyebrow sits level with the record's title bar; split chapter heads top-align the body with the headline's first line (no empty top-right corner); the Intelligence plane shows the whole path — sources, relationship view, next action, workflow — as four stations in every state, the current one lit and the ones ahead as faint dashed outlines, so the reader always sees where the step sits; the Activation connector is a full-width decision bar (action · policy · destination) with the rails band under it, so the network has no empty paper beside a centred chip.
4. **"Are you basing everything off ventusai.com?"** Inherited from the live site: the palette (white, gray-900/700/600, blue-600 and its tints, the navy #0A1628, the green), the wordmark, Manrope (the site's own sans, per `tailwind.config.ts`), the 80 px section cadence and the 1240 px shell. New, per the approved Direction C spec: Newsreader on the thesis lines, the instrument/stamp visual language, the three self-running visualizations. A Manrope-only headline treatment is a one-token switch (`--font-serif`) if the founders prefer to stay entirely in the live site's type system; a side-by-side is attached to the review.

## 11. Fourth pass (polish, 2 Sep, evening)

The founders liked the third pass and asked for one more. No new defects; the pass is the finish a studio applies before hand-off:

- **Delivered state on the network.** A destination keeps the action it was handed after the cycle moves on — muted item, hairline instead of tint, the Filed stamp faded — so by the end of one cycle every screen shows what reached it. Under reduced motion nothing cycles, so only the advisor queue is filled.
- **Heads.** Split-head headlines measure 22ch: *A shared understanding / of the customer.* sits in two lines; the Activation headline balances in three.
- **Instrument bars.** The plane's head names the stage once (the three-dot indicator on wide screens, the plain label below 900 px); the decision bar's title matches the other bars at 11 px.
- **Keyboard.** Arrow keys walk the Intelligence steps; focus follows.
- **Fonts.** `preconnect` to both Google Fonts hosts ahead of the stylesheet, so the swap from the fallback serif is short.
- **Hero.** Bottom padding to half the section pad.

## 12. Scroll behaviour (founders' request, 2 Sep, late)

Asked for: scroll behaviour, "especially with Understand / Decide / Activate". The round-2 pin was dropped in §10 because its 444 px block floated in a 956 px viewport; this pass brings the pin back with the lesson applied — **the pinned thing must fill the viewport**.

- **Pinned mode** (≥ 900 px wide, ≥ 800 px tall, no reduced-motion preference): the whole Intelligence composition — chapter head, plane, step row — is one block, measured at runtime and centred under the header (never above 96 px). The scroller is exactly block + **120vh**; while the reader scrolls that distance the block holds and scroll progress is the stage: first third Understand, second Decide, third Activate. The active step's line is the scroll itself (it fills across the third), so every pixel answers. Clicking a step scrolls to the middle of its third. The plane gives up height on shorter screens (`clamp(300px, 100vh − 580px, 380px)`) so the block always fits: 730 px at 1280 × 900, 710 px at 1280 × 832, 789 px at 1470 × 956.
- **Cycle mode** (narrow or short viewports): nothing pins; the plane advances every 5 s while in view; a click holds a stage — §10's behaviour.
- **Static mode** (reduced motion): plain tabs, nothing moves by itself.
- **Elsewhere:** the hero record drifts up 8 % of the scroll (to −51 px) and the hero glow down 5 % as the hero leaves, so the instrument reads as a layer above the paper; motion-gated and off below 900 px. Anchor scrolling was already smooth under `prefers-reduced-motion: no-preference`.
- Page height at 1280 × 900 is 4333 px (3339 flat + the dwell); the harness checks one sticky block that fits the viewport, the dwell in 1.1–1.3 × vh, the three thirds, click-to-scroll, cycle mode at 720 px tall, and zero sticky under reduced motion.

## Appendix A · `tokens.css` (source of truth)

```css
.landing {
  /* paper — the bank's world */
  --paper: #EDF3F4;
  --sheet: #F7F9FA;
  --stone: #E1E8EB;
  --ink: #071A2B;
  --ink-soft: #2F4356;
  --muted: #56666F;
  --teal: #0A5563;
  --approved: #186A4F;
  --hair: rgba(7, 26, 43, 0.14);
  --hair-strong: rgba(7, 26, 43, 0.28);
  --rail: rgba(7, 26, 43, 0.28);

  /* instrument — Ventus's layer */
  --night: #06111D;
  --panel: #0C2539;
  --raised: #0A1E2E;
  --text-dark: #EDF5F8;
  --muted-dark: #9AAEB9;
  --signal: #8BE7FF;
  --signal-strong: #3ECAEF;
  --seam: #3ECAEF;
  --approved-dark: #5FD0A5;
  --rail-dark: rgba(139, 231, 255, 0.24);
  --hair-dark: rgba(216, 242, 255, 0.14);
  --instrument-shadow: 0 24px 60px rgba(2, 8, 16, 0.28);
  --instrument-highlight: inset 0 1px 0 rgba(216, 242, 255, 0.06);

  /* glass — navigation only */
  --glass-header: rgba(247, 249, 250, 0.78);
  --glass-header-scrolled: rgba(247, 249, 250, 0.88);
  --glass-header-dark: rgba(7, 17, 29, 0.62);
  --blur-header: 20px;
  --blur-header-dark: 24px;
  --header-shadow: 0 8px 24px rgba(7, 26, 43, 0.08);

  /* type */
  --font-serif: "Newsreader", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  --font-sans: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  --h1: clamp(48px, 6.6vw, 92px);      /* Newsreader 500, lh .96, -.022em */
  --h2: clamp(38px, 4.4vw, 60px);      /* Newsreader 500, lh 1.02, -.014em */
  --h3: clamp(24px, 2vw, 28px);        /* Newsreader 500, lh 1.1 */
  --body-l: 19px;                      /* Plex Sans 400, lh 1.5, max 60ch */
  --body: 17px;                        /* Plex Sans 400, lh 1.55, max 66ch */
  --control: 15px;                     /* Plex Sans 500 */
  --label: 12.5px;                     /* Plex Mono 500, +.08em, caps */
  --field: 11.5px;                     /* Plex Mono, +.1em caps keys; 12px sub-lines */

  /* rhythm */
  --shell: 1240px;
  --section-pad: clamp(104px, 11vw, 160px);
  --gap-s: 16px; --gap-m: 24px; --gap-l: 40px;

  /* radius */
  --r-header: 6px; --r-button: 6px; --r-sheet: 4px; --r-stamp: 3px;

  /* motion */
  --t-enter: 280ms; --t-stage: 220ms; --t-header: 200ms; --t-hover: 160ms; --t-stamp: 160ms;
  --ease: cubic-bezier(.2, .7, .2, 1);
  --motion-ok: 1;
}
@media (prefers-reduced-motion: reduce) {
  .landing { --t-enter: 0ms; --t-stage: 0ms; --t-header: 0ms; --t-hover: 0ms; --t-stamp: 0ms; --motion-ok: 0; }
}
```

Removed on purpose: `--ambient-violet`, `--mineral` (→ `--paper`), `--teal-deep` (→ `--teal`), `--muted-light` (→ `--muted`), `--approved-light` (→ `--approved`), all `--glass-plane*` / `--blur-plane` / `--glass-modal` / `--blur-modal`.

## Appendix B · Font request (landing route only)

```
https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap
```
Set `font-optical-sizing: auto` on `.landing`. Legacy routes keep `LegacyFonts` as built.

## Appendix C · Stamp

```tsx
// src/landing/motif/Stamp.tsx
export function Stamp({ state, tone = "night", children }:
  { state: "filled" | "hollow"; tone?: "night" | "paper"; children: React.ReactNode }) {
  return <span className={`landing-stamp landing-stamp--${state} landing-stamp--${tone}`}><i aria-hidden="true" />{children}</span>;
}
```
```css
.landing-stamp { display:inline-flex; align-items:center; gap:6px; padding:4px 8px 3px; border:1px solid; border-radius:var(--r-stamp);
  font-family:var(--font-mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
.landing-stamp i { width:6px; height:6px; border-radius:50%; background:currentColor; }
.landing-stamp--hollow i { background:transparent; border:1px solid currentColor; }
.landing-stamp--night.landing-stamp--filled { color:var(--approved-dark); border-color:var(--approved-dark); background:rgba(95,208,165,.10); }
.landing-stamp--night.landing-stamp--hollow { color:var(--muted-dark); border-color:var(--muted-dark); }
.landing-stamp--paper.landing-stamp--filled { color:var(--approved); border-color:var(--approved); background:rgba(24,106,79,.08); }
.landing-stamp--paper.landing-stamp--hollow { color:var(--muted); border-color:var(--hair-strong); }
```
State is carried by the form (filled vs ring dot); colour is secondary.

## Appendix D · The record (copy.ts additions)

```ts
record: {
  title: "Decision record",
  badge: "Ventus · governed",
  pathLabels: { context: "Approved context", decision: "Decision", workflow: "Existing workflow" },
  rows: [
    { key: "Context", value: "Four approved signal families", sub: "transactions · product relationships · digital behavior · teams", stamp: { state: "filled", label: "Approved" } },
    { key: "Decision", value: "Next relevant action for this relationship" },
    { key: "Policy", value: "Institution-defined rules applied", sub: "eligibility · suitability · contact preference", stamp: { state: "filled", label: "Passed" } },
    { key: "Review", value: "Below the review threshold", stamp: { state: "hollow", label: "No human step" } },
    { key: "Destination", value: "Advisor queue", sub: "an existing workflow · rationale retained with the record" },
  ],
  mobileRows: ["Context", "Policy", "Destination"],
  srSummary: "Illustrative decision record: four approved signal families enter, one next action is chosen within institution-defined rules, no human review step is required in this case, and the decision is filed to an existing advisor queue with its rationale.",
},
governance: { /* existing headline/body unchanged */
  control: { title: "Decision control", status: "Policy active" },
  rows: [
    { n: "01", title: "Approved context", body: "Only permitted signal families enter the decision.", stamp: { state: "filled", label: "Approved" } },
    { n: "02", title: "Policy checks", body: "Institution-defined rules shape what can happen next.", stamp: { state: "filled", label: "Passed" } },
    { n: "03", title: "Review threshold", body: "Human involvement stays visible where required.", stamp: { state: "hollow", label: "Human review" } },
    { n: "04", title: "Decision record", body: "The rationale and the destination remain connected.", stamp: { state: "filled", label: "Retained" } },
  ],
},
activation: { /* existing */ chip: { title: "Governed decision", sub: "approved destination" }, slots: ["Digital banking", "CRM", "Marketing", "Rewards", "Advisor"], litSlot: "Advisor", litLabel: "Filed" },
```
Never allowed in any record value: customer names, merchants, amounts, percentages, dates, model or version numbers.

## Appendix E · Header states

| State | Fill | Blur | Text | Active anchor | CTA |
|---|---|---|---|---|---|
| Top of page | `--glass-header` | 20 px | `--muted` / `--ink` | 1 px `--ink` underline | ink / paper |
| Scrolled > 32 px | `--glass-header-scrolled` + `--header-shadow` | 20 px | same | same | same |
| Governance behind bar | `--glass-header-dark` | 24 px | `--muted-dark` / `--text-dark` | 1 px `--signal` underline | signal / night |

Detection: the existing IntersectionObserver band; `#governance` intersecting the bar's band switches the dark state (the on-light logic with polarity reversed). Mobile panel inherits the bar's state.

## Appendix F · Motion rules

Entrances 8–12 px, 240–320 ms, `--ease`. Stage crossfade `--t-stage`. Stamps `--t-stamp` with 60 ms stagger, once. Header material `--t-header`. Hover `--t-hover`. Nothing continuous. Reduced motion: every duration 0, `scroll-behavior: auto`, stages static, stamps at rest.
