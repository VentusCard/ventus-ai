// Mock bank-sandbox receiver — stands in for a CEW / banker-workbench sandbox endpoint
// so the demo's "connected rehearsal" can perform REAL network writes on a laptop.
//
//   node scripts/mock-cew-sandbox.mjs            # listens on :8787
//   VITE_REHEARSAL_URL=http://localhost:8787/work-items npm run dev
//
// Every POST is acknowledged with a receipt id; GET / shows everything received —
// put it on a second screen during the demo so the audience watches payloads land.
// Zero dependencies, zero persistence: kill the process and nothing remains.

import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 8787);
const received = [];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-ventus-client, x-ventus-adapter",
};

function receiptId() {
  return `CEW-SBX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const server = createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }

  if (req.method === "GET") {
    res.writeHead(200, { ...CORS, "Content-Type": "text/html; charset=utf-8" });
    const rows = received
      .map(
        (item) =>
          `<tr><td>${item.receiptId}</td><td>${item.caseId ?? "—"}</td><td>${item.system ?? "—"}</td><td>${item.receivedAt}</td></tr>`,
      )
      .join("");
    return res.end(
      `<!doctype html><meta charset="utf-8"><title>Mock CEW sandbox</title>
       <style>body{font-family:ui-monospace,monospace;padding:24px;background:#0f172a;color:#e2e8f0}
       h1{font-size:16px;color:#7dd3fc}table{border-collapse:collapse;margin-top:12px;width:100%}
       td,th{border:1px solid #334155;padding:6px 10px;font-size:12px;text-align:left}th{color:#94a3b8}</style>
       <h1>Mock CEW sandbox — ${received.length} payload(s) received</h1>
       <p style="font-size:12px;color:#94a3b8">Auto-refreshes every 2s. Each row is a real network write from the demo.</p>
       <table><tr><th>Receipt</th><th>Case</th><th>System</th><th>Received</th></tr>${rows}</table>
       <script>setTimeout(()=>location.reload(),2000)</script>`,
    );
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let payload = {};
      try {
        payload = JSON.parse(body);
      } catch {
        /* keep raw */
      }
      const record = {
        receiptId: receiptId(),
        caseId: payload.caseId,
        system: payload.system,
        receivedAt: new Date().toISOString(),
      };
      received.push(record);
      console.log(`✓ received ${record.caseId ?? "payload"} → ${record.receiptId} (${payload.system ?? "unknown system"})`);
      res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ acknowledged: true, receiptId: record.receiptId, receivedAt: record.receivedAt }));
    });
    return;
  }

  res.writeHead(405, CORS);
  res.end();
});

server.listen(PORT, () => {
  console.log(`Mock CEW sandbox listening on http://localhost:${PORT}`);
  console.log(`Point the demo at it:  VITE_REHEARSAL_URL=http://localhost:${PORT}/work-items npm run dev`);
  console.log(`Watch payloads land:   open http://localhost:${PORT}`);
});
