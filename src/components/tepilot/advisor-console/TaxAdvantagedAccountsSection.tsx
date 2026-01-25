import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Landmark, CheckCircle, AlertTriangle } from "lucide-react";
import { TaxAdvantagedAccount } from "@/types/financial-planning";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";

interface TaxAdvantagedAccountsSectionProps {
  accounts: TaxAdvantagedAccount[];
  onAccountsChange: (accounts: TaxAdvantagedAccount[]) => void;
  clientAge: number;
}

export function TaxAdvantagedAccountsSection({
  accounts,
  onAccountsChange,
  clientAge,
}: TaxAdvantagedAccountsSectionProps) {
  const isCatchUpEligible = clientAge >= 50;
  
  const handleAccountChange = (index: number, updates: Partial<TaxAdvantagedAccount>) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], ...updates };
    onAccountsChange(updated);
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalContributions = accounts.reduce((sum, acc) => sum + acc.annualContribution, 0);
  const totalEmployerMatch = accounts.reduce((sum, acc) => sum + (acc.employerMatch || 0), 0);
  const maxPossibleContributions = accounts.reduce((sum, acc) => sum + acc.maxContribution, 0);
  const utilizationRate = maxPossibleContributions > 0 ? (totalContributions / maxPossibleContributions) * 100 : 0;

  // Check if capturing full employer match
  const account401k = accounts.find(a => a.type === '401k');
  const capturingFullMatch = !account401k || 
    (account401k.annualContribution >= (account401k.employerMatch || 0) * 2); // Assumes 50% match

  const getContributionColor = (contribution: number, max: number) => {
    const pct = (contribution / max) * 100;
    if (pct >= 90) return "bg-green-500";
    if (pct >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Tax-Advantaged Accounts</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isCatchUpEligible && (
              <Badge variant="secondary" className="text-xs">
                Catch-up Eligible (50+)
              </Badge>
            )}
            {capturingFullMatch ? (
              <Badge variant="default" className="text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Full Match Captured
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Missing Employer Match
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {accounts.map((account, index) => {
            const utilizationPct = (account.annualContribution / account.maxContribution) * 100;
            
            return (
              <div 
                key={account.type}
                className="p-4 border rounded-lg bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{account.label}</h4>
                  <Badge variant="outline" className="text-xs">
                    {utilizationPct.toFixed(0)}% maxed
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Balance</p>
                    <p className="text-lg font-bold">{formatCurrency(account.currentBalance)}</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{formatCurrency(account.annualContribution)}</span>
                      <span className="text-slate-500">/{formatCurrency(account.maxContribution)}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className={`absolute h-full rounded-full transition-all ${getContributionColor(account.annualContribution, account.maxContribution)}`}
                        style={{ width: `${Math.min(100, utilizationPct)}%` }}
                      />
                    </div>
                  </div>
                  
                  {account.employerMatch !== undefined && account.employerMatch > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>+{formatCurrency(account.employerMatch)} match</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <Label className="text-xs">Annual Contribution</Label>
                    <Input
                      type="number"
                      value={account.annualContribution}
                      onChange={(e) => handleAccountChange(index, { 
                        annualContribution: parseFloat(e.target.value) || 0 
                      })}
                      className="h-8 mt-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Tax-Advantaged</p>
              <p className="text-xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Annual Contributions</p>
              <p className="text-xl font-bold">{formatCurrency(totalContributions)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Employer Match</p>
              <p className="text-xl font-bold text-green-600">+{formatCurrency(totalEmployerMatch)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Utilization Rate</p>
              <p className={`text-xl font-bold ${utilizationRate >= 80 ? 'text-green-600' : utilizationRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {utilizationRate.toFixed(0)}%
              </p>
            </div>
          </div>
          
          {/* Recommendations */}
          {utilizationRate < 100 && (
            <div className="mt-4 pt-4 border-t text-sm">
              <p className="font-medium mb-2">Optimization Opportunities:</p>
              <ul className="space-y-1 text-slate-500">
                {accounts.map(account => {
                  const gap = account.maxContribution - account.annualContribution;
                  if (gap > 0) {
                    return (
                      <li key={account.type} className="flex items-center gap-2">
                        <span>•</span>
                        <span>
                          Increase {account.label} by {formatCurrency(gap)} to max out
                        </span>
                      </li>
                    );
                  }
                  return null;
                })}
                {isCatchUpEligible && (
                  <li className="flex items-center gap-2 text-primary">
                    <span>•</span>
                    <span>
                      Eligible for catch-up contributions ($7,500 for 401k, $1,000 for IRA)
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
