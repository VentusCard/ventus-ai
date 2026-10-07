# Add a rewards-and-perks email rule to the Wealth Managers coworker

## Change

Add one new entry to the **"What it always does"** list of the **Coworker for Wealth Managers** playbook, alongside the five existing always-on items:

> Draft emails pairing rewards, perks, and experiences with the families whose lifestyle shows a strong fit

Concretely:

- `src/components/tepilot/coworker-inbox/coworkerPersonaData.ts` — append rule `w2-a6` to the `wealth` playbook's `always` array (after the pre-meeting dossier rule, which is the natural end of the list).

## Tone and constraints

- Keep the wording lifestyle-led, not data-led, matching the existing playbook style and the demo's copy rules (no specific amounts, no surveillance-sounding language).
- It stays an "always does" item: the coworker prepares drafts for the wealth manager, and the existing "Never contact a client directly" / "Never act or send anything without the wealth manager's approval" rules keep it as a draft-only action — consistent with how the advisors coworker drafts outreach for human review.

## Verification

- Typecheck + build.
- Playwright on /bankdemo → AI Coworker → Wealth Managers → Persona Settings: confirm the new rule appears in "What it always does" and the section renders cleanly.
