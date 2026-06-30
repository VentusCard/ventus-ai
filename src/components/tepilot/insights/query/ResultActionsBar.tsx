import { useState } from "react";
import { Sparkles, Download, Users, Mail, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { executeSql, buildCohortQuery, type SqlResult } from "./sqlEngine";
import { rowsToCsv, downloadCsv, timestampSlug } from "./exportCsv";

interface ResultActionsBarProps {
  sql: string;
  result: SqlResult;
  onToggleTakeaway: () => void;
  takeawayOpen: boolean;
  onEmail: () => void;
}

export function ResultActionsBar({ sql, result, onToggleTakeaway, takeawayOpen, onEmail }: ResultActionsBarProps) {
  const [busy, setBusy] = useState(false);
  const hasRows = result.rowCount > 0;
  const groupCols = result.groupByCols;
  const segmentable = groupCols.length > 0;

  const exportResultCsv = () => {
    const csv = rowsToCsv(result.columns, result.rows);
    downloadCsv(`ventus-query-${timestampSlug()}.csv`, csv);
  };

  const exportCohort = (filters: Record<string, unknown> = {}, labelSuffix = "") => {
    setBusy(true);
    try {
      const cohortSql = buildCohortQuery(sql, filters);
      const r = executeSql(cohortSql);
      if (!r.rowCount) {
        toast({ title: "No customers in cohort", description: "This query matched zero customers.", variant: "destructive" });
        return;
      }
      const csv = rowsToCsv(r.columns, r.rows);
      const suffix = labelSuffix ? `-${labelSuffix}` : "";
      downloadCsv(`ventus-cohort${suffix}-${timestampSlug()}.csv`, csv);
      toast({ title: "Cohort exported", description: `${r.rowCount.toLocaleString()} customer_id${r.rowCount === 1 ? "" : "s"} downloaded.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Cohort export failed", description: e instanceof Error ? e.message : "Try a simpler query." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5 flex-wrap">
      <Button
        size="sm"
        variant={takeawayOpen ? "default" : "outline"}
        onClick={onToggleTakeaway}
        disabled={!hasRows}
        className={takeawayOpen ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
      >
        <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI takeaway
      </Button>

      <Button size="sm" variant="outline" onClick={exportResultCsv} disabled={!hasRows}>
        <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" disabled={!hasRows || busy}>
            <Users className="w-3.5 h-3.5 mr-1.5" /> Export cohort <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border-slate-200 w-[300px]">
          <DropdownMenuItem onClick={() => exportCohort()} className="text-[12.5px]">
            <Users className="w-3.5 h-3.5 mr-2 text-slate-500" />
            All matching customers
          </DropdownMenuItem>
          {segmentable && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10.5px] uppercase tracking-wider text-slate-400">
                One segment ({groupCols.join(" × ")})
              </DropdownMenuLabel>
              {result.rows.slice(0, 12).map((row, i) => {
                const filters: Record<string, unknown> = {};
                const labelParts: string[] = [];
                for (const col of groupCols) {
                  filters[col] = row[col];
                  labelParts.push(String(row[col] ?? "—"));
                }
                const label = labelParts.join(" · ");
                const slug = labelParts.join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
                return (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => exportCohort(filters, slug || `segment-${i + 1}`)}
                    className="text-[12.5px]"
                  >
                    <Download className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span className="truncate">{label}</span>
                  </DropdownMenuItem>
                );
              })}
              {result.rows.length > 12 && (
                <div className="px-2 py-1.5 text-[11px] text-slate-400">
                  Showing 12 of {result.rows.length} segments — narrow the query to export more.
                </div>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" variant="outline" onClick={onEmail} disabled={!hasRows}>
        <Mail className="w-3.5 h-3.5 mr-1.5" /> Email summary
      </Button>
    </div>
  );
}
