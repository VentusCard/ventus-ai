import { executeHostedDecision } from "../backend/shared/hosted-decision-runtime.mjs";
import type { DecisionRunRequest, DecisionRunResult } from "../src/lib/decision-contract.js";

export function executeDecisionRun({
  tenantId,
  request,
  now = new Date(),
}: {
  tenantId: string;
  request: DecisionRunRequest;
  now?: Date;
}): DecisionRunResult {
  return executeHostedDecision({ tenantId, body: request, now }) as DecisionRunResult;
}
