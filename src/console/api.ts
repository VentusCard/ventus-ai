const configuredBaseUrl = String(import.meta.env.VITE_CONSOLE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");
const configuredConnectorBaseUrl = String(import.meta.env.VITE_DEMO_CONNECTOR_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");
const devAmplify = typeof window !== "undefined"
  && window.location.hostname === "dev.d1gaewa028qzng.amplifyapp.com";
const devConsoleBaseUrl = devAmplify
  ? "https://6iaouncicd.execute-api.us-east-2.amazonaws.com/staging/v1/console"
  : "";
const devConnectorBaseUrl = devAmplify
  ? "https://8n6lilwaug.execute-api.us-east-2.amazonaws.com/demo/v1/demo"
  : "";

export function consoleApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
}

export function consoleAccessUrl(): string {
  const baseUrl = configuredBaseUrl || devConsoleBaseUrl;
  return baseUrl
    ? `${baseUrl}/access`
    : "/api/console-access";
}

export function consoleDecisionRunUrl(): string {
  const baseUrl = configuredBaseUrl || devConsoleBaseUrl;
  return baseUrl
    ? `${baseUrl}/decision-run`
    : "/api/decision-run";
}

export function consoleTodayUrl(): string | null {
  const baseUrl = configuredBaseUrl || devConsoleBaseUrl;
  return baseUrl ? `${baseUrl}/today` : null;
}

export function consoleMomentsUrl(decisionId?: string): string | null {
  const baseUrl = configuredBaseUrl || devConsoleBaseUrl;
  if (!baseUrl) return null;
  return decisionId
    ? `${baseUrl}/moments/${encodeURIComponent(decisionId)}`
    : `${baseUrl}/moments`;
}

export function consoleMomentResponseUrl(decisionId: string): string | null {
  const momentUrl = consoleMomentsUrl(decisionId);
  return momentUrl ? `${momentUrl}/responses` : null;
}

export function consoleMomentDeliveryUrl(decisionId: string): string | null {
  const momentUrl = consoleMomentsUrl(decisionId);
  return momentUrl ? `${momentUrl}/deliveries` : null;
}

function consoleEndpoint(path: string): string | null {
  const baseUrl = configuredBaseUrl || devConsoleBaseUrl;
  return baseUrl ? `${baseUrl}${path}` : null;
}

export function consoleResultsUrl(): string | null { return consoleEndpoint('/results'); }
export function consoleGovernanceUrl(): string | null { return consoleEndpoint('/governance'); }
export function consoleGrowthPlaysUrl(): string | null { return consoleEndpoint('/growth-plays'); }
export function consoleGrowthPlayDraftsUrl(): string | null { return consoleEndpoint('/growth-plays/drafts'); }
export function consoleGrowthPlayRegisterUrl(): string | null { return consoleEndpoint('/growth-plays/register'); }
export function consoleGrowthPlayApprovalUrl(protocolId: string): string | null {
  return consoleEndpoint(`/growth-plays/protocols/${encodeURIComponent(protocolId)}/approvals`);
}
export function consoleConnectionsUrl(): string | null { return consoleEndpoint('/connections'); }
export function consoleConnectionTransitionUrl(mappingId: string, action: 'test' | 'approve' | 'activate' | 'revoke'): string | null {
  return consoleEndpoint(`/connections/${encodeURIComponent(mappingId)}/${action}`);
}
export function consoleCoworkerDeliveryUrl(): string | null { return consoleEndpoint('/briefings/deliveries'); }
export function consoleSalesforceOutcomeSyncUrl(): string | null { return consoleEndpoint('/outcomes/salesforce-sync'); }

export function connectorApiUrl(
  route:
    | "session"
    | "plaid-transactions"
    | "salesforce-task"
    | "salesforce-onboarding"
    | "salesforce-deliver"
    | "salesforce-outcomes",
): string {
  const baseUrl = configuredConnectorBaseUrl || devConnectorBaseUrl;
  if (baseUrl) return `${baseUrl}/${route}`;
  if (route === "session") return "/api/presenter-session";
  if (route === "plaid-transactions") return "/api/plaid-transactions";
  if (route === "salesforce-onboarding") return "/api/salesforce-onboarding";
  if (route === "salesforce-outcomes") return "/api/salesforce-outcomes";
  return "/api/salesforce-deliver";
}
