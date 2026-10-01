import { Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import type { CompetitorOutflow } from "@/types/bankwide";

interface Props {
  data: CompetitorOutflow[];
  /** Group rows by product type (e.g. High-Yield Savings) with type subtotal headers, largest leak first. */
  groupByType?: boolean;
}

const trendIcons = {
  growing: <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />, 
  stable: <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />,
  declining: <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />,
};

const riskColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const typeColors: Record<string, string> = {
  neobank: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  brokerage: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  fintech: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  bnpl: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  traditional: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  crypto: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  rent: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  auto_loan: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  student_loan: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  utility: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  insurance: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  childcare: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  subscription: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
};

function OutflowRow({ row, rank }: { row: CompetitorOutflow; rank: number }) {
  return (
    <TableRow className="border-border">
      <TableCell className="text-muted-foreground font-mono text-xs">{rank}</TableCell>
      <TableCell className="font-medium text-foreground text-sm">{row.institution}</TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-[10px] ${typeColors[row.type] || ''}`}>{row.type}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">{row.productCategory}</TableCell>
      <TableCell className="text-right font-mono text-sm text-foreground">{formatCurrency(row.estimatedOutflow)}</TableCell>
      <TableCell className="text-right font-mono text-xs text-muted-foreground">{formatNumber(row.affectedCustomers)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {trendIcons[row.trend]}
          <span className="text-xs text-muted-foreground capitalize">{row.trend}</span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{row.detectionMethod}</TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-[10px] ${riskColors[row.riskLevel]}`}>{row.riskLevel}</Badge>
      </TableCell>
    </TableRow>
  );
}

export function CompetitorOutflowTable({ data, groupByType = false }: Props) {
  const groups = groupByType
    ? Object.values(
        data.reduce<Record<string, { category: string; rows: CompetitorOutflow[]; total: number; customers: number }>>(
          (acc, row) => {
            const key = row.productCategory;
            if (!acc[key]) acc[key] = { category: key, rows: [], total: 0, customers: 0 };
            acc[key].rows.push(row);
            acc[key].total += row.estimatedOutflow;
            acc[key].customers += row.affectedCustomers;
            return acc;
          },
          {},
        ),
      )
        .map((g) => ({ ...g, rows: [...g.rows].sort((a, b) => b.estimatedOutflow - a.estimatedOutflow) }))
        .sort((a, b) => b.total - a.total)
    : null;

  let rank = 0;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">ACH Outflow Analysis</h3>
        <p className="text-xs text-muted-foreground mt-1">Holistic view of where customer money flows — competitor products, recurring obligations, and everyday expenses detected via ACH metadata</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground text-xs">Rank</TableHead>
            <TableHead className="text-muted-foreground text-xs">Institution</TableHead>
            <TableHead className="text-muted-foreground text-xs">Type</TableHead>
            <TableHead className="text-muted-foreground text-xs">Product</TableHead>
            <TableHead className="text-muted-foreground text-xs text-right">Est. Outflow</TableHead>
            <TableHead className="text-muted-foreground text-xs text-right">Customers</TableHead>
            <TableHead className="text-muted-foreground text-xs">Trend</TableHead>
            <TableHead className="text-muted-foreground text-xs">Detection</TableHead>
            <TableHead className="text-muted-foreground text-xs">Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups
            ? groups.map((group) => (
                <Fragment key={group.category}>
                  <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={4} className="font-semibold text-foreground text-xs uppercase tracking-wide">
                      {group.category}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                      {formatCurrency(group.total)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-muted-foreground">
                      {formatNumber(group.customers)}
                    </TableCell>
                    <TableCell colSpan={3} />
                  </TableRow>
                  {group.rows.map((row) => (
                    <OutflowRow key={row.institution} row={row} rank={++rank} />
                  ))}
                </>
              ))
            : data.map((row, i) => <OutflowRow key={row.institution} row={row} rank={i + 1} />)}
        </TableBody>
      </Table>
    </div>
  );
}
