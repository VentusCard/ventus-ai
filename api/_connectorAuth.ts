declare const process: { env: Record<string, string | undefined> };

export function liveConnectorsEnabled(): boolean {
  return process.env.ENABLE_LIVE_CONNECTORS === "true";
}

export function connectorAuthorized(request: Request): boolean {
  const expected = process.env.VENTUS_CONNECTOR_TOKEN?.trim();
  const authorization = request.headers.get("authorization");
  if (expected && authorization === `Bearer ${expected}`) return true;

  const localDemoAllowed =
    process.env.VENTUS_ALLOW_LOCAL_CONNECTORS === "true" &&
    process.env.VERCEL_ENV !== "production";

  return localDemoAllowed && request.headers.get("x-ventus-client") === "web-app";
}

export function connectorDisabledResponse(): Response {
  return Response.json({ error: "connector disabled" }, { status: 404 });
}
