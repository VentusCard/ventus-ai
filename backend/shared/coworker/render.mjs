// backend/shared/coworker/render.mjs
//
// Rendering for the Coworker's outbound email. Pure functions, no I/O.
//
// Governance rules enforced here, not left to the model:
//
//  - Provenance is stated once, in the footer, and applies to the whole
//    message. Per-row chips on every cell trained the eye to skip them and
//    made the tables look like a compliance artifact rather than something an
//    advisor wants to read.
//  - How a figure is presented depends on how well it holds up. A figure
//    computed from a household's own transactions is shown as a point number,
//    because it is arithmetic an advisor can check. A figure resting on an
//    assumption is shown as a range, and one with no defensible number is
//    shown as a phrase rather than a fabricated total.
//  - An audience is always reconciled against the whole book, so the reader
//    can see the denominator rather than take a shortlist on faith.
//  - Exclusions are attributed to the institution, because the institution
//    owns those rules. Ventus screens and personalizes; it does not decide who
//    is eligible for credit.
//  - Every reply ends with a single, concrete forward move.

import { pluralize } from './labels.mjs';

/** HTML-escape a string for safe interpolation into the email body. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Format a dollar figure as a band, for figures that rest on an assumption.
 * Widens by +/- the given fraction and rounds to a readable step.
 * @returns {string} e.g. "$3,800 to $4,600"
 */
export function formatBand(value, { fraction = 0.1 } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return 'not estimable';
  const lo = roundStep(n * (1 - fraction));
  const hi = roundStep(n * (1 + fraction));
  return `${usd(lo)} to ${usd(hi)}`;
}

function roundStep(n) {
  const abs = Math.abs(n);
  const step = abs >= 100000 ? 5000 : abs >= 10000 ? 500 : abs >= 1000 ? 50 : 10;
  return Math.round(n / step) * step;
}

function usd(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

/**
 * Present an annual benefit according to how it was arrived at.
 *
 * A computed net is a point number: it came from this household's ledger run
 * against published terms, and rounding it into a band would hide the fact that
 * it is checkable. An estimate is a band, because a single number implies a
 * precision the assumption cannot carry. Where no dollar figure is defensible,
 * the outcome phrase stands in rather than a zero.
 *
 * @param {{annual_benefit_usd?:number, benefit_precision?:string, benefit_qualifier?:string, benefit_outcome?:string}} row
 */
export function formatBenefit(row = {}) {
  const { annual_benefit_usd: amount, benefit_precision: precision, benefit_qualifier: qualifier } =
    row;
  if (qualifier === 'outcome' || precision === 'none') {
    return row.benefit_outcome || 'No dollar figure';
  }
  if (precision === 'range') return `${formatBand(amount)} estimate`;
  if (qualifier === 'gross') return `${usd(amount)} gross`;
  return `${usd(amount)} net`;
}

/**
 * Render the shared HTML shell (peer tone, plain and readable in mail clients).
 *
 * @param {object} opts
 * @param {string} opts.greeting          e.g. "Hi Dana,"
 * @param {string[]} opts.paragraphs      intro/body paragraphs (already plain text)
 * @param {object[]} [opts.sections]      [{ heading, html }]
 * @param {string} opts.forwardMove       the single concrete next step
 * @param {string} [opts.signoff]
 * @param {string} [opts.disclaimer]
 */
export function renderShell({
  greeting,
  paragraphs = [],
  sections = [],
  forwardMove,
  signoff = 'Ventus Coworker',
  disclaimer = DEFAULT_DISCLAIMER,
}) {
  const paras = paragraphs.map((p) => `<p style="margin:0 0 12px;">${esc(p)}</p>`).join('');
  const secs = sections
    .map(
      (s) =>
        `<div style="margin:0 0 16px;"><div style="font-weight:600;margin:0 0 6px;">${esc(s.heading)}</div>${s.html}</div>`
    )
    .join('');
  const forward = forwardMove
    ? `<p style="margin:16px 0 0;"><strong>Next:</strong> ${esc(forwardMove)}</p>`
    : '';
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.5;max-width:640px;">
<p style="margin:0 0 12px;">${esc(greeting)}</p>
${paras}
${secs}
${forward}
<p style="margin:16px 0 0;">${esc(signoff)}</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0 8px;" />
<p style="font-size:11px;color:#888;margin:0;">${esc(disclaimer)}</p>
</div>`;
}

// Provenance lives here, once, instead of on every table cell. It has to do
// three things: say who the message is for, distinguish a calculated figure
// from an assumed one, and make clear the signals are inferred from spending
// rather than verified facts.
export const DEFAULT_DISCLAIMER =
  'Prepared by Ventus for internal use by advisory colleagues. Figures shown as net are calculated from this household\'s own transactions over the last twelve months against published product terms. Figures shown as an estimate rest on the assumption stated beside them. Signals are inferred from transaction activity, not verified facts. Review before any client contact.';

/**
 * One line reconciling a screen against the whole book. An advisor handed a
 * shortlist without a denominator has no way to judge whether the screen was
 * thorough or lucky, so every household is accounted for in exactly one of
 * three buckets.
 */
export function renderReconciliation({ considered = 0, fits = 0, excluded = 0, no_signal = 0 }) {
  const parts = [`${pluralize(fits, 'household')} fit`];
  if (excluded) {
    parts.push(`${excluded} excluded under the institution's own product rules`);
  }
  if (no_signal) parts.push(`${no_signal} with no supporting signal`);
  return `Screened all ${pluralize(considered, 'household')} in the book: ${parts.join(', ')}.`;
}

