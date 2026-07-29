# OpenRouter GLM 5.2 With Claude Code

This guide lets a developer run Claude Code against GLM 5.2 through OpenRouter
for low-risk implementation tasks in this repo. Keep the API key local. Do not
commit it.

## When to Use GLM 5.2

Use GLM 5.2 for:

- focused backend QA/reporting updates
- fixture and non-production benchmark work
- docs and runbook maintenance
- small code changes that follow existing local patterns

Do not use GLM 5.2 as the final decision-maker for:

- enterprise readiness architecture
- production API behavior
- customer-facing enrichment taxonomy
- golden-label changes
- AWS, security, SOC 2, PCI, secrets, or deployment judgment

## One-Time Local Setup

From the repo root:

```bash
export OPENROUTER_API_KEY="<your-openrouter-api-key>"
export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
export ANTHROPIC_AUTH_TOKEN="$OPENROUTER_API_KEY"
export ANTHROPIC_MODEL="z-ai/glm-5.2"
export CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=0
```

Why these values:

- OpenRouter's Anthropic Messages endpoint is
  `https://openrouter.ai/api/v1/messages`.
- Claude Code expects the base URL before `/v1/messages`, so the base URL is
  `https://openrouter.ai/api`.
- OpenRouter uses bearer auth, so the OpenRouter key belongs in
  `ANTHROPIC_AUTH_TOKEN`.
- The OpenRouter model slug for GLM 5.2 is `z-ai/glm-5.2`.

## Start Claude Code With GLM

```bash
claude --model z-ai/glm-5.2
```

Inside Claude Code, run the project command:

```text
/project:glm-plaid-reporting
```

If the project command is unavailable, paste the contents of
`.claude/commands/glm-plaid-reporting.md` as the task prompt.

## Recommended First Task

Use GLM for the Plaid golden reporting task because it is useful, bounded, and
does not require changing production behavior:

```text
Use the project command /project:glm-plaid-reporting. Create branch
glm/plaid-benchmark-reporting, implement only the scoped reporting improvements,
run the listed backend validation commands, and open a PR without merging.
```

## Safety Checks Before Opening the PR

Confirm:

- no UI/UX or demo page changes
- no API contract changes
- no production Lambda/AWS config changes
- no secrets read, printed, copied, or committed
- no golden expected labels rewritten unless explicitly requested
- tests and QA scripts were run or failures were explained

## If Direct Claude Code Routing Fails

If Claude Code rejects the gateway config, first verify the environment:

```bash
echo "$ANTHROPIC_BASE_URL"
echo "$ANTHROPIC_MODEL"
test -n "$ANTHROPIC_AUTH_TOKEN" && echo "OpenRouter token is set"
```

Do not print the token. If routing still fails, use OpenRouter with an
OpenAI-compatible coding tool instead, or put a small Anthropic-compatible proxy
in front of OpenRouter. Keep that proxy outside the repo until the team agrees
on a standard developer setup.
