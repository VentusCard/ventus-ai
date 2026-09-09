import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const sourcePath = resolve('../docs/api/openapi-draft.yaml');
const outputPath = resolve('../docs/api/api-reference.html');
const yaml = readFileSync(sourcePath, 'utf8');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const pathLines = yaml
  .split('\n')
  .filter((line) => /^  \/[^:]+:/.test(line))
  .map((line) => line.trim().replace(/:$/, ''));

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ventus AI API Reference</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #172033;
        background: #f7f9fc;
      }
      main {
        max-width: 1040px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 32px;
      }
      p {
        line-height: 1.55;
      }
      .paths {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 10px;
        margin: 24px 0;
      }
      .path {
        border: 1px solid #dde5f2;
        background: white;
        border-radius: 6px;
        padding: 10px 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 13px;
      }
      pre {
        overflow: auto;
        background: #101828;
        color: #e5edf7;
        border-radius: 6px;
        padding: 16px;
        line-height: 1.45;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Ventus AI API Reference</h1>
      <p>
        Generated from <code>docs/api/openapi-draft.yaml</code>. This is an offline artifact for pilot review
        and should be replaced by the live <code>/docs</code> route once backend docs hosting is wired.
      </p>
      <p>
        Postman import artifact: <code>docs/api/ventus-api.postman_collection.json</code>.
      </p>
      <h2>Endpoints</h2>
      <section class="paths">
        ${pathLines.map((path) => `<div class="path">${escapeHtml(path)}</div>`).join('\n        ')}
      </section>
      <h2>OpenAPI Source</h2>
      <pre>${escapeHtml(yaml)}</pre>
    </main>
  </body>
</html>
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
console.log(`Wrote ${outputPath}`);
