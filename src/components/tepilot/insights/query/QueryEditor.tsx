import { useMemo } from "react";

const KEYWORDS = /\b(FROM|SHOW|TIMESERIES|GROUP BY|WHERE|SINCE|UNTIL|COMPARE TO|ORDER BY|LIMIT|VISUALIZE|WITH|TYPE|TOTALS|PERCENT_CHANGE|AND|IN|ASC|DESC|previous_period|day|week|month|line|bar|area)\b/g;
const FUNCS = /\b(count|sum|avg|min|max|startOfDay|today)\b/g;
const NUMS = /\b\d+(\.\d+)?\b/g;
const STRS = /'[^']*'|"[^"]*"/g;

function highlight(src: string): string {
  // Order matters: strings first, then keywords, then funcs, then numbers
  let out = src
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  out = out.replace(STRS, (m) => `<span class="text-emerald-600">${m}</span>`);
  out = out.replace(KEYWORDS, (m) => `<span class="text-blue-600 font-medium">${m}</span>`);
  out = out.replace(FUNCS, (m) => `<span class="text-violet-600">${m}</span>`);
  out = out.replace(NUMS, (m) => `<span class="text-amber-600">${m}</span>`);
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
      <div className="flex font-mono text-[12.5px] leading-[20px]">
        <div className="select-none text-slate-300 bg-slate-50/80 border-r border-slate-100 py-2 px-2 text-right tabular-nums">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="relative flex-1 min-w-0">
          <pre
            aria-hidden
            className="absolute inset-0 m-0 py-2 px-3 whitespace-pre-wrap break-words text-slate-800 pointer-events-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="relative w-full min-h-[176px] py-2 px-3 bg-transparent text-transparent caret-slate-900 resize-y outline-none font-mono leading-[20px]"
            style={{ WebkitTextFillColor: "transparent" }}
          />
        </div>
      </div>
    </div>
  );
}
