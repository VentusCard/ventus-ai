import assert from 'node:assert/strict';
import test from 'node:test';
import { createFixturePortfolioProvider } from './portfolio-provider.mjs';
import { createCoworkerStore, createInMemoryBackend } from './store.mjs';
import {
  AGENT_TOOLS,
  findProseFigures,
  createArtifactRegistry,
  createToolbox,
  runAgentTurn,
  splitForwardMove,
  splitLongParagraphs,
} from './agent.mjs';
import { runCoworkerTurn } from './core.mjs';

const provider = createFixturePortfolioProvider();
const advisor = provider.getAdvisors().find((a) => a.id === 'adv_okoro');
const households = advisor.household_ids.map((id) => provider.getHousehold(id)).filter(Boolean);
const clock = () => new Date('2026-02-01T12:00:00.000Z');

function call(name, args = {}) {
  return {
    id: `c_${name}_${Math.random().toString(36).slice(2, 7)}`,
    type: 'function',
    function: { name, arguments: JSON.stringify(args) },
  };
}

/**
 * A gateway that plays a fixed script of agent turns. Every non-agent task
 * returns ok:false so the narration helpers (prep, outreach, summary) take
 * their deterministic fallbacks and the tests stay offline.
 *
 * `sent` captures what the loop actually posted, which is how the artifact
 * tests prove HTML never reached the model.
 */
function scriptedGateway(steps) {
  const sent = [];
  let i = 0;
  return {
    sent,
    stepsRemaining: () => steps.length - i,
    async chatCompletion(req) {
      if (req.task !== 'coworker_agent') {
        return { response: { ok: false, async json() { return {}; } } };
      }
      sent.push(req);
      const step = steps[i++] || { content: '' };
      if (step.gatewayDown) return { response: { ok: false, async json() { return {}; } } };
      return {
        response: {
          ok: true,
          async json() {
            return {
              choices: [
                {
                  message: {
                    content: step.content || '',
                    ...(step.calls ? { tool_calls: step.calls } : {}),
                  },
                },
              ],
            };
          },
        },
      };
    },
  };
}

function runAgent(steps, overrides = {}) {
  const gateway = scriptedGateway(steps);
  const store = createCoworkerStore(createInMemoryBackend());
  return {
    gateway,
    store,
    result: runAgentTurn({
      provider,
      gateway,
      store,
      advisor,
      households,
      threadId: 't_test',
      messageText: 'anything',
      ...overrides,
    }),
  };
}

// ---------------------------------------------------------------------------
// Doing the work
// ---------------------------------------------------------------------------

test('the agent screens the book and attaches the table it was handed', async () => {
  const { result } = runAgent([
    { calls: [call('screen_book', { product: 'travel card' })] },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['One household in your book fits the travel card.'],
          attach: ['art_1'],
          forward_move: 'Want me to draft outreach for them?',
        }),
      ],
    },
  ]);
  const out = await result;

  assert.ok(out, 'agent produced a reply');
  assert.deepEqual(out.agent.tools, ['screen_book', 'compose_reply']);
  assert.equal(out.sections.length, 1);
  assert.match(out.sections[0].heading, /Best fit for Travel Cash Rewards Card/);
  assert.match(out.sections[0].html, /Okafor Household/);
  assert.equal(out.summary, 'agent: screen_book');
});

test('a question about the whole book is answered from the whole book, in one call', async () => {
  const { result } = runAgent([
    { calls: [call('scan_book')] },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Achebe has the most going on, with a child on the way and a home search.'],
          attach: ['art_1'],
        }),
      ],
    },
  ]);
  const out = await result;

  assert.ok(out);
  assert.deepEqual(out.agent.tools, ['scan_book', 'compose_reply']);
  assert.match(out.sections[0].heading, /active across the book/);
});

test('the book scan covers every household and carries no amounts', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });

  const facts = await toolbox.scan_book();

  // A superlative needs the denominator. Answering "who has the most going on"
  // off five of twelve lookups is a guess with evidence attached.
  assert.equal(facts.considered, households.length);
  assert.equal(facts.households.length, households.length);
  assert.deepEqual(findProseFigures(facts.households.flatMap((h) => [...h.life_events, ...h.patterns])), []);
  // Ordered here rather than left to the model, so the answer is defensible.
  const scores = facts.households.map((h) => h.activity_score);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});

