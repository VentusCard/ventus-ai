import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TopPillarsAnalysis } from "@/components/tepilot/insights/TopPillarsAnalysis";
import { DealActivationPreview } from "@/components/tepilot/insights/DealActivationPreview";
import { CollapsibleCard } from "@/components/tepilot/insights/CollapsibleCard";
import { EnrichedTransaction } from "@/types/transaction";
import { ClientProfileData } from "@/types/clientProfile";
import { Sparkles, ArrowLeftRight } from "lucide-react";
import { useState } from "react";

interface CustomerRewardsData {
  enrichedTransactions: EnrichedTransaction[];
  demographics: ClientProfileData | null;
  anchorZip: string;
  label: string;
  color: string;
}

interface ComparisonRewardsViewProps {
  customerA: CustomerRewardsData;
  customerB: CustomerRewardsData;
}

function CustomerRewardsColumn({ customer }: { customer: CustomerRewardsData }) {
  const [persona, setPersona] = useState<any>(null);

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${customer.color}`} />
        <h3 className="font-bold text-lg text-slate-900">{customer.demographics?.name || customer.label}</h3>
        {customer.demographics && (
          <Badge variant="secondary" className="text-xs">
            {customer.demographics.segment}
          </Badge>
        )}
      </div>

      <TopPillarsAnalysis
        transactions={customer.enrichedTransactions}
        autoAnalyze={true}
        customerContext={{
          homeZip: customer.anchorZip,
          incomeLevel: customer.demographics?.demographics?.incomeLevel,
          industry: customer.demographics?.demographics?.industry,
          familyStatus: customer.demographics?.demographics?.familyStatus,
        }}
        onPersonaGenerated={(p) => setPersona(p)}
      />

      <CollapsibleCard
        defaultExpanded={true}
        title="Reward Personalization"
        description="How deals render for this customer"
        icon={<Sparkles className="h-5 w-5 text-violet-500" />}
        previewContent={
          <p className="text-sm text-slate-500">
            Preview personalized deal messaging based on this customer's profile.
          </p>
        }
      >
        <DealActivationPreview
          enrichedTransactions={customer.enrichedTransactions}
          personalContext={{
            demographics: customer.demographics?.demographics,
            persona: persona
          }}
        />
      </CollapsibleCard>
    </div>
  );
}

export function ComparisonRewardsView({ customerA, customerB }: ComparisonRewardsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header callout */}
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="pt-6 flex items-center gap-3">
          <ArrowLeftRight className="w-5 h-5 text-violet-600" />
          <div>
            <p className="font-semibold text-slate-900">Same Deals, Different Stories</p>
            <p className="text-sm text-slate-600">
              The same bank-defined deals produce entirely different personalized messaging for each customer based on their unique transaction patterns and lifestyle signals.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <CustomerRewardsColumn customer={customerA} />
        <CustomerRewardsColumn customer={customerB} />
      </div>
    </div>
  );
}
