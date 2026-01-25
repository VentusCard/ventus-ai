import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  DollarSign, 
  PiggyBank, 
  Receipt, 
  Lightbulb,
  TrendingUp,
  Building,
  FileText
} from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";
import { EnrichedTransaction } from "@/types/transaction";
import { FinancialPlanContext } from "@/lib/advisorContextBuilder";

interface TaxPlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientProfile: ClientProfileData | null;
  financialPlanData: FinancialPlanContext | null;
  enrichedTransactions: EnrichedTransaction[];
  onAskAI?: (prompt: string) => void;
}

// State tax rates (simplified - top marginal rates)
const STATE_TAX_RATES: Record<string, { name: string; rate: number }> = {
  AL: { name: "Alabama", rate: 5.0 },
  AK: { name: "Alaska", rate: 0 },
  AZ: { name: "Arizona", rate: 2.5 },
  AR: { name: "Arkansas", rate: 4.9 },
  CA: { name: "California", rate: 13.3 },
  CO: { name: "Colorado", rate: 4.4 },
  CT: { name: "Connecticut", rate: 6.99 },
  DE: { name: "Delaware", rate: 6.6 },
  FL: { name: "Florida", rate: 0 },
  GA: { name: "Georgia", rate: 5.49 },
  HI: { name: "Hawaii", rate: 11.0 },
  ID: { name: "Idaho", rate: 5.8 },
  IL: { name: "Illinois", rate: 4.95 },
  IN: { name: "Indiana", rate: 3.05 },
  IA: { name: "Iowa", rate: 5.7 },
  KS: { name: "Kansas", rate: 5.7 },
  KY: { name: "Kentucky", rate: 4.0 },
  LA: { name: "Louisiana", rate: 4.25 },
  ME: { name: "Maine", rate: 7.15 },
  MD: { name: "Maryland", rate: 5.75 },
  MA: { name: "Massachusetts", rate: 5.0 },
  MI: { name: "Michigan", rate: 4.25 },
  MN: { name: "Minnesota", rate: 9.85 },
  MS: { name: "Mississippi", rate: 5.0 },
  MO: { name: "Missouri", rate: 4.95 },
  MT: { name: "Montana", rate: 6.75 },
  NE: { name: "Nebraska", rate: 5.84 },
  NV: { name: "Nevada", rate: 0 },
  NH: { name: "New Hampshire", rate: 0 },
  NJ: { name: "New Jersey", rate: 10.75 },
  NM: { name: "New Mexico", rate: 5.9 },
  NY: { name: "New York", rate: 10.9 },
  NC: { name: "North Carolina", rate: 4.75 },
  ND: { name: "North Dakota", rate: 2.5 },
  OH: { name: "Ohio", rate: 3.5 },
  OK: { name: "Oklahoma", rate: 4.75 },
  OR: { name: "Oregon", rate: 9.9 },
  PA: { name: "Pennsylvania", rate: 3.07 },
  RI: { name: "Rhode Island", rate: 5.99 },
  SC: { name: "South Carolina", rate: 6.4 },
  SD: { name: "South Dakota", rate: 0 },
  TN: { name: "Tennessee", rate: 0 },
  TX: { name: "Texas", rate: 0 },
  UT: { name: "Utah", rate: 4.65 },
  VT: { name: "Vermont", rate: 8.75 },
  VA: { name: "Virginia", rate: 5.75 },
  WA: { name: "Washington", rate: 0 },
  WV: { name: "West Virginia", rate: 5.12 },
  WI: { name: "Wisconsin", rate: 7.65 },
  WY: { name: "Wyoming", rate: 0 },
  DC: { name: "District of Columbia", rate: 10.75 },
};

// Federal tax brackets 2024 (simplified)
const FEDERAL_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// Tax-advantaged account limits 2024
const ACCOUNT_LIMITS = {
  "401(k)": { limit: 23000, catchUp: 7500, catchUpAge: 50 },
  "Traditional IRA": { limit: 7000, catchUp: 1000, catchUpAge: 50 },
  "Roth IRA": { limit: 7000, catchUp: 1000, catchUpAge: 50 },
  "HSA Individual": { limit: 4150, catchUp: 1000, catchUpAge: 55 },
  "HSA Family": { limit: 8300, catchUp: 1000, catchUpAge: 55 },
  "529 Plan": { limit: 18000, catchUp: 0, catchUpAge: 0 }, // Gift tax exclusion
};

