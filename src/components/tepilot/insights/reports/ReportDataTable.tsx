import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => ReactNode;
  width?: string;
}

interface ReportDataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, i: number) => string;
  caption?: string;
  emptyLabel?: string;
}

export function ReportDataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  emptyLabel = "No rows",
}: ReportDataTableProps<T>) {
  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
      {caption && (
        <div className="px-3 py-2 text-[12px] font-medium text-slate-700 border-b border-slate-100 flex items-center justify-between">
          <span>{caption}</span>
          <span className="text-[11px] text-slate-400 tabular-nums">{rows.length} rows</span>
        </div>
      )}
      <div className="overflow-auto max-h-[520px]">
        <table className="w-full text-[12px]">
          <thead className="sticky top-0 bg-white border-b border-slate-100">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "py-1.5 px-3 text-[10px] uppercase tracking-wide font-medium text-slate-400",
                    c.align === "right"
                      ? "text-right"
                      : c.align === "center"
                        ? "text-center"
                        : "text-left",
                  )}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-6 text-center text-slate-400 text-[12px]"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={rowKey(row, i)}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "py-1.5 px-3 text-slate-700",
                        c.align === "right"
                          ? "text-right tabular-nums"
                          : c.align === "center"
                            ? "text-center"
                            : "text-left",
                      )}
                    >
                      {c.render(row, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
