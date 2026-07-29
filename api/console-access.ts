declare const process: { env: Record<string, string | undefined> };
import { authenticateConsoleUser } from "./_consoleAuth.js";

export const maxDuration = 10;

export async function POST(request: Request): Promise<Response> {
  const principal = await authenticateConsoleUser(request);
  if (!principal) {
    return Response.json({ error: "authenticated, confirmed user required" }, { status: 401 });
  }

  const response = Response.json({
    userId: principal.userId,
    email: principal.email,
    tenantId: principal.tenantId,
    organizationId: principal.organizationId,
    role: principal.role,
    status: principal.status,
    entitlements: principal.entitlements,
    authProvider: process.env.VENTUS_AUTH_PROVIDER?.trim() || "supabase",
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
