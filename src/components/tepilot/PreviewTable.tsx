import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Hash, MapPin } from "lucide-react";

interface PreviewTableProps {
  transactions: Transaction[];
}

export function PreviewTable({ transactions }: PreviewTableProps) {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const dateRange = transactions.length > 0 ? {
    start: transactions.reduce((min, t) => t.date < min ? t.date : min, transactions[0].date),
    end: transactions.reduce((max, t) => t.date > max ? t.date : max, transactions[0].date),
  } : null;
  
  // Extract anchor ZIP from first transaction if available
  const anchorZip = transactions.length > 0 && transactions[0].home_zip ? transactions[0].home_zip : null;

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
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Total:</span>
            <span className="font-semibold text-slate-900">${totalAmount.toFixed(2)}</span>
          </div>
          {dateRange && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500">Range:</span>
              <span className="font-semibold text-slate-900">{dateRange.start} to {dateRange.end}</span>
            </div>
          )}
          {anchorZip && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500">Anchor ZIP:</span>
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
                  <TableHead>Merchant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>MCC</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Zip Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.transaction_id}>
                    <TableCell className="font-medium text-slate-900">{transaction.merchant_name}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {transaction.description || "—"}
                    </TableCell>
                    <TableCell>
                      {transaction.mcc ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {transaction.mcc}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">{transaction.date}</TableCell>
                    <TableCell className="text-sm">
                      {transaction.zip_code || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