test('one turn can answer two questions, which the task switch cannot', async () => {
  const { result } = runAgent([
    {
      calls: [
        call('screen_book', { product: 'high-yield-savings' }),
        call('get_household', { household: 'Nakamura' }),
      ],
    },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Here is the screen, and separately what we hold on Nakamura.'],
          attach: ['art_1', 'art_2'],
        }),
      ],
    },
  ]);
  const out = await result;

  assert.ok(out);
  assert.deepEqual(out.agent.tools, ['screen_book', 'get_household', 'compose_reply']);
  assert.equal(out.sections.length, 2);
  assert.match(out.sections[1].heading, /What we see/);
});

test('a question needing no tools is answered directly rather than routed to the nearest task', async () => {
  const { result } = runAgent([{ content: 'I cover twelve households for you at the moment.' }]);
  const out = await result;

  assert.ok(out);
  assert.deepEqual(out.paragraphs, ['I cover twelve households for you at the moment.']);
  assert.equal(out.sections.length, 0);
  assert.equal(out.summary, 'agent: answered directly');
});

// ---------------------------------------------------------------------------
// Facts, not prose
// ---------------------------------------------------------------------------

test('the screen fact payload carries no dollar figures, so prose has none to restate', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });
  const facts = await toolbox.screen_book({ product: 'travel-card' });

  assert.equal(facts.fits, 1);
  assert.equal(facts.considered, 12);
  assert.equal(facts.ranked_fits[0].household, 'Okafor Household');
  assert.doesNotMatch(JSON.stringify(facts), /\$/, 'no currency in the fact payload');
  assert.equal(facts.attachments.length, 1, 'the money lives behind a handle');
  assert.match(facts.attachments[0].shows, /ranked results/);
  assert.match(artifacts.get(facts.attachments[0].handle).html, /\$/, 'and the table still has it');
});

test('a household panel is headed with whose it is', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });

  const one = await toolbox.get_household({ household: 'Achebe' });
  const two = await toolbox.get_household({ household: 'Lindgren' });
  const headings = [one, two].map((f) => artifacts.get(f.attachments[0].handle).heading);

  assert.deepEqual(headings, ['What we see for Achebe Household', 'What we see for Lindgren Household']);
  assert.equal(new Set(headings).size, 2, 'two panels in one reply must be tellable apart');
});

test('a tool result only advertises what is actually attached', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });

  const facts = await toolbox.get_household({ household: 'Nakamura' });
  const advertised = facts.attachments.map((a) => a.handle);

  assert.equal(advertised.length, 1);
  for (const value of Object.values(facts)) {
    const serialized = JSON.stringify(value);
    if (!serialized) continue;
    for (const handle of artifacts.handles()) {
      if (advertised.includes(handle)) continue;
      assert.doesNotMatch(serialized, new RegExp(handle), 'no handle outside the attachments list');
    }
  }
  // The field that used to invite "the table below has their spending pillars"
  // is gone, because nothing ever rendered it.
  assert.equal(facts.observed_spend, undefined);
});

test('the model is shown evidence with the amounts taken out, and the advisor is shown all of it', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });

  const facts = await toolbox.get_household({ household: 'Okafor' });

  // Every figure that leaked into prose and cost a turn came from this field.
  // A rule the model cannot follow is a trap, and the fix is not to repeat the
  // rule louder but to stop handing it the material.
  assert.deepEqual(findProseFigures(facts.what_we_hold), []);
  // The material that makes an evidence-first sentence possible survives.
  assert.ok(facts.what_we_hold.some((b) => /9 flights and 7 lodging bookings/.test(b)));
  assert.ok(facts.what_we_hold.some((b) => /cash sitting uninvested and a monthly surplus/.test(b)));

  const panel = artifacts.get(facts.attachments[0].handle).html;
  assert.match(panel, /\$18,400/, 'the advisor still sees the amounts');
  assert.match(panel, /\$40,000/);
});

test('a household that spends more than it earns says so without an amount', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });

  const facts = await toolbox.get_household({ household: 'Alvarez' });
  const posture = facts.what_we_hold.find((b) => /^Posture is/.test(b));

  assert.equal(posture, 'Posture is juggler, with more going out than coming in.');
  assert.deepEqual(findProseFigures(facts.what_we_hold), []);
});

