import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { OverviewMetrics } from "@/components/tepilot/insights/OverviewMetrics";
import { PillarExplorer } from "@/components/tepilot/insights/PillarExplorer";
import { Transaction, EnrichedTransaction } from "@/types/transaction";
import { ClientProfileData } from "@/types/clientProfile";
import { applyCorrections } from "@/lib/aggregations";
import { useState } from "react";

interface CustomerData {
  parsedTransactions: Transaction[];
  enrichedTransactions: EnrichedTransaction[];
  demographics: ClientProfileData | null;
  label: string;
  color: string;
}

interface ComparisonDashboardProps {
  customerA: CustomerData;
  customerB: CustomerData;
}

function CustomerColumn({ customer }: { customer: CustomerData }) {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [subcategoryBudgets, setSubcategoryBudgets] = useState<Record<string, number>>({});

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${customer.color}`} />
        <h3 className="font-bold text-lg text-slate-900">{customer.demographics?.name || customer.label}</h3>
        {customer.demographics && (
          <Badge variant="secondary" className="text-xs">
            {customer.demographics.segment} · {customer.demographics.demographics?.occupation}
          </Badge>
        )}
      </div>
      <OverviewMetrics
        originalTransactions={customer.parsedTransactions}
        enrichedTransactions={customer.enrichedTransactions}
      />
      <PillarExplorer
        transactions={customer.enrichedTransactions}
        budgets={budgets}
        setBudgets={setBudgets}
        subcategoryBudgets={subcategoryBudgets}
        setSubcategoryBudgets={setSubcategoryBudgets}
      />
    </div>
  );
}

export function ComparisonDashboard({ customerA, customerB }: ComparisonDashboardProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Side-by-Side Customer Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">
          Compare spending patterns, lifestyle pillars, and behavioral signals between two customers
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <CustomerColumn customer={customerA} />
        <CustomerColumn customer={customerB} />
      </div>
    </div>
  );
}
