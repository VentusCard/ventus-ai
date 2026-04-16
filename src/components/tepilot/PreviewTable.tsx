import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Hash, MapPin } from "lucide-react";
import { getSourceColor } from "@/lib/sampleData";

interface PreviewTableProps {
  transactions: Transaction[];
  comparisonMode?: boolean;
}

export function PreviewTable({ transactions, comparisonMode }: PreviewTableProps) {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const dateRange = transactions.length > 0 ? {
    start: transactions.reduce((min, t) => t.date < min ? t.date : min, transactions[0].date),
    end: transactions.reduce((max, t) => t.date > max ? t.date : max, transactions[0].date),
  } : null;

  const anchorZip = transactions.length > 0 && transactions[0].home_zip ? transactions[0].home_zip : null;

  // In comparison mode detect the two user labels
  const firstUserId = comparisonMode && transactions.length > 0 ? (transactions[0] as any)._userId : null;

  const getUserBadgeClass = (userId: string) =>
    userId === firstUserId
      ? "border-blue-300 bg-blue-50 text-blue-700"
      : "border-emerald-300 bg-emerald-50 text-emerald-700";

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction Preview</CardTitle>
            <CardDescription>
              Review your data before enrichment
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {transactions.length} transactions
          </Badge>
        </div>

        <div className="flex gap-6 pt-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-600" />
            <span className="text-slate-600">Total:</span>
            <span className="font-semibold text-slate-900">${totalAmount.toFixed(2)}</span>
          </div>
          {dateRange && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="text-slate-600">Range:</span>
              <span className="font-semibold text-slate-900">{dateRange.start} to {dateRange.end}</span>
            </div>
          )}
          {anchorZip && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-600" />
              <span className="text-slate-600">Anchor ZIP:</span>
              <span className="font-semibold font-mono text-slate-900">{anchorZip}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  {comparisonMode && <TableHead className="text-slate-700">User</TableHead>}
                  <TableHead className="text-slate-700">Merchant</TableHead>
                  <TableHead className="text-slate-700">MCC Description / Note</TableHead>
                  <TableHead className="text-slate-700">MCC</TableHead>
                  <TableHead className="text-right text-slate-700">Amount</TableHead>
                  <TableHead className="text-slate-700">Date</TableHead>
                  <TableHead className="text-slate-700">Zip Code</TableHead>
                  {transactions.some(t => t.source) && (
                    <TableHead className="text-slate-700">Source</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, idx) => {
                  const userId = comparisonMode ? (transaction as any)._userId : null;
                  return (
                    <TableRow key={`${transaction.transaction_id}-${idx}`}>
                      {comparisonMode && (
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium whitespace-nowrap ${getUserBadgeClass(userId)}`}>
                            {userId}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-slate-900">{transaction.merchant_name}</TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {transaction.description || "—"}
                      </TableCell>
                      <TableCell>
                        {transaction.mcc ? (
                          <Badge variant="outline" className="font-mono text-xs text-slate-700">
                            {transaction.mcc}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-900">
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">{transaction.date}</TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {transaction.zip_code || "—"}
                      </TableCell>
                      {transactions.some(t => t.source) && (
                        <TableCell>
                          {transaction.source ? (
                            <Badge variant="outline" className={`text-xs font-medium whitespace-nowrap ${getSourceColor(transaction.source)}`}>
                              {transaction.source}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
