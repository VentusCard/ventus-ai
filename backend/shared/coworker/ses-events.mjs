// backend/shared/coworker/ses-events.mjs
//
// Policy for turning SES delivery events into suppressions. Pure and
// dependency-free so the whole matrix is testable offline.
//
// What suppresses, and what deliberately does not:
//
//   Complaint            -> scope all. Someone pressed "this is spam".
//   Bounce/Permanent     -> scope all. The mailbox does not exist.
//   Bounce/Transient     -> nothing. Full mailbox, greylisting, throttling.
//   Bounce/Undetermined  -> nothing. Ambiguous, and over-suppressing a real
//                           advisor is its own outage.
//   Reject               -> nothing. SES refused the send (e.g. virus scan);
//                           the recipient never entered into it.
//   DeliveryDelay        -> nothing, but reported. This is the signal that a
//                           recipient gateway is greylisting us, which from
//                           the recipient's side is indistinguishable from
//                           mail that never arrived.

/**
 * Decide what one SES notification means, per recipient.
 *
 * @param {object} notification  parsed SES event (config-set or SNS shape)
 * @returns {{kind:string, email:string, suppress:boolean, reason:string}[]}
 */
export function planSuppressions(notification) {
  // Config-set event destinations use `eventType`; the older per-identity SNS
  // notifications use `notificationType`. Both shapes reach this topic.
  const kind = String(notification?.eventType || notification?.notificationType || '').trim();

  if (kind === 'Complaint') {
    const complaint = notification.complaint || {};
    const feedback = complaint.complaintFeedbackType || 'unspecified';
    return recipients(complaint.complainedRecipients).map((email) => ({
      kind,
      email,
      suppress: true,
      reason: `complaint:${feedback}`,
    }));
  }

  if (kind === 'Bounce') {
    const bounce = notification.bounce || {};
    const type = bounce.bounceType || 'Undetermined';
    const subType = bounce.bounceSubType || 'General';
    const permanent = type === 'Permanent';
    return recipients(bounce.bouncedRecipients).map((email) => ({
      kind,
      email,
      suppress: permanent,
      reason: permanent ? `bounce:${subType}` : `bounce_${String(type).toLowerCase()}:${subType}`,
    }));
  }

  if (kind === 'DeliveryDelay') {
    const delay = notification.deliveryDelay || {};
    return recipients(delay.delayedRecipients).map((email) => ({
      kind,
      email,
      suppress: false,
      reason: `delivery_delay:${delay.delayType || 'unspecified'}`,
    }));
  }

  if (kind === 'Reject') {
    return [
      {
        kind,
        email: '',
        suppress: false,
        reason: `reject:${notification.reject?.reason || 'unspecified'}`,
      },
    ];
  }

  return kind ? [{ kind, email: '', suppress: false, reason: 'unhandled_event_type' }] : [];
}

function recipients(list) {
  return (Array.isArray(list) ? list : [])
    .map((r) => String(r?.emailAddress || '').trim())
    .filter(Boolean);
}