test('prep notes are attached, not handed to the model to rewrite', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });

  const facts = await toolbox.prep_household({ household: 'Okafor' });

  // The field this replaced was prose dense with figures, under a name that
  // told the model to restate it. Every prep turn then tripped the no-figures
  // rule and the router answered, which is why the demo never saw one.
  assert.equal(facts.prep_notes_to_rewrite, undefined);

  // One panel, not two. The evidence is already inside the notes, and a reply
  // carrying both produced "the prep notes are in the notes below, and the
  // detail is in the detail below".
  const headings = facts.attachments.map((a) => artifacts.get(a.handle).heading);
  assert.deepEqual(headings, ['Prep notes for Okafor Household']);
  assert.match(facts.attachments[0].shows, /prep notes/);
});

test('a prep reply that only points at the notes is sendable', async () => {
  const { result } = runAgent([
    { calls: [call('prep_household', { household: 'Okafor' })] },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Here is what I would go in with for Okafor, in the notes below.'],
          attach: ['art_1'],
        }),
      ],
    },
  ]);
  const out = await result;

  assert.ok(out, 'prep no longer costs the agent the turn');
  assert.equal(out.sections.length, 1);
  assert.match(out.sections[0].heading, /Prep notes for Okafor/);
});

test('rendered HTML never enters the model transcript', async () => {
  const { gateway, result } = runAgent([
    { calls: [call('screen_book', { product: 'travel-card' })] },
    { calls: [call('compose_reply', { paragraphs: ['Done.'], attach: ['art_1'] })] },
  ]);
  await result;

  const transcript = JSON.stringify(gateway.sent[gateway.sent.length - 1].messages);
  assert.doesNotMatch(transcript, /<table/i);
  assert.doesNotMatch(transcript, /<td/i);
  assert.match(transcript, /art_1/, 'the handle is all the model sees');
});

// ---------------------------------------------------------------------------
// Figures stay in the attachments
// ---------------------------------------------------------------------------

test('a figure in prose is caught whether or not a tool returned it', () => {
  assert.deepEqual(findProseFigures(['Okafor stands to gain about $4,200 a year.']), ['$4,200']);
  // This one is sourced, and still not allowed: quoting it in prose puts it
  // beside a table of modelled benefit, and the advisor has to work out that
  // two correct numbers are measuring different things.
  assert.deepEqual(findProseFigures(['They have roughly $45,000 idle.']), ['$45,000']);
});

test('percentages and basis points are held to the same standard', () => {
  assert.deepEqual(findProseFigures(['Their account earns 0.5%.']), ['0.5%']);
  assert.deepEqual(findProseFigures(['We can get them 35 basis points.']), ['35 basis points']);
});

test('prose that counts things is not mistaken for prose that quotes money', () => {
  assert.deepEqual(
    findProseFigures([
      'Nine flights and seven lodging bookings over 12 months, across 3 airlines.',
    ]),
    [],
    'only money and rates belong in the attachments'
  );
});

test('an unsourced figure declines the whole turn rather than editing the sentence', async () => {
  const { result } = runAgent([
    { calls: [call('screen_book', { product: 'travel-card' })] },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Okafor is worth about $12,400 a year to you.'],
          attach: ['art_1'],
        }),
      ],
    },
  ]);
  assert.equal(await result, null, 'declined, so the router answers instead');
});

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

test('an invented household name is refused with the valid list, not guessed at', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });
  const facts = await toolbox.get_household({ household: 'Pemberton' });

  assert.match(facts.error, /No household matching "Pemberton"/);
  assert.ok(facts.valid_households.includes('Okafor Household'));
  assert.equal(artifacts.size(), 0, 'nothing was rendered for a household that does not exist');
});

test('a bad tool argument comes back as a correctable fact, and the loop recovers', async () => {
  const { result } = runAgent([
    { calls: [call('get_household', { household: 'Pemberton' })] },
    { calls: [call('get_household', { household: 'Okafor' })] },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Here is what we hold on Okafor Household.'],
          attach: ['art_1'],
        }),
      ],
    },
  ]);
  const out = await result;

  assert.ok(out, 'the wrong name cost a step, not the reply');
  assert.deepEqual(out.agent.tools, ['get_household', 'get_household', 'compose_reply']);
  assert.equal(out.householdId, 'hh_okafor');
});

