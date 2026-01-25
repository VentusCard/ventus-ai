import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { aggregateByMCC, getMCCDistribution } from "@/lib/aggregations";
interface BeforeInsightsPanelProps {
  transactions: Transaction[];
}
export function BeforeInsightsPanel({
  transactions
}: BeforeInsightsPanelProps) {
  const mccAggregates = aggregateByMCC(transactions).slice(0, 10);
  const pieData = getMCCDistribution(transactions).slice(0, 8);
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  return <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Before: MCC-Based View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">Total Spend</p>
              <p className="text-2xl font-bold text-slate-900">${totalSpend.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-medium mb-4 text-slate-900">Spend by MCC</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mccAggregates}>
                  <XAxis dataKey="mcc" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={value => `$${Number(value).toFixed(2)}`} />
                  <Bar dataKey="totalSpend" fill="#252b69" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            
          </div>
        </CardContent>
      </Card>
    </div>;
}