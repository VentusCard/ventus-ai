// backend/shared/coworker/mail.mjs
//
// Mail plumbing for the AI Coworker: parse inbound raw MIME, strip quoted reply
// history, resolve the thread id from References/In-Reply-To, build RFC-compliant
// threading headers for the outbound reply, and enforce the sender allowlist.
//
// Pure and dependency-free (no AWS, no network). The handler passes raw MIME in
// and gets a normalized message out; the digest sender uses buildThreadingHeaders
// + newMessageId directly.

const ANGLE_ADDR = /<([^>]+)>/;

/**
 * Parse a raw RFC822 MIME string into { headers, from, to, subject, messageId,
 * inReplyTo, references, body }. This is a deliberately small parser scoped to
 * what SES inbound delivers for our use case (single-part or multipart/alternative
 * with a text/plain part). It is not a general MIME library.
 */
export function parseInboundEmail(raw) {
  if (typeof raw !== 'string') throw new Error('parseInboundEmail requires a raw MIME string');
  const sepIndex = findHeaderBodySeparator(raw);
  const headerBlock = sepIndex >= 0 ? raw.slice(0, sepIndex) : raw;
  const bodyBlock = sepIndex >= 0 ? raw.slice(sepIndex).replace(/^\r?\n\r?\n/, '') : '';

  const headers = parseHeaders(headerBlock);
  const contentType = headers['content-type'] || 'text/plain';
  const body = extractTextPlain(bodyBlock, contentType);

  return {
    headers,
    from: extractAddress(headers['from']),
    to: extractAddress(headers['to']),
    subject: headers['subject'] || '',
    messageId: cleanAngle(headers['message-id'] || ''),
    inReplyTo: cleanAngle(headers['in-reply-to'] || ''),
    references: parseReferences(headers['references'] || ''),
    body,
  };
}

function findHeaderBodySeparator(raw) {
  const crlf = raw.indexOf('\r\n\r\n');
  const lf = raw.indexOf('\n\n');
  if (crlf === -1) return lf;
  if (lf === -1) return crlf;
  return Math.min(crlf, lf);
}

function parseHeaders(block) {
  const headers = {};
  // Unfold RFC822 folded headers (continuation lines start with whitespace).
  const unfolded = block.replace(/\r?\n[ \t]+/g, ' ');
  for (const line of unfolded.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    // Keep the first occurrence for single-value headers; that matches how the
    // top-level envelope headers we care about appear.
    if (!(key in headers)) headers[key] = value;
  }
  return headers;
}

function extractTextPlain(bodyBlock, contentType) {
  const boundaryMatch = /boundary="?([^";]+)"?/i.exec(contentType);
  if (!boundaryMatch) return bodyBlock.trim();

  const boundary = `--${boundaryMatch[1]}`;
  const parts = bodyBlock.split(boundary);
  for (const part of parts) {
    if (/content-type:\s*text\/plain/i.test(part)) {
      const sep = findHeaderBodySeparator(part);
      return (sep >= 0 ? part.slice(sep) : part).replace(/^\r?\n\r?\n/, '').trim();
    }
  }
  // No explicit text/plain part; fall back to the first part's payload.
  const first = parts.find((p) => p.trim() && !p.trim().startsWith('--'));
  return (first || bodyBlock).trim();
}

function extractAddress(value) {
  if (!value) return '';
  const angle = ANGLE_ADDR.exec(value);
  return (angle ? angle[1] : value).trim().toLowerCase();
}

function cleanAngle(value) {
  if (!value) return '';
  const angle = ANGLE_ADDR.exec(value);
  return (angle ? angle[1] : value).trim();
}

function parseReferences(value) {
  return value
    .split(/\s+/)
    .map((r) => cleanAngle(r))
    .filter(Boolean);
}

/**
 * Remove quoted reply history so the model only sees the advisor's new message.
 * Handles the common "On <date>, <name> wrote:" attribution line and leading
 * ">" quote blocks that mail clients prepend.
 */
export function stripQuotedReply(body) {
  if (!body) return '';
  const lines = body.split(/\r?\n/);
  const kept = [];
  for (const line of lines) {
    if (/^\s*On .+wrote:\s*$/.test(line)) break;
    if (/^\s*-{2,}\s*Original Message\s*-{2,}/i.test(line)) break;
    if (/^\s*_{5,}\s*$/.test(line)) break;
    kept.push(line);
  }
  // Drop trailing quoted ">" lines and blank padding.
  while (kept.length && (/^\s*>/.test(kept[kept.length - 1]) || kept[kept.length - 1].trim() === '')) {
    kept.pop();
  }
  return kept.join('\n').trim();
}

/**
 * Resolve the stable thread id for a message. Prefer the root of the References
 * chain (the original outbound Message-ID we minted), fall back to In-Reply-To,
 * then to the message's own id (a brand-new thread).
 */
export function resolveThreadId(message) {
  if (message.references?.length) return threadIdFromMessageId(message.references[0]);
  if (message.inReplyTo) return threadIdFromMessageId(message.inReplyTo);
  if (message.messageId) return threadIdFromMessageId(message.messageId);
  return null;
}

// Our outbound Message-IDs look like `<coworker.<threadId>.<turn>@domain>`.
// Extract the threadId segment; for foreign ids, hash-free fall back to the
// local-part so a thread is still stable per original message.
function threadIdFromMessageId(messageId) {
  const local = messageId.split('@')[0];
  const m = /^coworker\.([^.]+)\./.exec(local);
  return m ? m[1] : local;
}

/**
 * Mint a new outbound Message-ID bound to a thread + turn so replies chain back
 * to the same thread deterministically.
 */
export function newMessageId(threadId, turn, domain) {
  return `<coworker.${threadId}.${turn}@${domain}>`;
}

/**
 * Build outbound threading headers (Message-ID / In-Reply-To / References) so the
 * advisor's mail client keeps everything in one conversation.
 */
export function buildThreadingHeaders({ threadId, turn, domain, inReplyToMessageId, references = [] }) {
  const messageId = newMessageId(threadId, turn, domain);
  const refChain = [...references];
  if (inReplyToMessageId && !refChain.includes(inReplyToMessageId)) refChain.push(inReplyToMessageId);
  return {
    'Message-ID': messageId,
    ...(inReplyToMessageId ? { 'In-Reply-To': inReplyToMessageId } : {}),
    ...(refChain.length ? { References: refChain.map(wrapAngle).join(' ') } : {}),
  };
}

function wrapAngle(id) {
  return id.startsWith('<') ? id : `<${id}>`;
}

/**
 * Allowlist gate. Unrecognized senders must bounce before any model or data
 * access. Returns { allowed, advisor } — advisor is the matched record or null.
 * Matching is case-insensitive on the full email address.
 */
export function checkAllowlist(fromAddress, advisors) {
  const from = (fromAddress || '').trim().toLowerCase();
  const advisor = (advisors || []).find((a) => (a.email || '').trim().toLowerCase() === from) || null;
  return { allowed: Boolean(advisor), advisor };
}

/**
 * Normalize a reply subject: ensure a single "Re:" prefix.
 */
export function replySubject(subject) {
  const base = (subject || '').replace(/^(\s*re:\s*)+/i, '').trim();
  return `Re: ${base}`;
}
