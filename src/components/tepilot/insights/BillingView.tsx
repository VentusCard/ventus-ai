import { CreditCard, Download, TrendingUp, Receipt, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const usage = [
  { label: "Active customers", current: 482000, limit: 600000, unit: "" },
  { label: "Transactions enriched (mo)", current: 18400000, limit: 25000000, unit: "" },
  { label: "AI generations (mo)", current: 312000, limit: 500000, unit: "" },
];

const invoices = [
  { id: "INV-2026-0006", date: "Jun 1, 2026", amount: "$48,500.00", status: "Paid" },
  { id: "INV-2026-0005", date: "May 1, 2026", amount: "$48,500.00", status: "Paid" },
  { id: "INV-2026-0004", date: "Apr 1, 2026", amount: "$46,200.00", status: "Paid" },
  { id: "INV-2026-0003", date: "Mar 1, 2026", amount: "$46,200.00", status: "Paid" },
  { id: "INV-2026-0002", date: "Feb 1, 2026", amount: "$44,800.00", status: "Paid" },
  { id: "INV-2026-0001", date: "Jan 1, 2026", amount: "$44,800.00", status: "Paid" },
];

const modules = [
  { name: "Transaction Enrichment", price: "Included" },
  { name: "Lifestyle Analytics", price: "Included" },
  { name: "Next-Deal Intelligence", price: "$8,500/mo" },
  { name: "Life Event Detection", price: "$6,000/mo" },
  { name: "WM Copilot", price: "$12,000/mo" },
  { name: "Financial Vulnerability Index", price: "$4,500/mo" },
];

function formatNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function BillingView() {
  return (
    <div className="space-y-6">
      <TabHeader
        icon={<CreditCard className="w-4 h-4" />}
        title="Billing & Subscription"
        subtitle="Manage your plan, payment methods, and view invoices"
        howItWorks="Your subscription bundles platform access with usage-based modules. Invoices are issued on the first of each month."
        whyItMatters="Clear visibility into spend and usage helps you right-size modules as adoption grows across your institution."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Current Plan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Enterprise</h3>
              <p className="text-sm text-slate-500 mt-1">Renews <span className="font-medium text-slate-700">Jul 1, 2026</span> · Billed monthly</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">$48,500<span className="text-sm text-slate-500 font-normal">/mo</span></p>
              <Button size="sm" variant="outline" className="mt-2">Manage Plan</Button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500">Contract term</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">36 months</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Started</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">Jan 1, 2025</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Account manager</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">Jamie Whitfield</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Payment Method</h3>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 bg-gradient-to-br from-slate-50 to-white">
            <p className="text-xs text-slate-500">Visa ending in</p>
            <p className="text-lg font-bold text-slate-900 tracking-widest mt-0.5">•••• 4242</p>
            <p className="text-xs text-slate-500 mt-1">Expires 09/28</p>
          </div>
          <p className="text-xs text-slate-500 mt-3">Billing contact</p>
          <p className="text-sm font-medium text-slate-800">finance@ourbank.com</p>
          <Button variant="outline" size="sm" className="mt-3 w-full">Update Payment</Button>
        </Card>
      </div>

      <Card className="p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Usage This Billing Period</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {usage.map((u) => {
            const pct = Math.round((u.current / u.limit) * 100);
            return (
              <div key={u.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <p className="text-xs font-medium text-slate-600">{u.label}</p>
                  <p className="text-xs text-slate-500">{pct}%</p>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-xs text-slate-500 mt-1.5">
                  <span className="font-semibold text-slate-800">{formatNum(u.current)}</span> of {formatNum(u.limit)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Package className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Modules</h3>
          </div>
          <div className="space-y-2">
            {modules.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-700">{m.name}</span>
                <span className={m.price === "Included" ? "text-emerald-600 font-medium text-xs" : "text-slate-800 font-semibold"}>{m.price}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Invoice History</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Invoice</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-xs font-medium text-slate-700">{inv.id}</TableCell>
                  <TableCell className="text-xs text-slate-600">{inv.date}</TableCell>
                  <TableCell className="text-xs text-slate-800 font-semibold">{inv.amount}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[10px]">{inv.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
