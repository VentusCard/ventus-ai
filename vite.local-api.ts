import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

type ApiHandler = (request: Request) => Promise<Response>;

const API_ROUTES: Record<string, () => Promise<ApiHandler>> = {
  "/api/presenter-session": async () => (await import("./api/presenter-session.ts")).POST,
  "/api/plaid-transactions": async () => (await import("./api/plaid-transactions.ts")).POST,
  "/api/salesforce-deliver": async () => (await import("./api/salesforce-deliver.ts")).POST,
};

async function toFetchRequest(request: IncomingMessage): Promise<Request> {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
    else if (value !== undefined) headers.set(name, value);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const method = request.method ?? "GET";
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
  const host = request.headers.host ?? "127.0.0.1";

  return new Request(`http://${host}${request.url ?? "/"}`, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });
}

async function writeFetchResponse(response: Response, target: ServerResponse): Promise<void> {
  target.statusCode = response.status;
  response.headers.forEach((value, name) => target.setHeader(name, value));
  target.end(Buffer.from(await response.arrayBuffer()));
}

/** Executes the Vercel connector handlers during local Vite development. */
export function localApiPlugin(): Plugin {
  return {
    name: "ventus-local-connector-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
        const loadHandler = API_ROUTES[path];
        if (!loadHandler) return next();

        if (request.method !== "POST") {
          response.statusCode = 405;
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify({ error: "method not allowed" }));
          return;
        }

        try {
          const handler = await loadHandler();
          await writeFetchResponse(await handler(await toFetchRequest(request)), response);
        } catch (error) {
          server.config.logger.error(`Local connector API failed: ${String(error)}`);
          response.statusCode = 500;
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify({ error: "local connector API failed" }));
        }
      });
    },
  };
}