test('drafting for a household outside the fitting set explains itself instead of drafting', async () => {
  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts,
  });
  const facts = await toolbox.draft_outreach({
    product: 'travel-card',
    households: ['Alvarez'],
  });

  assert.match(facts.error, /not in the fitting set/);
  assert.deepEqual(facts.held_back_detail, [
    { household: 'Alvarez Household', reason: 'recent overdraft activity' },
  ]);
  assert.deepEqual(facts.fitting_instead, ['Okafor Household']);
  assert.equal(artifacts.size(), 0, 'no draft was written for someone who does not qualify');
});

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------

test('an invented artifact handle drops out rather than becoming an empty section', async () => {
  const { result } = runAgent([
    { calls: [call('screen_book', { product: 'travel-card' })] },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['One fits.'],
          attach: ['art_1', 'art_99'],
        }),
      ],
    },
  ]);
  const out = await result;

  assert.equal(out.sections.length, 1);
  assert.match(out.sections[0].heading, /Best fit/);
});

test('attachment order is the order the model asked for', async () => {
  const { result } = runAgent([
    {
      calls: [
        call('get_household', { household: 'Okafor' }),
        call('screen_book', { product: 'travel-card' }),
      ],
    },
    { calls: [call('compose_reply', { paragraphs: ['Both.'], attach: ['art_2', 'art_1'] })] },
  ]);
  const out = await result;

  assert.match(out.sections[0].heading, /Best fit/);
  assert.match(out.sections[1].heading, /What we see/);
});

// ---------------------------------------------------------------------------
// Offers: what a bare "yes" will execute
// ---------------------------------------------------------------------------

test('an offer becomes an executable intent built from resolved ids, not from model text', async () => {
  const { result } = runAgent([
    { calls: [call('get_household', { household: 'Okafor' })] },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Here is the read on Okafor.'],
          attach: ['art_1'],
          forward_move: 'Want me to prep you for a meeting with them?',
          offer_action: 'prep_household',
          offer_households: ['Okafor'],
        }),
      ],
    },
  ]);
  const out = await result;

  assert.deepEqual(out.offer.intent, {
    task_type: 'prep',
    household_id: 'hh_okafor',
    product_id: null,
    household_ids: null,
  });
  assert.equal(out.offer.message_text, 'Okafor Household');
});

test('an offer naming someone outside the book is dropped, not executed', async () => {
  const { result } = runAgent([
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Happy to help.'],
          forward_move: 'Want me to prep you for Pemberton?',
          offer_action: 'prep_household',
          offer_households: ['Pemberton'],
        }),
      ],
    },
  ]);
  const out = await result;

  assert.equal(out.offer, null, 'a wrong "yes" is worse than an extra question');
  assert.match(out.forwardMove, /Pemberton/, 'the prose is still the model\'s');
});

test('an outreach offer carries the product forward from the screen', async () => {
  const { result } = runAgent([
    { calls: [call('screen_book', { product: 'travel-card' })] },
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['One household fits.'],
          attach: ['art_1'],
          forward_move: 'Want me to draft outreach for Okafor?',
          offer_action: 'draft_outreach',
          offer_households: ['Okafor'],
        }),
      ],
    },
  ]);
  const out = await result;

  assert.equal(out.offer.intent.task_type, 'compose_outreach');
  assert.equal(out.offer.intent.product_id, 'travel-card');
  assert.deepEqual(out.offer.intent.household_ids, ['hh_okafor']);
});

// ---------------------------------------------------------------------------
// Declining
// ---------------------------------------------------------------------------

test('running out of steps declines the turn instead of sending a fragment', async () => {
  const { result } = runAgent(
    [
      { calls: [call('get_household', { household: 'Okafor' })] },
      { calls: [call('get_household', { household: 'Bianchi' })] },
    ],
    { maxSteps: 2 }
  );
  assert.equal(await result, null);
});

