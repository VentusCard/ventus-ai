import { authenticateConsoleUser, consoleAuthProvider } from "./_consoleAuth.js";

export const maxDuration = 10;

export async function POST(request: Request): Promise<Response> {
  const principal = await authenticateConsoleUser(request);
  if (!principal) {
    return Response.json({ error: "active Console access required" }, { status: 401 });
  }

  const response = Response.json({
    userId: principal.userId,
    email: principal.email,
    tenantId: principal.tenantId,
    organizationId: principal.organizationId,
    role: principal.role,
    status: principal.status,
    entitlements: principal.entitlements,
    authProvider: consoleAuthProvider(),
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
