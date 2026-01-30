import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertTriangle, Info } from "lucide-react";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";
import { TaxAdvantagedAccount } from "@/types/financial-planning";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// IRS Uniform Lifetime Table (2024) - Distribution Period by Age
const UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
  80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
  88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
  96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2,
  104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4,
  112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3,
  120: 2.0,
};

// Account types subject to RMD (Roth IRA and HSA are NOT subject to RMD for original owner)
const RMD_ELIGIBLE_TYPES: TaxAdvantagedAccount['type'][] = ['401k', 'traditional_ira'];

interface RMDCalculatorProps {
  clientAge: number;
  taxAdvantagedAccounts: TaxAdvantagedAccount[];
}

export function RMDCalculator({ clientAge, taxAdvantagedAccounts }: RMDCalculatorProps) {
  const rmdStartAge = 73; // SECURE 2.0 Act - RMD starts at 73 for those born 1951-1959
  const calculationAge = clientAge >= rmdStartAge ? clientAge : rmdStartAge;

  // Filter for RMD-eligible accounts
  const rmdEligibleAccounts = useMemo(() => 
    taxAdvantagedAccounts.filter(acc => RMD_ELIGIBLE_TYPES.includes(acc.type)),
    [taxAdvantagedAccounts]
  );

  const getDistributionPeriod = (currentAge: number): number => {
    if (currentAge < 72) return 0;
    if (currentAge > 120) return UNIFORM_LIFETIME_TABLE[120];
    return UNIFORM_LIFETIME_TABLE[currentAge] || 0;
  };

  const calculations = useMemo(() => {
    const distributionPeriod = getDistributionPeriod(calculationAge);
    const totalBalance = rmdEligibleAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalRMD = distributionPeriod > 0 ? totalBalance / distributionPeriod : 0;
    
    const accountRMDs = rmdEligibleAccounts.map(acc => ({
      ...acc,
      rmd: distributionPeriod > 0 ? acc.currentBalance / distributionPeriod : 0,
    }));

    // Calculate tax impact estimate (assuming 22% bracket)
    const estimatedTax = totalRMD * 0.22;
    
    // Calculate 10-year projection
    const projection = Array.from({ length: 10 }, (_, i) => {
      const projectedAge = calculationAge + i;
      const period = getDistributionPeriod(projectedAge);
      // Simplified: assume 5% growth minus RMD withdrawal
      const growthRate = 0.05;
      let projectedBalance = totalBalance;
      for (let y = 0; y < i; y++) {
        const yearAge = calculationAge + y;
        const yearPeriod = getDistributionPeriod(yearAge);
        const yearRMD = yearPeriod > 0 ? projectedBalance / yearPeriod : 0;
        projectedBalance = (projectedBalance - yearRMD) * (1 + growthRate);
      }
      const projectedRMD = period > 0 ? projectedBalance / period : 0;
      return {
        year: new Date().getFullYear() + i,
        age: projectedAge,
        balance: Math.round(projectedBalance),
        rmd: Math.round(projectedRMD),
      };
    });

    return { distributionPeriod, totalBalance, totalRMD, accountRMDs, estimatedTax, projection };
  }, [calculationAge, rmdEligibleAccounts]);

  const isRMDRequired = clientAge >= rmdStartAge;
  const yearsUntilRMD = rmdStartAge - clientAge;

  // Don't render if no RMD-eligible accounts
  if (rmdEligibleAccounts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">RMD Calculator</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-4">
            No RMD-eligible accounts (Traditional IRA or 401k) found. 
            Add these accounts in the Tax-Advantaged Accounts section above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">RMD Calculator</CardTitle>
          <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-slate-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Required Minimum Distributions must be taken from traditional IRAs and 401(k)s starting at age 73 (SECURE 2.0 Act). Roth IRAs and HSAs are not subject to RMD.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!isRMDRequired && (
            <Badge variant="secondary">
              RMD starts in {yearsUntilRMD} years
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age & Distribution Period */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Client Age</Label>
            <div className="mt-1 h-10 flex items-center px-3 bg-slate-200 rounded-md font-medium">
              {clientAge} years old
            </div>
          </div>
          <div>
            <Label className="text-sm">Distribution Period</Label>
            <div className="mt-1 h-10 flex items-center px-3 bg-slate-200 rounded-md font-medium">
              {calculations.distributionPeriod > 0 ? `${calculations.distributionPeriod.toFixed(1)} years` : 'N/A (under 73)'}
            </div>
          </div>
        </div>

        {/* Account Balances - Synced from Tax-Advantaged Accounts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">RMD-Eligible Accounts</Label>
            <span className="text-xs text-slate-500">Synced from Tax-Advantaged Accounts</span>
          </div>
          {calculations.accountRMDs.map((account, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-sm font-medium">{account.label}</span>
                <p className="text-xs text-slate-500">Balance: {formatCurrency(account.currentBalance)}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-primary">
                  {isRMDRequired ? formatCurrency(account.rmd) : '—'}
                </span>
                <p className="text-xs text-slate-500">Annual RMD</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-primary/5 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total RMD-Eligible Balance</span>
            <span className="font-semibold">{formatCurrency(calculations.totalBalance)}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium">Required Minimum Distribution</span>
            <span className="font-bold text-primary">
              {isRMDRequired ? formatCurrency(calculations.totalRMD) : `${formatCurrency(calculations.totalRMD)} (at age 73)`}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>Estimated Tax (22% bracket)</span>
            <span>{formatCurrency(calculations.estimatedTax)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>Monthly Distribution</span>
            <span>{formatCurrency(calculations.totalRMD / 12)}</span>
          </div>
        </div>

        {/* Warning if deadline approaching */}
        {isRMDRequired && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-700">RMD Deadline Reminder</p>
              <p className="text-slate-500 mt-1">
                RMDs must be taken by December 31st each year. First-year RMDs can be delayed until April 1st of the following year, but this requires two distributions in the second year.
              </p>
            </div>
          </div>
        )}

        {/* 10-Year Projection Table */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">10-Year RMD Projection</Label>
          <p className="text-xs text-slate-500">Assumes 5% annual growth after RMD withdrawal</p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Year</th>
                  <th className="px-3 py-2 text-left font-medium">Age</th>
                  <th className="px-3 py-2 text-right font-medium">Balance</th>
                  <th className="px-3 py-2 text-right font-medium">RMD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {calculations.projection.slice(0, 5).map((row) => (
                  <tr key={row.year} className="hover:bg-muted/30">
                    <td className="px-3 py-2">{row.year}</td>
                    <td className="px-3 py-2">{row.age}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.balance)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(row.rmd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