/**
 * Render a ranked audience table. Rows show the household, the signal that put
 * them on the list, and the annual benefit presented according to how it was
 * derived. Excluded households are listed separately, attributed to the
 * institution's rules.
 */
export function renderAudienceTable({
  candidates = [],
  excluded = [],
  no_signal = [],
  considered = 0,
}) {
  const rows = candidates
    .map(
      (c, i) => `<tr>
<td style="padding:6px 8px;border-bottom:1px solid #eee;">${i + 1}</td>
<td style="padding:6px 8px;border-bottom:1px solid #eee;">${esc(c.household_name || c.household_id)}</td>
<td style="padding:6px 8px;border-bottom:1px solid #eee;">${esc(c.lead_signal?.label || c.rationale)}</td>
<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;">${esc(formatBenefit(c))}</td>
<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;">${esc(c.outreach_window?.label || '')}</td>
</tr>`
    )
    .join('');
  const table = `<table style="border-collapse:collapse;width:100%;font-size:13px;">
<thead><tr>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">#</th>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Household</th>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Signal</th>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Annual benefit</th>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Outreach window</th>
</tr></thead>
<tbody>${rows || '<tr><td colspan="5" style="padding:8px;color:#888;">No households fit this product right now.</td></tr>'}</tbody>
</table>`;

  const reconciliation = considered
    ? `<div style="margin-top:10px;font-size:12px;color:#666;">${esc(
        renderReconciliation({
          considered,
          fits: candidates.length,
          excluded: excluded.length,
          no_signal: no_signal.length,
        })
      )}</div>`
    : '';

  const exclusions = excluded.length
    ? `<div style="margin-top:6px;font-size:12px;color:#666;">Held back by the institution's product rules: ${excluded
        .map(
          (s) => `${esc(s.household_name || s.household_id)} (${esc(s.reason_label || s.reason)})`
        )
        .join('; ')}.</div>`
    : '';

  return table + reconciliation + exclusions;
}

/**
 * Render the digest table. Five columns, because an advisor scanning at 7am
 * needs to know who, why, what to offer, what it is worth, and how long they
 * have, and nothing else earns a column.
 */
export function renderDigestTable(items = []) {
  const rows = items
    .map(
      (i) => `<tr>
<td style="padding:6px 8px;border-bottom:1px solid #eee;">${esc(i.household_name || i.household_id)}</td>
<td style="padding:6px 8px;border-bottom:1px solid #eee;">${esc(i.lead_signal?.label || '')}</td>
<td style="padding:6px 8px;border-bottom:1px solid #eee;">${esc(i.product?.name || '')}</td>
<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;">${esc(formatBenefit(i))}</td>
<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;">${esc(i.outreach_window?.label || '')}</td>
</tr>`
    )
    .join('');
  return `<table style="border-collapse:collapse;width:100%;font-size:13px;">
<thead><tr>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Household</th>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Signal</th>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Best-fit product</th>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Annual benefit</th>
<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd;">Outreach window</th>
</tr></thead>
<tbody>${rows || '<tr><td colspan="5" style="padding:8px;color:#888;">No opportunities surfaced this cycle.</td></tr>'}</tbody>
</table>`;
}

/**
 * Render one outreach draft as two clearly separated halves.
 *
 * The top half is what the client could receive: the advisor's voice, no
 * inferred attributes, no internal figures. The bottom half is the advisor's
 * own briefing: why this household, and the arithmetic behind the number. They
 * are separated visually and labeled, because the failure mode that matters is
 * an advisor forwarding the whole thing to a client.
 */
export function renderOutreachDraft({ subject, clientBody, rationale, window: outreachWindow }) {
  const subjectLine = subject
    ? `<div style="font-size:13px;margin:0 0 8px;"><span style="color:#888;">Subject:</span> ${esc(subject)}</div>`
    : '';
  const body = String(clientBody || '')
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 10px;">${esc(p.trim())}</p>`)
    .join('');
  const timing = outreachWindow
    ? `<div style="font-size:12px;color:#666;margin-top:6px;">Timing: ${esc(outreachWindow)}</div>`
    : '';
  return `<div style="border:1px solid #e5e5e5;border-radius:6px;padding:12px 14px;margin:0 0 4px;">
<div style="font-size:11px;font-weight:600;letter-spacing:0.04em;color:#8a6d1f;margin:0 0 8px;">DRAFT, NOT SENT. REVIEW AND SEND IN YOUR OWN NAME.</div>
${subjectLine}
<div style="font-size:14px;">${body}</div>
</div>
<div style="font-size:12px;color:#555;padding:0 2px 8px;">
<span style="font-weight:600;">Why this household:</span> ${esc(rationale)}
${timing}
</div>`;
}

/** Render a simple bulleted evidence list (each item already plain text). */
export function renderBullets(items = []) {
  if (!items.length) return '<p style="color:#888;margin:0;">No evidence found.</p>';
  return `<ul style="margin:0;padding-left:20px;">${items
    .map((i) => `<li style="margin:0 0 4px;">${esc(i)}</li>`)
    .join('')}</ul>`;
}