test('the final step is forced to compose, so a gathering model still writes an email', async () => {
  const gateway = scriptedGateway([
    { calls: [call('get_household', { household: 'Okafor' })] },
    { calls: [call('compose_reply', { paragraphs: ['Here is the read.'] })] },
  ]);
  await runAgentTurn({
    provider,
    gateway,
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    messageText: 'okafor',
    maxSteps: 2,
  });

  assert.equal(gateway.sent[0].tool_choice, 'auto');
  assert.deepEqual(gateway.sent[1].tool_choice, {
    type: 'function',
    function: { name: 'compose_reply' },
  });
});

test('an empty compose declines rather than sending a blank email', async () => {
  const { result } = runAgent([
    { calls: [call('compose_reply', { paragraphs: ['', '   '] })] },
  ]);
  assert.equal(await result, null);
});

test('a gateway failure declines the turn', async () => {
  const { result } = runAgent([{ gatewayDown: true }]);
  assert.equal(await result, null);
});

// Every decline hands the turn to the router, which answers well enough that a
// broken agent path is invisible in the output. Four rows of a twenty-message
// comparison fell back and there was no way to tell a guardrail from an outage.
test('each way of declining reports which one it was', async () => {
  const reasons = [];
  const onDecline = (r) => reasons.push(r);

  await runAgent([{ gatewayDown: true }], { onDecline }).result;
  await runAgent([{ calls: [call('compose_reply', { paragraphs: ['  '] })] }], { onDecline })
    .result;
  await runAgent([{ content: '' }], { onDecline }).result;
  await runAgent(
    [
      { calls: [call('get_household', { household: 'Okafor' })] },
      { calls: [call('get_household', { household: 'Bianchi' })] },
    ],
    { maxSteps: 2, onDecline }
  ).result;

  assert.deepEqual(reasons, [
    'gateway_http_undefined',
    'compose_reply_had_no_paragraphs',
    'no_tool_call_and_no_content',
    'step_budget_exhausted_after_2',
  ]);
});

test('prose promising a panel with nothing attached declines rather than sending the promise', async () => {
  const reasons = [];
  const { result } = runAgent(
    [
      { calls: [call('screen_book', { product: 'travel-card' })] },
      {
        calls: [
          call('compose_reply', {
            paragraphs: ['One household fits. You can see the ranking in the table below.'],
            attach: [],
          }),
        ],
      },
    ],
    { onDecline: (r) => reasons.push(r) }
  );

  assert.equal(await result, null);
  assert.deepEqual(reasons, ['promised_but_not_attached: table below']);
});

test('"below" in its ordinary sense is not mistaken for a promised panel', async () => {
  const { result } = runAgent([
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Their checking buffer sits below what the rule allows, so they are held back.'],
          attach: [],
        }),
      ],
    },
  ]);
  assert.ok(await result, 'a reply with no attachment and no promise is fine');
});

// ---------------------------------------------------------------------------
// One next step, one rendering
// ---------------------------------------------------------------------------

test('a next step buried in the prose is lifted out so every reply renders the same', () => {
  // Row 4 of the comparison, verbatim: the offer arrived as the last sentence
  // of a paragraph, so it rendered as prose while other rows rendered "Next:".
  const { paragraphs, forwardMove } = splitForwardMove(
    [
      'I have drafted outreach for Okafor Household on the Travel Cash Rewards Card. Want me to draft outreach for other households?',
    ],
    null
  );

  assert.deepEqual(paragraphs, [
    'I have drafted outreach for Okafor Household on the Travel Cash Rewards Card.',
  ]);
  assert.equal(forwardMove, 'Want me to draft outreach for other households?');
});

test('a reply that offers something twice keeps the one the offer was built from', () => {
  // Row 18, verbatim. Both were generic, and it rendered both.
  const { paragraphs, forwardMove } = splitForwardMove(
    ['Glad to help! What would you like to do next?'],
    'What can I help with?'
  );

  assert.deepEqual(paragraphs, ['Glad to help!']);
  assert.equal(forwardMove, 'What can I help with?');
});

test('a reply that is only a question keeps it, rather than emptying the body', () => {
  const { paragraphs, forwardMove } = splitForwardMove(['Which household do you mean?'], null);

  assert.deepEqual(paragraphs, ['Which household do you mean?']);
  assert.equal(forwardMove, null);
});

test('a declared next step and no trailing question is left alone', () => {
  const { paragraphs, forwardMove } = splitForwardMove(
    ['Okafor is the strongest fit.'],
    'Want me to draft outreach for Okafor?'
  );

  assert.deepEqual(paragraphs, ['Okafor is the strongest fit.']);
  assert.equal(forwardMove, 'Want me to draft outreach for Okafor?');
});

