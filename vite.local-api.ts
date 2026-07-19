import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin } from "vite";
// tsx resolves the api routes' NodeNext-style ".js" specifiers back to their
// .ts sources — node's native type stripping cannot, and Vercel needs those
// specifiers to be ".js" at runtime.
import { tsImport } from "tsx/esm/api";

type ApiHandler = (request: Request) => Promise<Response>;

const loadRoute = (path: string) => async (): Promise<ApiHandler> =>
  ((await tsImport(path, import.meta.url)) as { POST: ApiHandler }).POST;

const API_ROUTES: Record<string, () => Promise<ApiHandler>> = {
  "/api/presenter-session": loadRoute("./api/presenter-session.ts"),
  "/api/console-access": loadRoute("./api/console-access.ts"),
  "/api/plaid-transactions": loadRoute("./api/plaid-transactions.ts"),
  "/api/salesforce-deliver": loadRoute("./api/salesforce-deliver.ts"),
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
    configResolved(config) {
      const environment = loadEnv(config.mode, config.envDir, "");
      for (const [name, value] of Object.entries(environment)) {
        if (process.env[name] === undefined) process.env[name] = value;
      }
    },
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
