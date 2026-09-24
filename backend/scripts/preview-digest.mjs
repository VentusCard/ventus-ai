// backend/scripts/preview-digest.mjs
//
// Render the daily digest to an HTML file so the email can be looked at
// without mailing anyone. Assembles the message exactly as the digest Lambda
// does; if the two ever drift, this is worth less than it looks.
//
//   node backend/scripts/preview-digest.mjs [outfile]

import { writeFileSync } from 'node:fs';
import { createFixturePortfolioProvider } from '../shared/coworker/portfolio-provider.mjs';
import { buildAdvisorDigest, digestActions, digestSubject } from '../shared/coworker/tasks.mjs';
import { renderDigestTable, renderShell } from '../shared/coworker/render.mjs';
import { buildHouseholdContext } from '../shared/coworker/context.mjs';
import { pluralize, verbFor } from '../shared/coworker/labels.mjs';

const ADVISOR = process.env.PREVIEW_ADVISOR || 'adv_zoheb';
const out = process.argv[2] || '/tmp/digest-preview.html';

const provider = createFixturePortfolioProvider();
const advisor = provider.getAdvisors().find((a) => a.id === ADVISOR);

// Two refreshes, a week apart, so rows carry an age and one reads as new.
const start = new Date(Date.now() - 7 * 86400000);
const now = new Date();
const context = new Map();
for (const householdId of advisor.household_ids) {
  const household = provider.getHousehold(householdId);
  const signals = provider.getSignals(householdId);
  const first = buildHouseholdContext({ household, signals, previous: null, now: start });
  context.set(householdId, buildHouseholdContext({ household, signals, previous: first, now }));
}

const digest = buildAdvisorDigest({ provider, advisorId: ADVISOR, maxItems: 5, context, now });

const html = renderShell({
  greeting: `Hi ${advisor.name.split(' ')[0]},`,
  paragraphs: [
    `I went through your book this morning. ${pluralize(
      digest.items.length,
      'household'
    )} ${verbFor(digest.items.length)} worth your time today.`,
  ],
  sections: [{ heading: 'Today', html: renderDigestTable(digest.items) }],
  actions: digestActions(digest.items),
  unsubscribeUrl: 'https://example.invalid/u/preview',
});

writeFileSync(out, `<!doctype html><meta charset="utf-8"><body style="margin:24px;background:#fff;">${html}</body>`);
console.log(`subject: ${digestSubject(digest)}`);
console.log(`rows:    ${digest.items.length}`);
console.log(`written: ${out}`);