test('an eight-sentence answer to a compound question is broken up', () => {
  const wall = [
    'Achebe is expecting a child. They are also shopping for a home. Their savings have been rising. Lindgren is renovating. They have paid an architect. Their posture is balanced.',
  ];
  const out = splitLongParagraphs(wall);

  // Chunked, not subject-aware: the split is mechanical, and the prompt is what
  // asks for a paragraph per subject. This only guarantees nobody is handed an
  // unbroken block, and that nothing is lost doing it.
  assert.equal(out.length, 2);
  assert.match(out[0], /^Achebe is expecting a child\./);
  assert.match(out[1], /^Lindgren is renovating\./);
  assert.equal(out.join(' '), wall[0]);
});

test('a short paragraph is not broken up', () => {
  const fine = ['Okafor fits the travel card. Alvarez was held back.'];
  assert.deepEqual(splitLongParagraphs(fine), fine);
});

test('the reply carries one next step whichever way the model wrote it', async () => {
  const { result } = runAgent([
    {
      calls: [
        call('compose_reply', {
          paragraphs: ['Nakamura is renovating. Want me to prep you for a meeting with them?'],
          forward_move: null,
        }),
      ],
    },
  ]);
  const out = await result;

  assert.deepEqual(out.paragraphs, ['Nakamura is renovating.']);
  assert.equal(out.forwardMove, 'Want me to prep you for a meeting with them?');
});

test('a decline on a quoted figure names the figure, so the cause is readable', async () => {
  const reasons = [];
  const { result } = runAgent(
    [
      { calls: [call('screen_book', { product: 'travel-card' })] },
      {
        calls: [
          call('compose_reply', {
            paragraphs: ['Okafor stands to gain $506 net, at 3% on travel.'],
            attach: ['art_1'],
          }),
        ],
      },
    ],
    { onDecline: (r) => reasons.push(r) }
  );

  assert.equal(await result, null);
  assert.deepEqual(reasons, ['figure_in_prose: $506, 3%']);
});

test('reporting a decline is never the thing that fails a turn', async () => {
  const { result } = runAgent([{ gatewayDown: true }], {
    onDecline: () => {
      throw new Error('reporter blew up');
    },
  });
  assert.equal(await result, null, 'still a clean hand-back to the router');
});

test('an answered turn reports no decline at all', async () => {
  const reasons = [];
  const { result } = runAgent(
    [{ calls: [call('compose_reply', { paragraphs: ['Here is the read.'] })] }],
    { onDecline: (r) => reasons.push(r) }
  );

  assert.ok(await result);
  assert.deepEqual(reasons, []);
});

test('every tool the prompt advertises exists on the toolbox', () => {
  const toolbox = createToolbox({
    provider,
    gateway: scriptedGateway([]),
    store: createCoworkerStore(createInMemoryBackend()),
    advisor,
    households,
    threadId: 't',
    artifacts: createArtifactRegistry(),
  });
  for (const t of AGENT_TOOLS) {
    const name = t.function.name;
    if (name === 'compose_reply') continue; // handled by the loop, not the toolbox
    assert.equal(typeof toolbox[name], 'function', `${name} is callable`);
  }
});

// ---------------------------------------------------------------------------
// Integration: the flag, and the fallback
// ---------------------------------------------------------------------------

function rawEmail({ subject, body, messageId = '<a1@mail>' }) {
  return [
    `From: dana.okoro@ventusai.com`,
    `To: coworker@ventusai.com`,
    `Subject: ${subject}`,
    `Message-ID: ${messageId}`,
    '',
    body,
  ].join('\n');
}

/** Intent classifier + agent script on one gateway, so fallback is observable. */
function bothPaths({ intent, agentSteps }) {
  let i = 0;
  return {
    async chatCompletion({ task }) {
      if (task === 'coworker_intent_classification') {
        return {
          response: {
            ok: true,
            async json() {
              return {
                choices: [
                  { message: { tool_calls: [{ function: { arguments: JSON.stringify(intent) } }] } },
                ],
              };
            },
          },
        };
      }
      if (task === 'coworker_agent') {
        const step = agentSteps[i++] || { gatewayDown: true };
        if (step.gatewayDown) return { response: { ok: false, async json() { return {}; } } };
        return {
          response: {
            ok: true,
            async json() {
              return {
                choices: [
                  { message: { content: step.content || '', ...(step.calls ? { tool_calls: step.calls } : {}) } },
                ],
              };
            },
          },
        };
      }
      return { response: { ok: false, async json() { return {}; } } };
    },
  };
}

