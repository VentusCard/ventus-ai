import { useMemo } from "react";

const TOKEN = new RegExp(
  [
    /(?<comment>--[^\n]*)/.source,
    /(?<string>'[^']*'|"[^"]*")/.source,
    /(?<kw>\b(?:SELECT|FROM|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|OUTER\s+JOIN|ON|AS|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|ASC|DESC|DISTINCT|CASE|WHEN|THEN|ELSE|END|UNION|ALL|WITH)\b)/.source,
    /(?<fn>\b(?:COUNT|SUM|AVG|MIN|MAX|ROUND|ABS|COALESCE|IFNULL|CAST|LOWER|UPPER|SUBSTR|LENGTH|DATE|YEAR|MONTH|DAY)\b)/.source,
    /(?<num>\b\d+(?:\.\d+)?\b)/.source,
  ].join("|"),
  "gi",
);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(src: string): string {
  let out = "";
  let last = 0;
  for (const m of src.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out += esc(src.slice(last, i));
    const g = m.groups || {};
    const text = esc(m[0]);
    if (g.comment) out += `<span class="text-slate-400 italic">${text}</span>`;
    else if (g.string) out += `<span class="text-emerald-600">${text}</span>`;
    else if (g.kw) out += `<span class="text-blue-600 font-medium">${text}</span>`;
    else if (g.fn) out += `<span class="text-violet-600">${text}</span>`;
    else if (g.num) out += `<span class="text-amber-600">${text}</span>`;
    else out += text;
    last = i + m[0].length;
  }
  if (last < src.length) out += esc(src.slice(last));
  return out + "\n";
}

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function QueryEditor({ value, onChange }: Props) {
  const html = useMemo(() => highlight(value), [value]);
  const lineCount = Math.max(value.split("\n").length, 8);

  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
      <div className="flex font-mono text-[12.5px] leading-[20px]" style={{ color: "#0f172a" }}>
        <div className="select-none text-slate-300 bg-slate-50/80 border-r border-slate-100 py-2 px-2 text-right tabular-nums">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="relative flex-1 min-w-0 sql-editor-surface">
          <style>{`
            .sql-editor-surface pre ::selection,
            .sql-editor-surface pre::selection { background: rgba(226, 232, 240, 0.9); color: #0f172a; -webkit-text-fill-color: #0f172a; }
            .sql-editor-surface textarea::selection { background: rgba(226, 232, 240, 0.9); color: transparent; -webkit-text-fill-color: transparent; }
          `}</style>
          <pre
            aria-hidden
            className="absolute inset-0 m-0 py-2 px-3 whitespace-pre-wrap break-words pointer-events-none z-10"
            style={{ color: "#0f172a", WebkitTextFillColor: "#0f172a" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="relative w-full min-h-[176px] py-2 px-3 text-transparent caret-slate-900 resize-y outline-none font-mono leading-[20px]"
            style={{ WebkitTextFillColor: "transparent" }}
          />
        </div>
      </div>
    </div>
  );
}
