import assert from 'node:assert/strict';
import test from 'node:test';
import { planSuppressions } from './ses-events.mjs';

test('a spam complaint suppresses every complained recipient outright', () => {
  const actions = planSuppressions({
    eventType: 'Complaint',
    complaint: {
      complaintFeedbackType: 'abuse',
      complainedRecipients: [{ emailAddress: 'a@bank.com' }, { emailAddress: 'b@bank.com' }],
    },
  });
  assert.equal(actions.length, 2);
  for (const action of actions) {
    assert.equal(action.suppress, true);
    assert.equal(action.reason, 'complaint:abuse');
  }
});

test('a permanent bounce suppresses, a transient one does not', () => {
  const permanent = planSuppressions({
    eventType: 'Bounce',
    bounce: {
      bounceType: 'Permanent',
      bounceSubType: 'NoEmail',
      bouncedRecipients: [{ emailAddress: 'gone@bank.com' }],
    },
  });
  assert.deepEqual(permanent, [
    { kind: 'Bounce', email: 'gone@bank.com', suppress: true, reason: 'bounce:NoEmail' },
  ]);

  // A full mailbox or a throttling gateway is not an opt-out. Suppressing on a
  // transient bounce would mute a real advisor for good.
  const transient = planSuppressions({
    eventType: 'Bounce',
    bounce: {
      bounceType: 'Transient',
      bounceSubType: 'MailboxFull',
      bouncedRecipients: [{ emailAddress: 'busy@bank.com' }],
    },
  });
  assert.equal(transient[0].suppress, false);
  assert.equal(transient[0].reason, 'bounce_transient:MailboxFull');
});

test('an undetermined bounce does not suppress', () => {
  const actions = planSuppressions({
    eventType: 'Bounce',
    bounce: { bounceType: 'Undetermined', bouncedRecipients: [{ emailAddress: 'x@bank.com' }] },
  });
  assert.equal(actions[0].suppress, false);
});

test('a delivery delay is reported but never suppresses', () => {
  // This is the greylisting case: mail is held for hours and looks to the
  // recipient like it never arrived. Worth surfacing, not worth opting out.
  const actions = planSuppressions({
    eventType: 'DeliveryDelay',
    deliveryDelay: {
      delayType: 'IPFailure',
      delayedRecipients: [{ emailAddress: 'slow@bank.com' }],
    },
  });
  assert.deepEqual(actions, [
    {
      kind: 'DeliveryDelay',
      email: 'slow@bank.com',
      suppress: false,
      reason: 'delivery_delay:IPFailure',
    },
  ]);
});

test('a reject is about our send, not the recipient, so nothing is suppressed', () => {
  const actions = planSuppressions({ eventType: 'Reject', reject: { reason: 'Bad content' } });
  assert.equal(actions.length, 1);
  assert.equal(actions[0].suppress, false);
  assert.equal(actions[0].email, '');
});

test('the legacy notificationType shape is handled alongside eventType', () => {
  const actions = planSuppressions({
    notificationType: 'Complaint',
    complaint: { complainedRecipients: [{ emailAddress: 'a@bank.com' }] },
  });
  assert.equal(actions[0].suppress, true);
  assert.equal(actions[0].reason, 'complaint:unspecified');
});

test('unknown and empty events produce no suppressions', () => {
  const unknown = planSuppressions({ eventType: 'Open' });
  assert.deepEqual(unknown, [
    { kind: 'Open', email: '', suppress: false, reason: 'unhandled_event_type' },
  ]);
  assert.deepEqual(planSuppressions({}), []);
  assert.deepEqual(planSuppressions(null), []);
});

test('recipients with no address are dropped rather than written as blanks', () => {
  const actions = planSuppressions({
    eventType: 'Complaint',
    complaint: { complainedRecipients: [{ emailAddress: '' }, { emailAddress: '  ' }, {}] },
  });
  assert.deepEqual(actions, []);
});