test('with the flag off the agent is never consulted', async () => {
  let agentCalls = 0;
  const gateway = {
    async chatCompletion({ task }) {
      if (task === 'coworker_agent') agentCalls++;
      if (task === 'coworker_intent_classification') {
        return {
          response: {
            ok: true,
            async json() {
              return {
                choices: [
                  {
                    message: {
                      tool_calls: [
                        {
                          function: {
                            arguments: JSON.stringify({
                              task_type: 'audience_build',
                              product_id: 'travel-card',
                              confidence: 0.9,
                            }),
                          },
                        },
                      ],
                    },
                  },
                ],
              };
            },
          },
        };
      }
      return { response: { ok: false, async json() { return {}; } } };
    },
  };

  const res = await runCoworkerTurn({
    raw: rawEmail({ subject: 'who fits', body: 'who should I pitch the travel card to' }),
    provider,
    gateway,
    store: createCoworkerStore(createInMemoryBackend()),
    clock,
  });

  assert.equal(agentCalls, 0);
  assert.equal(res.via, 'router');
  assert.equal(res.task.task_type, 'audience_build');
});

test('with the flag on the agent answers and the reply carries its transcript', async () => {
  const res = await runCoworkerTurn({
    raw: rawEmail({ subject: 'who fits', body: 'who should I pitch the travel card to' }),
    provider,
    gateway: bothPaths({
      intent: { task_type: 'audience_build', product_id: 'travel-card', confidence: 0.9 },
      agentSteps: [
        { calls: [call('screen_book', { product: 'travel-card' })] },
        {
          calls: [
            call('compose_reply', {
              paragraphs: ['One household in your book fits the travel card.'],
              attach: ['art_1'],
            }),
          ],
        },
      ],
    }),
    store: createCoworkerStore(createInMemoryBackend()),
    clock,
    agent: true,
  });

  assert.equal(res.via, 'agent');
  assert.deepEqual(res.agent.tools, ['screen_book', 'compose_reply']);
  assert.match(res.reply.html, /Hi Dana,/);
  assert.match(res.reply.html, /Okafor Household/);
  // Stored under a known task type so a later turn can still find the audience.
  assert.equal(res.task.task_type, 'audience_build');
});

test('when the agent declines, the router still answers the advisor', async () => {
  const res = await runCoworkerTurn({
    raw: rawEmail({ subject: 'who fits', body: 'who should I pitch the travel card to' }),
    provider,
    gateway: bothPaths({
      intent: { task_type: 'audience_build', product_id: 'travel-card', confidence: 0.9 },
      agentSteps: [{ gatewayDown: true }],
    }),
    store: createCoworkerStore(createInMemoryBackend()),
    clock,
    agent: true,
  });

  assert.equal(res.allowed, true);
  assert.equal(res.via, 'router');
  assert.match(res.reply.html, /Best fit for/);
  // via:'router' alone cannot distinguish a turn the agent handed back from one
  // it was never asked to take, and both read as a working system.
  assert.match(res.agentDecline, /^gateway_http_/);
});

test('a turn the agent answers carries no decline, and one it never saw carries none either', async () => {
  const shared = {
    raw: rawEmail({ subject: 'nakamura', body: 'what do we know about Nakamura' }),
    provider,
    store: createCoworkerStore(createInMemoryBackend()),
    clock,
  };

  const answered = await runCoworkerTurn({
    ...shared,
    store: createCoworkerStore(createInMemoryBackend()),
    gateway: bothPaths({
      intent: { task_type: 'evidence', household_id: 'hh_nakamura', confidence: 0.9 },
      agentSteps: [
        { calls: [call('compose_reply', { paragraphs: ['Here is the read on Nakamura.'] })] },
      ],
    }),
    agent: true,
  });
  assert.equal(answered.via, 'agent');
  assert.equal(answered.agentDecline, null);

  const neverAsked = await runCoworkerTurn({
    ...shared,
    store: createCoworkerStore(createInMemoryBackend()),
    gateway: bothPaths({
      intent: { task_type: 'evidence', household_id: 'hh_nakamura', confidence: 0.9 },
      agentSteps: [],
    }),
    agent: false,
  });
  assert.equal(neverAsked.via, 'router');
  assert.equal(neverAsked.agentDecline, null);
});

