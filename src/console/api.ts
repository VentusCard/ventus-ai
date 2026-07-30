const configuredBaseUrl = String(import.meta.env.VITE_CONSOLE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");
const configuredConnectorBaseUrl = String(import.meta.env.VITE_DEMO_CONNECTOR_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");
const devConnectorBaseUrl = typeof window !== "undefined"
  && window.location.hostname === "dev.d1gaewa028qzng.amplifyapp.com"
  ? "https://8n6lilwaug.execute-api.us-east-2.amazonaws.com/demo/v1/demo"
  : "";

export function consoleApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
}

export function consoleAccessUrl(): string {
  return configuredBaseUrl
    ? `${configuredBaseUrl}/access`
    : "/api/console-access";
}

export function consoleDecisionRunUrl(): string {
  return configuredBaseUrl
    ? `${configuredBaseUrl}/decision-run`
    : "/api/decision-run";
}

export function connectorApiUrl(
  route: "session" | "plaid-transactions" | "salesforce-task",
): string {
  const baseUrl = configuredConnectorBaseUrl || devConnectorBaseUrl;
  if (baseUrl) return `${baseUrl}/${route}`;
  if (route === "session") return "/api/presenter-session";
  if (route === "plaid-transactions") return "/api/plaid-transactions";
  return "/api/salesforce-deliver";
}