function extractStateFromAddress(address: string): string | null {
  // Try to match state abbreviation pattern
  const stateMatch = address.match(/,?\s*([A-Z]{2})\s*\d{5}/);
  if (stateMatch && STATE_TAX_RATES[stateMatch[1]]) {
    return stateMatch[1];
  }
  // Try to match state name
  for (const [code, { name }] of Object.entries(STATE_TAX_RATES)) {
    if (address.toLowerCase().includes(name.toLowerCase())) {
      return code;
    }
  }
  return null;
}

function calculateFederalTax(income: number): number {
  let tax = 0;
  let remainingIncome = income;
  
  for (const bracket of FEDERAL_BRACKETS) {
    if (remainingIncome <= 0) break;
    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }
  
  return tax;
}

export function TaxPlanningDialog({
  open,
  onOpenChange,
  clientProfile,
  financialPlanData,
  enrichedTransactions,
  onAskAI,
}: TaxPlanningDialogProps) {
  // Detect state from client address
  const detectedState = clientProfile?.contact?.address 
    ? extractStateFromAddress(clientProfile.contact.address) 
    : null;
  
  const [selectedState, setSelectedState] = useState<string>(detectedState || "CA");

  // Sync selected state when client profile loads/changes
  useEffect(() => {
    if (detectedState) {
      setSelectedState(detectedState);
    }
  }, [detectedState]);

  // Calculate P&L from financial plan data
  const annualIncome = (financialPlanData?.monthlyIncome || 15000) * 12;
  const annualExpenses = (financialPlanData?.monthlyExpenses || 10000) * 12;
  const netSavings = annualIncome - annualExpenses;
  const savingsRate = annualIncome > 0 ? (netSavings / annualIncome) * 100 : 0;

  // Get tax-advantaged accounts
  const taxAdvantagedAccounts = financialPlanData?.taxAdvantagedAccounts || [];

  // Analyze deductible expenses from transactions
  const deductibleExpenses = useMemo(() => {
    const deductions = {
      charitable: 0,
      medical: 0,
      businessExpenses: 0,
      mortgageInterest: 0,
      saltDeduction: 0,
    };

    enrichedTransactions.forEach(tx => {
      const pillar = tx.pillar?.toLowerCase() || "";
      const subcategory = tx.subcategory?.toLowerCase() || "";
      const amount = Math.abs(tx.amount);

      // Charitable donations
      if (pillar.includes("charit") || subcategory.includes("donation") || subcategory.includes("charity")) {
        deductions.charitable += amount;
      }
      // Medical expenses
      if (pillar.includes("health") || subcategory.includes("medical") || subcategory.includes("pharmacy") || subcategory.includes("doctor")) {
        deductions.medical += amount;
      }
      // Business expenses (self-employment)
      if (pillar.includes("business") || subcategory.includes("office") || subcategory.includes("professional")) {
        deductions.businessExpenses += amount;
      }
    });

    // Estimate mortgage interest (simplified: ~3% of mortgage balance annually)
    const mortgageBalance = parseFloat(clientProfile?.holdings?.mortgage?.replace(/[^0-9.]/g, "") || "0");
    deductions.mortgageInterest = mortgageBalance * 0.03;

    // Estimate SALT (capped at $10,000)
    const estimatedPropertyTax = mortgageBalance * 0.01; // ~1% of home value estimate
    const estimatedStateTax = annualIncome * (STATE_TAX_RATES[selectedState]?.rate || 0) / 100;
    deductions.saltDeduction = Math.min(estimatedPropertyTax + estimatedStateTax, 10000);

    return deductions;
  }, [enrichedTransactions, clientProfile, annualIncome, selectedState]);

  // Calculate total deductions
  const totalDeductions = Object.values(deductibleExpenses).reduce((sum, val) => sum + val, 0);
  
  // Medical deduction threshold (7.5% of AGI)
  const medicalThreshold = annualIncome * 0.075;
  const deductibleMedical = Math.max(0, deductibleExpenses.medical - medicalThreshold);

  // Calculate tax liability
  const stateRate = STATE_TAX_RATES[selectedState]?.rate || 0;
  const taxableIncome = Math.max(0, annualIncome - totalDeductions - 14600); // Standard deduction 2024
  const federalTax = calculateFederalTax(taxableIncome);
  const stateTax = taxableIncome * (stateRate / 100);
  const totalTax = federalTax + stateTax;
  const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;

  // Calculate tax-advantaged account utilization and potential savings
  const accountAnalysis = useMemo(() => {
    return taxAdvantagedAccounts.map(account => {
      const accountType = account.type || account.label;
      const limitInfo = ACCOUNT_LIMITS[accountType as keyof typeof ACCOUNT_LIMITS] || { limit: 23000, catchUp: 0, catchUpAge: 50 };
      const maxContribution = account.maxContribution || limitInfo.limit;
      const currentContribution = account.annualContribution || (account.currentBalance * 0.1);
      const utilizationPercent = Math.min(100, (currentContribution / maxContribution) * 100);
      const remainingRoom = Math.max(0, maxContribution - currentContribution);
      const potentialTaxSavings = remainingRoom * 0.24; // Assume 24% marginal rate

      return {
        name: accountType,
        current: currentContribution,
        max: maxContribution,
        utilization: utilizationPercent,
        remainingRoom,
        potentialSavings: potentialTaxSavings,
      };
    });
  }, [taxAdvantagedAccounts]);

  // Generate optimization recommendations
  const optimizations = useMemo(() => {
    const recommendations: { text: string; savings: number; priority: "high" | "medium" | "low" }[] = [];

    // Check underutilized accounts
    accountAnalysis.forEach(account => {
      if (account.utilization < 80 && account.remainingRoom > 1000) {
        recommendations.push({
          text: `Increase ${account.name} contribution by $${Math.round(account.remainingRoom).toLocaleString()}`,
          savings: account.potentialSavings,
          priority: account.potentialSavings > 2000 ? "high" : "medium",
        });
      }
    });

    // HSA recommendation if not present
    if (!accountAnalysis.find(a => a.name.includes("HSA"))) {
      recommendations.push({
        text: "Consider opening an HSA for triple tax advantage",
        savings: 4150 * 0.24,
        priority: "high",
      });
    }

    // Charitable bunching if donations are moderate
    if (deductibleExpenses.charitable > 2000 && deductibleExpenses.charitable < 10000) {
      recommendations.push({
        text: "Consider charitable bunching strategy - combine 2 years of donations",
        savings: deductibleExpenses.charitable * 0.24,
        priority: "medium",
      });
    }

    // Roth conversion opportunity
    if (savingsRate > 20 && stateRate < 5) {
      recommendations.push({
        text: "Low state tax - consider Roth conversion while in favorable tax situation",
        savings: 0,
        priority: "medium",
      });
    }

    return recommendations.slice(0, 5);
  }, [accountAnalysis, deductibleExpenses, savingsRate, stateRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calculator className="w-6 h-6 text-emerald-600" />
            Tax Planning Analysis
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            {clientProfile?.name ? `${clientProfile.name} • ` : ""}
            {STATE_TAX_RATES[selectedState]?.name || selectedState} ({stateRate}% state tax)
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* State Selection */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filing State:</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-white">
                  {Object.entries(STATE_TAX_RATES)
                    .sort((a, b) => a[1].name.localeCompare(b[1].name))
                    .map(([code, { name, rate }]) => (
                      <SelectItem key={code} value={code}>
                        {name} ({rate}%)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {stateRate === 0 && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  No State Income Tax
                </Badge>
              )}
            </div>

            {/* P&L Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Annual P&L Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Gross Income</p>
                    <p className="text-xl font-bold text-emerald-700">{formatCurrency(annualIncome)}</p>
                  </div>
                  <div className="text-center p-3 bg-rose-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Total Expenses</p>
                    <p className="text-xl font-bold text-rose-700">{formatCurrency(annualExpenses)}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Net Savings</p>
                    <p className="text-xl font-bold text-blue-700">{formatCurrency(netSavings)}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Savings Rate</p>
                    <p className="text-xl font-bold text-purple-700">{savingsRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax-Advantaged Accounts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-emerald-600" />
                  Tax-Advantaged Account Utilization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountAnalysis.length > 0 ? (
                  accountAnalysis.map((account, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{account.name}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(account.current)} / {formatCurrency(account.max)}
                        </span>
                      </div>
                      <Progress 
                        value={account.utilization} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{account.utilization.toFixed(0)}% utilized</span>
                        {account.remainingRoom > 0 && (
                          <span className="text-emerald-600">
                            +{formatCurrency(account.potentialSavings)} potential tax savings
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No tax-advantaged accounts detected. Consider adding 401(k), IRA, or HSA.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Deductible Expenses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Deductible Expenses Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deductibleExpenses.charitable > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Charitable Donations</span>
                      <Badge variant="outline">{formatCurrency(deductibleExpenses.charitable)}</Badge>
                    </div>
                  )}
                  {deductibleExpenses.medical > 0 && (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm">Medical Expenses</span>
                        {deductibleMedical > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(deductibleMedical)} above 7.5% AGI threshold
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">{formatCurrency(deductibleExpenses.medical)}</Badge>
                    </div>
                  )}
                  {deductibleExpenses.mortgageInterest > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Est. Mortgage Interest</span>
                      <Badge variant="outline">{formatCurrency(deductibleExpenses.mortgageInterest)}</Badge>
                    </div>
                  )}
                  {deductibleExpenses.saltDeduction > 0 && (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm">SALT Deduction</span>
                        <p className="text-xs text-muted-foreground">Capped at $10,000</p>
                      </div>
                      <Badge variant="outline">{formatCurrency(deductibleExpenses.saltDeduction)}</Badge>
                    </div>
                  )}
                  {deductibleExpenses.businessExpenses > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Business Expenses</span>
                      <Badge variant="outline">{formatCurrency(deductibleExpenses.businessExpenses)}</Badge>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Potential Deductions</span>
                    <Badge className="bg-emerald-100 text-emerald-700">{formatCurrency(totalDeductions)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Liability Estimate */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-600" />
                  Estimated Tax Liability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Federal Tax</p>
                    <p className="text-lg font-bold text-slate-700">{formatCurrency(federalTax)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">State Tax</p>
                    <p className="text-lg font-bold text-slate-700">{formatCurrency(stateTax)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Tax</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(totalTax)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Effective Rate</p>
                    <p className="text-lg font-bold text-slate-900">{effectiveRate.toFixed(1)}%</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Based on taxable income of {formatCurrency(taxableIncome)} after standard deduction
                </p>
              </CardContent>
            </Card>

            {/* Optimization Recommendations */}
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Tax Optimization Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizations.length > 0 ? (
                    optimizations.map((opt, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                        <Checkbox id={`opt-${idx}`} />
                        <div className="flex-1">
                          <label htmlFor={`opt-${idx}`} className="text-sm font-medium cursor-pointer">
                            {opt.text}
                          </label>
                          {opt.savings > 0 && (
                            <p className="text-xs text-emerald-600 mt-1">
                              Potential savings: {formatCurrency(opt.savings)}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            opt.priority === "high" 
                              ? "border-red-300 text-red-700" 
                              : opt.priority === "medium"
                              ? "border-amber-300 text-amber-700"
                              : "border-slate-300 text-slate-700"
                          }
                        >
                          {opt.priority}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Tax strategy appears optimized. Consider consulting a tax professional for advanced planning.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-slate-50 flex justify-between items-center">
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          <div className="flex gap-2">
            {onAskAI && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onAskAI(`Based on the tax planning analysis showing ${formatCurrency(totalTax)} estimated liability in ${STATE_TAX_RATES[selectedState]?.name}, what specific tax optimization strategies would you recommend for this client?`);
                  onOpenChange(false);
                }}
              >
                Ask AI
              </Button>
            )}
            <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
