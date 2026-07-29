declare const process: { env: Record<string, string | undefined> };

const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type SupabaseUser = {
  id?: unknown;
  email?: unknown;
  email_confirmed_at?: unknown;
  app_metadata?: {
    tenant_id?: unknown;
    organization_id?: unknown;
    console_role?: unknown;
    console_access_status?: unknown;
    console_entitlements?: unknown;
  };
};

export const CONSOLE_ENTITLEMENTS = [
  "consumer_demo",
  "wealth_demo",
  "growth_console",
  "live_connectors",
] as const;

export type ConsoleEntitlement = typeof CONSOLE_ENTITLEMENTS[number];
export type ConsoleAccessStatus = "active" | "pending";

export type ConsolePrincipal = {
  userId: string;
  email: string;
  tenantId: string;
  organizationId: string;
  role: "operator" | "admin";
  status: ConsoleAccessStatus;
  entitlements: ConsoleEntitlement[];
};

export async function authenticateConsoleUser(request: Request): Promise<ConsolePrincipal | null> {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!accessToken) return null;

  const supabaseUrl = (
    process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || ""
  ).trim().replace(/\/$/, "");
  const supabaseKey = (
    process.env.SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    || ""
  ).trim();
  if (!supabaseUrl || !supabaseKey) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch(() => null);
  if (!response?.ok) return null;

  const user = (await response.json().catch(() => null)) as SupabaseUser | null;
  const userId = typeof user?.id === "string" ? user.id : "";
  const email = typeof user?.email === "string" ? user.email.toLowerCase() : "";
  if (!OPAQUE_ID.test(userId) || !EMAIL.test(email) || !user?.email_confirmed_at) return null;

  const configuredTenant = safeOpaque(user.app_metadata?.tenant_id);
  const tenantId = configuredTenant || tenantForEmail(email);
  const internalPresenter = presenterAllowed(email);
  const configuredActive = user.app_metadata?.console_access_status === "active";
  const configuredEntitlements = safeEntitlements(user.app_metadata?.console_entitlements);
  const entitlements = internalPresenter
    ? [...CONSOLE_ENTITLEMENTS]
    : configuredActive
      ? configuredEntitlements
      : [];
  const role = user.app_metadata?.console_role === "admin" ? "admin" : "operator";
  return {
    userId,
    email,
    tenantId,
    organizationId: safeOpaque(user.app_metadata?.organization_id) || tenantId,
    role,
    status: entitlements.length > 0 ? "active" : "pending",
    entitlements,
  };
}

export async function authorizeConsoleUser(request: Request): Promise<ConsolePrincipal | null> {
  const principal = await authenticateConsoleUser(request);
  return principal?.status === "active" && principal.entitlements.includes("live_connectors")
    ? principal
    : null;
}

function presenterAllowed(email: string): boolean {
  const exactEmails = csv("VENTUS_CONSOLE_ALLOWED_EMAILS");
  const allowedDomains = csv(
    "VENTUS_CONSOLE_INTERNAL_DOMAINS",
    csv("VENTUS_CONSOLE_ALLOWED_DOMAINS", ["ventusai.com"]),
  );
  const domain = email.split("@")[1] || "";
  return exactEmails.includes(email) || allowedDomains.includes(domain);
}

function tenantForEmail(email: string): string {
  const domain = email.split("@")[1] || "";
  if (["bofa.com", "bankofamerica.com", "ml.com", "baml.com"].includes(domain)) return "bofa";
  return "ventus";
}

function csv(name: string, fallback: string[] = []): string[] {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function safeOpaque(value: unknown): string {
  return typeof value === "string" && OPAQUE_ID.test(value) ? value : "";
}

function safeEntitlements(value: unknown): ConsoleEntitlement[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(CONSOLE_ENTITLEMENTS);
  return Array.from(new Set(value.filter((item): item is ConsoleEntitlement => (
    typeof item === "string" && allowed.has(item)
  ))));
}
