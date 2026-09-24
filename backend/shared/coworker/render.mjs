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

import { householdShortName, pluralize } from './labels.mjs';

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
 * @param {string} [opts.unsubscribeUrl]  one-click opt-out target. Required on
 *   mail we originate; omitted on replies, which are transactional.
 * @param {{example:string, does:string}[]} [opts.actions]  what the reader can
 *   reply with. Use instead of forwardMove where there is genuinely more than
 *   one useful move; see renderActions.
 */
export function renderShell({
  greeting,
  paragraphs = [],
  sections = [],
  forwardMove,
  actions = [],
  signoff = 'Ventus AI Coworker',
  disclaimer = DEFAULT_DISCLAIMER,
  unsubscribeUrl,
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
  const actionBlock = actions.length ? renderActions(actions) : '';
  // A visible link as well as the List-Unsubscribe header: the header is only
  // surfaced by some clients, and the ones that hide it are the ones where a
  // reader who cannot find the opt-out reports the mail as spam instead.
  const optOut = unsubscribeUrl
    ? `<p style="font-size:11px;color:#888;margin:6px 0 0;">You are receiving this because you asked the Ventus AI Coworker to screen your book each morning. <a href="${esc(unsubscribeUrl)}" style="color:#888;text-decoration:underline;">Stop the daily digest</a>.</p>`
    : '';
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.5;max-width:720px;">
<p style="margin:0 0 12px;">${esc(greeting)}</p>
${paras}
${secs}
${forward}
${actionBlock}
<p style="margin:16px 0 0;">${esc(signoff)}</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0 8px;" />
<p style="font-size:11px;color:#888;margin:0;">${esc(disclaimer)}</p>
${optOut}
</div>`;
}

/**
 * What the reader can reply with, as worked examples rather than a menu.
 *
 * The digest used to end on one instruction — screen the book against a
 * product — which is neither the most useful next move nor a fair picture of
 * what the Coworker does. An advisor who has just read five households most
 * likely wants a draft for one of them, and had no way to know they could ask.
 *
 * Examples name real households from the mail above, because "Draft the
 * outreach for the Novaks" is self-evidently a thing you can type and
 * "compose_outreach" is not. Every entry here must map to something the
 * Coworker genuinely handles: the intent classifier recognizes drafting,
 * screening, meeting prep and evidence lookup, and nothing else belongs in
 * this list however good it would look.
 */
export function renderActions(actions = []) {
  const rows = actions
    .map(
      (a) => `<tr>
<td style="padding:4px 10px 4px 0;white-space:nowrap;vertical-align:top;"><span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;color:#101828;background:#f2f4f7;border-radius:4px;padding:2px 7px;">${esc(a.example)}</span></td>
<td style="padding:4px 0;font-size:13px;color:#667085;vertical-align:top;">${esc(a.does)}</td>
</tr>`
    )
    .join('');
  return `<div style="margin:18px 0 0;">
<div style="font-weight:600;margin:0 0 8px;">Just reply to this email</div>
<table role="presentation" style="border-collapse:collapse;">${rows}</table>
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
    .map((i, idx) => {
      const last = idx === items.length - 1;
      const edge = last ? 'none' : '1px solid #eff1f5';
      const cell = `padding:18px 14px;border-bottom:${edge};vertical-align:top;line-height:1.45;`;
      return `<tr>
<td style="${cell}font-weight:600;color:#101828;font-size:15px;">${esc(householdShortName(i.household_name) || i.household_id)}</td>
<td style="${cell}color:#344054;">${esc(i.lead_signal?.label || '')}${renderNewBadge(i.timing)}${renderLifeEventBadge(i.lead_signal)}${renderSubline(agingNote(i.timing))}</td>
<td style="${cell}color:#344054;">${esc(i.product?.name || '')}</td>
<td style="${cell}${benefitEmphasis(i)}">${esc(formatBenefit(i))}</td>
<td style="${cell}">${renderWindowBadge(i.outreach_window)}${renderSubline(formatWindowRemaining(i.timing))}</td>
</tr>`;
    })
    .join('');
  const th = (label, radius = '') =>
    `<th style="text-align:left;padding:12px 14px;background:#f8f9fb;border-bottom:1px solid #e9ecf2;font-size:10.5px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:#7a8699;${radius}">${label}</th>`;
  // Explicit widths because the browser's guess is wrong here: left to itself
  // it starves the product column, and "Travel Cash Rewards Card" breaks over
  // three lines while the benefit column sits half empty.
  return `<table role="presentation" style="border-collapse:separate;border-spacing:0;width:100%;font-size:14px;border:1px solid #e9ecf2;border-radius:10px;overflow:hidden;table-layout:fixed;">
<colgroup><col style="width:13%;"/><col style="width:22%;"/><col style="width:20%;"/><col style="width:24%;"/><col style="width:21%;"/></colgroup>
<thead><tr>
${th('Household', 'border-top-left-radius:10px;')}
${th('Signal')}
${th('Best-fit product')}
${th('Annual benefit')}
${th('Outreach window', 'border-top-right-radius:10px;')}
</tr></thead>
<tbody>${rows || '<tr><td colspan="5" style="padding:14px 12px;color:#98a2b3;">No opportunities surfaced this cycle.</td></tr>'}</tbody>
</table>`;
}

/**
 * A dollar figure is the thing an advisor is scanning for, so it gets weight.
 * An outcome phrase is a sentence, not a number, and setting it in the same
 * bold ink made rows without a figure look like rows with one.
 */
function benefitEmphasis(row = {}) {
  const priced = !(row.benefit_qualifier === 'outcome' || row.benefit_precision === 'none');
  // No nowrap. A fixed-layout table clips rather than overflows, and a banded
  // estimate ("$2,400 to $2,950 estimate") is long enough that nowrap cut the
  // word "estimate" in half — which read as a precise figure.
  return priced ? 'font-weight:600;color:#101828;' : 'color:#475467;';
}

// Urgency carried by color as well as words. An advisor skimming five rows at
// 7am should be able to see which one has a clock on it without reading, and
// the wording alone ("Next 7 days" vs "No fixed deadline") does not survive a
// skim. Muted palette on purpose: red here means a fee the household is
// already paying, and if everything is colored, nothing is.
const WINDOW_TONE = {
  immediate: { bg: '#fef3f2', fg: '#b42318' },
  fast: { bg: '#fffaeb', fg: '#b54708' },
  dated: { bg: '#eff8ff', fg: '#175cd3' },
  seasonal: { bg: '#f2f4f7', fg: '#475467' },
  standing: { bg: '#f9fafb', fg: '#667085' },
};

function renderWindowBadge(window) {
  const label = window?.label;
  if (!label) return '';
  const tone = WINDOW_TONE[window?.bucket] || WINDOW_TONE.standing;
  return `<span style="display:inline-block;font-size:12px;font-weight:500;color:${tone.fg};background:${tone.bg};border-radius:4px;padding:3px 8px;white-space:nowrap;">${esc(label)}</span>`;
}

/**
 * The "New" marker on a signal that arrived since the last refresh.
 *
 * This is the one thing in the digest an advisor should be able to spot without
 * reading: on a morning when three of five rows are the same rows as yesterday,
 * the new one is the reason to open the mail at all.
 */
function renderNewBadge(timing) {
  if (!timing?.novel) return '';
  return ' <span style="display:inline-block;font-size:10px;font-weight:600;letter-spacing:0.04em;color:#0b6b3a;background:#e7f5ec;border-radius:3px;padding:1px 5px;vertical-align:1px;">NEW</span>';
}

/**
 * Marks a row whose reason is something that happened to the household rather
 * than a pattern in how they spend.
 *
 * "Inheritance received" and "Travel-heavy spend" rendered identically, so the
 * distinction an advisor cares about most — did something happen to these
 * people, or is this a habit we noticed — was carried entirely by reading the
 * words. Brand blue rather than the green used for NEW: the two can appear on
 * the same row and they answer different questions, one about recency and one
 * about kind.
 */
function renderLifeEventBadge(leadSignal) {
  if (leadSignal?.kind !== 'life_event') return '';
  return ' <span style="display:inline-block;font-size:10px;font-weight:600;letter-spacing:0.04em;color:#1d4ed8;background:#eff4ff;border-radius:3px;padding:1px 5px;vertical-align:1px;">LIFE EVENT</span>';
}

/** Secondary line under a table cell, for context that should not compete with the value. */
function renderSubline(text) {
  if (!text) return '';
  return `<div style="font-size:11px;color:#888;margin-top:2px;">${esc(text)}</div>`;
}

/**
 * Age, but only once it is worth a line.
 *
 * Every row used to carry its age, and because the context refresh dates the
 * whole book in one pass, that meant five copies of "First seen 3 days ago"
 * under five different signals — the single biggest source of noise in the
 * table, and no information at all. Age earns its line only once a signal has
 * been sitting long enough that an advisor might reasonably wonder why it is
 * still here. Below that, the NEW badge and the window column already answer
 * both of the questions age was trying to answer.
 */
const AGE_WORTH_NOTING_DAYS = 14;

function agingNote(timing) {
  const days = Number(timing?.age_days);
  if (!Number.isFinite(days) || days < AGE_WORTH_NOTING_DAYS) return '';
  return formatSignalAge(timing);
}

/**
 * How long we have been observing a signal.
 *
 * Says nothing at all when the context refresh has not dated the signal yet.
 * An undated signal is not a new one, and printing "first seen today" for
 * something we simply have no history on would be the digest asserting a fact
 * it does not hold.
 */
export function formatSignalAge(timing) {
  if (!timing || timing.age_days == null) return '';
  const days = Number(timing.age_days);
  if (!Number.isFinite(days)) return '';
  if (days <= 0) return 'First seen today';
  if (days === 1) return 'First seen yesterday';
  return `First seen ${days} days ago`;
}

/**
 * Days left in the window, for signals that genuinely run out.
 *
 * Standing signals get nothing here: a travel-heavy spender has no deadline,
 * and inventing one would make every other deadline in the mail less credible.
 */
export function formatWindowRemaining(timing) {
  if (!timing || timing.days_remaining == null) return '';
  const left = Number(timing.days_remaining);
  if (!Number.isFinite(left) || left <= 0) return '';
  if (left === 1) return '1 day left';
  return `${left} days left`;
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
