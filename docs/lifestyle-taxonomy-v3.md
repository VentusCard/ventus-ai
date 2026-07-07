# Lifestyle Taxonomy v3

## Objective

Lifestyle taxonomy should match the business meaning that downstream bank teams will use for segmentation, CRM routing, and product/service CTAs. The benchmark should therefore align with the production classifier taxonomy instead of keeping a narrower evaluation-only list.

## Decisions

### Promote Family & Community

`Family & Community` is already present in the production classification prompt and in the multi-rail golden fixtures. The Plaid synthetic benchmark now treats childcare, education, baby retail, donations, and community/family-oriented services as first-class `Family & Community` lifestyle signals.

Accepted fallback:

- `Home & Living` remains accepted for family rows during benchmark transition because earlier benchmark versions placed childcare and baby retail there.

Business reason:

- Banks can act on these signals differently from generic household spend. Family-oriented activity can support 529 education, savings goals, family budgeting, insurance review, and branch/advisor conversations.

### Align the Benchmark to Production's 12 Pillars (v3.1)

Earlier benchmark versions scored a narrower 9-value lifestyle list. The production classifier (`ventus-classify-transactions`) uses 12 pillars, and the QA scorer (`qa-validators.mjs`) already supports all 12. The benchmark prompt and the synthetic expectation generator have now been brought in line so we score against the same contract production emits.

Three pillars were missing from the benchmark and are now promoted:

- `Sports & Active Living` — gyms, fitness studios, athletic apparel, sporting goods, outdoor recreation. Previously these (e.g. `EQUINOX GYM MEMBERSHIP`) were labeled `Health & Wellness`.
- `Style & Beauty` — clothing, shoes, accessories, jewelry, hair/nail salons, beauty products. Previously these (e.g. `DRYBAR`, `NORDSTROM`, `SAKS FIFTH AVENUE`) were split between `Health & Wellness` and `Miscellaneous & Unclassified`.
- `Pets` — pet food, veterinary care, pet supplies, grooming, pet services.

Accepted fallback:

- The prior labels (`Health & Wellness`, `Miscellaneous & Unclassified`, `Home & Living`) remain accepted aliases on the affected rows during transition, so a model giving the old answer is not hard-failed before the labels are human-reviewed. These aliases should be removed once the design-key labels are promoted to frozen golden truth.

Synthetic coverage:

- A `pets` group (`CHEWY.COM`, `PETCO`, `BANFIELD PET HOSPITAL`) was added to `generate-plaid-benchmark-manifest.mjs` and attached to the `consumer_baseline` and `family_life_event` personas, so `Pets` is now exercised by 12 expectation rows. A dedicated `Pet Supplies & Veterinary` merchant_category was added to the prompt/merchant-category lists so pet rows are scorable on both axes.
- The production model `google/gemini-2.5-flash` was added to the default benchmarked model set so we compare challengers against what production ships.

Remaining gap:

- These remain synthetic descriptors. Real Plaid Sandbox pulls (`npm run plaid:sandbox:pull`) plus human-reviewed golden labels are still needed before the labels are promoted from `synthetic_design_key_requires_human_review` to frozen golden truth.

Out of scope (intentional):

- `merchant_category` remains a separate evaluation axis per `plaid-benchmark-data-strategy.md` and is not reconciled with the lifestyle pillars.

### Do Not Promote Transportation Yet

`Transportation` is useful analytically, but the current production classifier maps local commuting into `Home & Living / Local Commuting`. The benchmark now follows that existing behavior instead of creating a new top-level category immediately.

Accepted fallback:

- `Miscellaneous & Unclassified` remains accepted for routine local transportation during transition.
- `Travel & Exploration` is not accepted for isolated gas, parking, or rideshare without trip context.

Business reason:

- Routine transportation does not automatically imply travel intent. Treating gas or parking as travel would create noisy travel-card or lifestyle CTAs and weaken CXO confidence in the enrichment layer.

## Prompt Implications

The OpenRouter benchmark prompt now exposes `Family & Community` as an allowed lifestyle category and instructs models to classify childcare, baby retail, education, donations, and community services there.

For transportation, the prompt tells models to classify routine commuting as `Home & Living` unless there is clear trip context such as flights, hotels, lodging, foreign transaction behavior, or travel clusters.

As of v3.1 the prompt also exposes `Sports & Active Living`, `Style & Beauty`, and `Pets`, with tie-breakers that keep fitness out of `Health & Wellness`, apparel/beauty out of `Miscellaneous & Unclassified`, and route pet spend to `Pets`.

## Evaluation Implications

This version intentionally improves semantic alignment before increasing benchmark volume. It should reduce false failures where models correctly identify family signals, while preserving failures where models overcall routine transportation as travel.

The next benchmark pass should answer:

- Whether family rows improve materially once models see `Family & Community` in the allowed taxonomy.
- Whether routine transportation still gets overclassified as travel.
- Whether a later product taxonomy should add `Transportation` as a first-class enterprise analytics pillar.

## Fresh v3 Benchmark Results

After rerunning shortlisted models with the v3 prompt on 100 synthetic Plaid rows, the ranking changed materially:

- GPT-4.1 mini: 86/100, about $0.000278 per transaction, 321ms average latency.
- GLM 5.2: 84/100, about $0.000805 per transaction, 1032ms average latency.
- Qwen3-235B: 82/100, about $0.000067 per transaction, 671ms average latency.
- Gemini 2.5 Flash Lite: 74/100, about $0.000084 per transaction, 434ms average latency.
- DeepSeek V3.1: 71/100, about $0.000217 per transaction, 1620ms average latency.

Interpretation:

- GPT-4.1 mini is the best pilot default after v3 because it has the highest strict pass rate and strong latency.
- Qwen3-235B is the strongest cost-adjusted challenger and should be shadow-tested for lower-risk or batch enrichment paths.
- GLM 5.2 performs well on quality, but the cost and latency profile still make it hard to justify as the default enrichment model.
- DeepSeek V3.1 needs contract-adherence review before promotion because the fresh run emitted invalid negative confidence scores.

## Contract Repair Experiment

The benchmark harness now records model-output contract repairs instead of silently counting malformed scalar values as ordinary enrichment failures.

Current low-risk repair policy:

- Negative confidence scores between `-1` and `0` are treated as sign errors and repaired to their absolute value.
- Confidence scores between `1` and `100` are treated as percentage-style scores and divided by `100`.
- Category values outside the allowed taxonomy are recorded as violations but are not guessed or rewritten.

After rebuilding DeepSeek V3.1 from its raw output with this repair layer, its strict score moved from 71/100 to 91/100. The report now shows this explicitly as `22 repaired / 0 violations`, all from `negative_confidence_sign_repaired`.

Updated interpretation:

- DeepSeek V3.1 is a strong candidate only when guarded by contract repair/validation.
- GPT-4.1 mini remains the cleaner default because it reached 86/100 with no contract repairs.
- Qwen3-235B remains the strongest cost-adjusted no-repair challenger.
