import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_DISCLAIMER,
  esc,
  formatBand,
  formatBenefit,
  renderAudienceTable,
  renderBullets,
  renderDigestTable,
  renderOutreachDraft,
  renderReconciliation,
  renderShell,
} from './render.mjs';
import { findBannedVocabulary, findSnakeCase } from './labels.mjs';

test('esc neutralizes HTML', () => {
  assert.equal(esc('<b>"a"&</b>'), '&lt;b&gt;&quot;a&quot;&amp;&lt;/b&gt;');
});

test('formatBand produces a range and handles non-estimable', () => {
  const band = formatBand(1500);
  assert.match(band, /^\$[\d,]+ to \$[\d,]+$/);
  assert.equal(formatBand(0), 'not estimable');
  assert.equal(formatBand('nope'), 'not estimable');
});

// --- benefit presentation ----------------------------------------------------

test('formatBenefit shows a computed net as a point number, not a band', () => {
  const out = formatBenefit({
    annual_benefit_usd: 553,
    benefit_precision: 'point',
    benefit_qualifier: 'net',
  });
  assert.equal(out, '$553 net');
  assert.doesNotMatch(out, / to /);
});

test('formatBenefit shows a computed gross as gross, never as net', () => {
  const out = formatBenefit({
    annual_benefit_usd: 1871,
    benefit_precision: 'point',
    benefit_qualifier: 'gross',
  });
  assert.equal(out, '$1,871 gross');
});

test('formatBenefit shows an assumption-based figure as a labeled range', () => {
  const out = formatBenefit({
    annual_benefit_usd: 2685,
    benefit_precision: 'range',
    benefit_qualifier: 'estimate',
  });
  assert.match(out, / to /);
  assert.match(out, /estimate$/);
});

test('formatBenefit falls back to the outcome phrase instead of inventing a zero', () => {
  const out = formatBenefit({
    annual_benefit_usd: 0,
    benefit_precision: 'none',
    benefit_qualifier: 'outcome',
    benefit_outcome: '$512,000 sitting in cash to put to work',
  });
  assert.equal(out, '$512,000 sitting in cash to put to work');
});

// --- shell -------------------------------------------------------------------

test('renderShell includes greeting, forward move, and disclaimer', () => {
  const html = renderShell({
    greeting: 'Hi Dana,',
    paragraphs: ['One.', 'Two.'],
    forwardMove: 'Do the thing?',
  });
  assert.match(html, /Hi Dana,/);
  assert.match(html, /Do the thing\?/);
  assert.match(html, /Next:/);
  assert.match(html, /Prepared by Ventus for internal use/);
});

test('the disclaimer distinguishes a calculated figure from an assumed one', () => {
  assert.match(DEFAULT_DISCLAIMER, /net are calculated/i);
  assert.match(DEFAULT_DISCLAIMER, /estimate rest on the assumption/i);
  assert.match(DEFAULT_DISCLAIMER, /inferred from transaction activity/i);
  // The old disclaimer leaned on a badge that no longer exists.
  assert.doesNotMatch(DEFAULT_DISCLAIMER, /third-party modeled/i);
});

// --- audience ----------------------------------------------------------------

const AUDIENCE = {
  considered: 12,
  candidates: [
    {
      household_id: 'hh_a',
      household_name: 'A Household',
      lead_signal: { label: 'Travel-heavy spend' },
      outreach_window: { label: 'Next 45 days' },
      annual_benefit_usd: 553,
      benefit_precision: 'point',
      benefit_qualifier: 'net',
    },
  ],
  excluded: [
    {
      household_id: 'hh_b',
      household_name: 'B Household',
      reason: 'nsf_overdraft_cluster',
      reason_label: 'recent overdraft activity',
    },
  ],
  no_signal: [{ household_id: 'hh_c', household_name: 'C Household' }],
};

