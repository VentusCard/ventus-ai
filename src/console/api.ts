const configuredBaseUrl = String(import.meta.env.VITE_CONSOLE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

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