test('a bare yes to a standing offer bypasses the agent entirely', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  let agentCalls = 0;
  const gateway = {
    async chatCompletion({ task }) {
      if (task === 'coworker_agent') agentCalls++;
      return { response: { ok: false, async json() { return {}; } } };
    },
  };

  await store.upsertThread({
    thread_id: 't_offer',
    advisor_id: advisor.id,
    pending_offer: {
      intent: {
        task_type: 'compose_outreach',
        product_id: 'travel-card',
        household_id: null,
        household_ids: null,
      },
      label: 'draft outreach for Okafor Household',
      message_text: '',
    },
    updated_at: '2026-02-01T11:00:00.000Z',
  });

  const res = await runCoworkerTurn({
    raw: [
      `From: dana.okoro@ventusai.com`,
      `To: coworker@ventusai.com`,
      `Subject: Re: who fits`,
      `Message-ID: <b2@mail>`,
      `References: <coworker.t_offer.1@ventusai.com>`,
      '',
      'yes please',
    ].join('\n'),
    provider,
    gateway,
    store,
    clock,
    agent: true,
  });

  assert.equal(agentCalls, 0, 'a promise made in specific words is not reinterpreted');
  assert.equal(res.acceptedOffer, true);
  assert.equal(res.via, 'router');
});

// ---------------------------------------------------------------------------
// Prose that promises an attachment gets one
//
// Both of these come from reading twenty real replies rather than from the
// design: the model narrated a table it never attached, and it recapped a
// thread that did not exist.
// ---------------------------------------------------------------------------

test('a tool result is attached even when the model stops calling tools', async () => {
  const { result } = runAgent([
    { calls: [call('screen_book', { product: 'travel' })] },
    // Prose with no compose_reply. The model has abandoned its turn to choose
    // attachments, and it has already told the advisor a table exists.
    { content: 'Okafor looks like the strongest fit. The table below has the detail.' },
  ]);
  const rendered = await result;

  assert.ok(rendered, 'a direct answer is still an answer');
  const attached = rendered.sections.map((s) => s.html).join('');
  assert.match(attached, /<table/, 'the table it referred to is underneath the text');
  assert.match(attached, /\$/, 'and the figures the prose deferred are visible');
});

test('no attachment is invented when no tool produced one', async () => {
  const { result } = runAgent([{ content: 'I do not have access to account numbers.' }]);
  const rendered = await result;

  assert.ok(rendered);
  assert.deepEqual(rendered.sections, [], 'nothing to attach, nothing attached');
});

// ---------------------------------------------------------------------------
// A reference to nothing
//
// "Do that again but shorter" as the first message in a thread. The agent
// screened the travel card and returned a full ranked table; no product had
// been named and no earlier turn existed. The router got this one right.
// ---------------------------------------------------------------------------

test('an empty thread is stated in context, not left out', async () => {
  const { gateway, result } = runAgent(
    [{ calls: [call('compose_reply', { paragraphs: ['Nothing to shorten yet.'] })] }],
    { messageText: 'Do that again but shorter.', priorTurns: [] }
  );
  await result;

  const system = gateway.sent[0].messages[0].content;
  assert.match(system, /Recent conversation: none/);
  assert.match(system, /first message in the thread/);
});

test('a prior screen is offered as the referent when there is one', async () => {
  const { gateway, result } = runAgent(
    [{ calls: [call('compose_reply', { paragraphs: ['Here it is, shorter.'] })] }],
    {
      messageText: 'Do that again but shorter.',
      lastAudience: {
        product: { id: 'travel-card', name: 'Travel Cash Rewards Card' },
        candidates: [{ household_name: 'Okafor Household' }],
      },
    }
  );
  await result;

  const system = gateway.sent[0].messages[0].content;
  assert.match(system, /Already screened in this thread: Travel Cash Rewards Card/);
});