test('renderAudienceTable reconciles the whole book and attributes exclusions to the institution', () => {
  const html = renderAudienceTable(AUDIENCE);
  assert.match(html, /A Household/);
  assert.match(html, /Screened all 12 households/);
  assert.match(html, /1 household fit/);
  assert.match(html, /1 excluded under the institution's own product rules/);
  assert.match(html, /1 with no supporting signal/);
  // The exclusion reason must read as language, never as the raw key.
  assert.match(html, /recent overdraft activity/);
  assert.doesNotMatch(html, /nsf_overdraft_cluster/);
});

test('renderAudienceTable carries no provenance badges', () => {
  const html = renderAudienceTable(AUDIENCE);
  assert.doesNotMatch(html, /third-party modeled/i);
});

test('renderReconciliation accounts for every household in exactly one bucket', () => {
  const line = renderReconciliation({ considered: 12, fits: 7, excluded: 2, no_signal: 3 });
  assert.match(line, /Screened all 12 households/);
  assert.match(line, /7 households fit/);
  assert.match(line, /2 excluded/);
  assert.match(line, /3 with no supporting signal/);
});

test('renderReconciliation pluralizes a single household correctly', () => {
  const line = renderReconciliation({ considered: 1, fits: 1, excluded: 0, no_signal: 0 });
  assert.match(line, /all 1 household in the book/);
  assert.match(line, /1 household fit/);
  assert.doesNotMatch(line, /1 households/);
});

// --- digest ------------------------------------------------------------------

const DIGEST_ROW = {
  household_id: 'hh_a',
  household_name: 'A Household',
  product: { id: 'p', name: 'Prod' },
  lead_signal: { label: 'Inheritance received' },
  outreach_window: { label: 'Next 14 days' },
  annual_benefit_usd: 2000,
  benefit_precision: 'point',
  benefit_qualifier: 'net',
};

test('renderDigestTable renders the five columns an advisor needs', () => {
  const html = renderDigestTable([DIGEST_ROW]);
  for (const heading of [
    'Household',
    'Signal',
    'Best-fit product',
    'Annual benefit',
    'Outreach window',
  ]) {
    assert.match(html, new RegExp(heading));
  }
  assert.match(html, /A Household/);
  assert.match(html, /Inheritance received/);
  assert.match(html, /Next 14 days/);
  assert.match(html, /\$2,000 net/);
  assert.match(renderDigestTable([]), /No opportunities surfaced/);
});

test('renderDigestTable carries no provenance badges and no internal keys', () => {
  const html = renderDigestTable([DIGEST_ROW]);
  assert.doesNotMatch(html, /third-party modeled/i);
  // Style attributes legitimately contain no snake_case; anything found is ours.
  assert.deepEqual(findSnakeCase(stripStyles(html)), []);
});

// --- outreach draft ----------------------------------------------------------

test('renderOutreachDraft labels the draft and separates the advisor briefing', () => {
  const html = renderOutreachDraft({
    subject: 'A thought on how you travel',
    clientBody: 'Hi Ada,\n\nI was going through your accounts.\n\nGot twenty minutes?',
    rationale: 'Travel spend of note. $553 net after the fee.',
    window: 'Next 45 days',
  });
  assert.match(html, /DRAFT, NOT SENT/);
  assert.match(html, /REVIEW AND SEND IN YOUR OWN NAME/);
  assert.match(html, /A thought on how you travel/);
  assert.match(html, /Why this household:/);
  assert.match(html, /Timing: Next 45 days/);
});

// --- guards ------------------------------------------------------------------

test('rendered output uses no banned vocabulary', () => {
  const html =
    renderShell({
      greeting: 'Hi Dana,',
      paragraphs: ['One.'],
      sections: [{ heading: 'Best fit for Prod', html: renderAudienceTable(AUDIENCE) }],
      forwardMove: 'Next thing?',
    }) + renderDigestTable([DIGEST_ROW]);
  assert.deepEqual(findBannedVocabulary(html), []);
});

test('rendered output uses no em dashes', () => {
  const html = renderShell({
    greeting: 'Hi Dana,',
    paragraphs: ['One.'],
    sections: [{ heading: 'Best fit for Prod', html: renderAudienceTable(AUDIENCE) }],
    forwardMove: 'Next thing?',
  });
  assert.doesNotMatch(html, /\u2014/);
});

test('renderBullets handles empty and non-empty', () => {
  assert.match(renderBullets([]), /No evidence/);
  assert.match(renderBullets(['a', 'b']), /<li[^>]*>a<\/li>/);
});

/** Drop style="..." attributes so CSS property names are not read as snake_case. */
function stripStyles(html) {
  return String(html).replace(/style="[^"]*"/g, '');
}
