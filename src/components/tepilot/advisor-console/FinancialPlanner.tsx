import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, TrendingUp, Target, FileDown, Save, 
  ArrowLeft, Calculator, Clock,
  DollarSign, CalendarClock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientProfileData } from "@/types/clientProfile";
import { AIInsights, LifeEvent, ActionableTimelineItem } from "@/types/lifestyle-signals";
import { EnrichedTransaction } from "@/types/transaction";
import { PsychologicalInsight } from "./sampleData";
import { 
  FinancialGoal, 
  AssetAllocation, 
  ExpenseCategory, 
  RetirementProfile,
  TaxAdvantagedAccount,
  defaultExpenseCategories,
  defaultRetirementProfile,
  defaultTaxAdvantagedAccounts,
  getTimeHorizon,
} from "@/types/financial-planning";
import { NetWorthProjectionChart } from "./NetWorthProjectionChart";
import { AssetAllocationEditor } from "./AssetAllocationEditor";
import { FinancialGoalsSection } from "./FinancialGoalsSection";
import { IncomeExpenseEditor } from "./IncomeExpenseEditor";
import { RetirementPlanningSection } from "./RetirementPlanningSection";
import { GlidePathVisualization } from "./GlidePathVisualization";
import { TaxAdvantagedAccountsSection } from "./TaxAdvantagedAccountsSection";
import { RMDCalculator } from "./RMDCalculator";
import { MonteCarloSimulator } from "./MonteCarloSimulator";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FinancialPlannerProps {
  clientProfile: ClientProfileData | null;
  aiInsights: AIInsights | null;
  enrichedTransactions: EnrichedTransaction[];
  psychologicalInsights: PsychologicalInsight[];
  onOpenLifeEventPlanner: (event: LifeEvent) => void;
  onSaveActionItems: (items: { id: string; text: string; completed: boolean }[]) => void;
  importedGoals?: FinancialGoal[];
}

export function FinancialPlanner({
  clientProfile,
  aiInsights,
  enrichedTransactions,
  psychologicalInsights,
  onOpenLifeEventPlanner,
  onSaveActionItems,
  importedGoals = [],
}: FinancialPlannerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for financial planning inputs
  const [monthlyIncome, setMonthlyIncome] = useState(15000);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(defaultExpenseCategories);
  const [goals, setGoals] = useState<FinancialGoal[]>(importedGoals);
  const [currentAllocation, setCurrentAllocation] = useState<AssetAllocation>({
    stocks: 60, bonds: 25, cash: 10, realEstate: 5, other: 0
  });
  const [targetAllocation, setTargetAllocation] = useState<AssetAllocation>({
    stocks: 70, bonds: 20, cash: 5, realEstate: 5, other: 0
  });
  const [actionItems, setActionItems] = useState<ActionableTimelineItem[]>([]);
  const [projectionYears, setProjectionYears] = useState(30); // Default to 30 years for long-term
  const [expectedReturn, setExpectedReturn] = useState(6); // 6% expected return
  const [inflationRate, setInflationRate] = useState(3);
  
  // Long-term planning specific state
  const [retirementProfile, setRetirementProfile] = useState<RetirementProfile>(defaultRetirementProfile);
  const [taxAdvantagedAccounts, setTaxAdvantagedAccounts] = useState<TaxAdvantagedAccount[]>(defaultTaxAdvantagedAccounts);
  const [monteCarloResults, setMonteCarloResults] = useState<{
    successRate: number;
    medianOutcome: number;
    worstCase: number;
    bestCase: number;
    targetGoal: number;
  } | null>(null);

  // Auto-import life events as goals on mount
  useEffect(() => {
    if (!aiInsights?.detected_events?.length) return;
    
    const eventsWithProjections = aiInsights.detected_events.filter(e => e.financial_projection);
    if (eventsWithProjections.length === 0) return;
    
    setGoals(prev => {
      // Check for already imported goals (by linkedEventId or name)
      const existingLinkedIds = new Set(prev.map(g => g.linkedEventId || g.name).filter(Boolean));
      
      const newGoals = eventsWithProjections
        .filter(event => !existingLinkedIds.has(event.event_name))
        .map((event, idx) => {
          const targetDate = `${event.financial_projection?.estimated_start_year || new Date().getFullYear() + 5}-01-01`;
          return {
            id: `auto-imported-${Date.now()}-${idx}`,
            name: event.event_name,
            type: (event.financial_projection?.project_type || 'custom') as FinancialGoal['type'],
            targetAmount: event.financial_projection?.estimated_total_cost || 0,
            currentAmount: event.financial_projection?.estimated_current_savings || 0,
            targetDate,
            priority: prev.length + idx + 1,
            monthlyContribution: event.financial_projection?.recommended_monthly_contribution || 0,
            linkedEventId: event.event_name,
            timeHorizon: getTimeHorizon(targetDate),
          };
        });
      
      if (newGoals.length > 0) {
        toast({ 
          title: "Life Events Imported", 
          description: `${newGoals.length} goal(s) auto-imported from detected life events` 
        });
        return [...prev, ...newGoals];
      }
      
      return prev;
    });
  }, [aiInsights, toast]);

  // Calculate derived values
  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, e) => sum + e.monthlyAmount, 0), 
    [expenses]
  );
  
  const monthlySavings = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Get current net worth from client profile or calculate
  const currentNetWorth = useMemo(() => {
    if (!clientProfile?.holdings) return 500000;
    const { deposit, credit, mortgage, investments } = clientProfile.holdings;
    const parseAmount = (str: string) => {
      const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? 0 : num;
    };
    return parseAmount(deposit) + parseAmount(investments) - parseAmount(credit) - parseAmount(mortgage);
  }, [clientProfile]);

  // Persist financial planning data to sessionStorage for AI context
  useEffect(() => {
    const financialPlanData = {
      monthlyIncome,
      monthlyExpenses: totalExpenses,
      savingsRate,
      currentNetWorth,
      goals: goals.map(g => ({
        name: g.name,
        type: g.type,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
        monthlyContribution: g.monthlyContribution,
        progressPercent: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
        timeHorizon: g.timeHorizon,
      })),
      retirementProfile: {
        currentAge: retirementProfile.currentAge,
        retirementAge: retirementProfile.retirementAge,
        yearsToRetirement: retirementProfile.retirementAge - retirementProfile.currentAge,
        desiredRetirementIncome: retirementProfile.desiredRetirementIncome,
        socialSecurityEstimate: retirementProfile.socialSecurityEstimate,
        currentRetirementSavings: retirementProfile.currentRetirementSavings,
      },
      taxAdvantagedAccounts: taxAdvantagedAccounts.map(a => ({
        type: a.type,
        label: a.label,
        currentBalance: a.currentBalance,
        annualContribution: a.annualContribution,
        maxContribution: a.maxContribution,
        utilizationPercent: a.maxContribution > 0 ? Math.round((a.annualContribution / a.maxContribution) * 100) : 0,
      })),
      assetAllocation: {
        current: currentAllocation,
        target: targetAllocation,
      },
      monteCarloResults,
      rmdEstimate: retirementProfile.currentAge >= 70 ? {
        clientAge: retirementProfile.currentAge,
        totalRMDBalance: taxAdvantagedAccounts
          .filter(a => ['401k', 'traditional_ira'].includes(a.type))
          .reduce((sum, a) => sum + a.currentBalance, 0),
        estimatedAnnualRMD: 0,
      } : undefined,
    };
    sessionStorage.setItem("tepilot_financial_plan", JSON.stringify(financialPlanData));
  }, [monthlyIncome, totalExpenses, savingsRate, goals, retirementProfile, taxAdvantagedAccounts, currentAllocation, targetAllocation, currentNetWorth, monteCarloResults]);

  // Generate net worth projection (30 years default for long-term focus)
  const projectedNetWorth = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const annualSavings = monthlySavings * 12;
    const returnRate = expectedReturn / 100;
    
    return Array.from({ length: projectionYears + 1 }, (_, i) => {
      const years = i;
      const futureValue = currentNetWorth * Math.pow(1 + returnRate, years) +
        annualSavings * ((Math.pow(1 + returnRate, years) - 1) / (returnRate || 0.001));
      
      return {
        year: currentYear + i,
        value: Math.round(futureValue)
      };
    });
  }, [currentNetWorth, monthlySavings, expectedReturn, projectionYears]);


  // Generate decade-based action items
  const generateActionItems = useCallback(() => {
    const items: ActionableTimelineItem[] = [];
    const currentYear = new Date().getFullYear();
    const yearsToRetirement = retirementProfile.retirementAge - retirementProfile.currentAge;

    // This Year - Immediate actions
    const totalTaxAdvContrib = taxAdvantagedAccounts.reduce((sum, a) => sum + a.annualContribution, 0);
    const totalTaxAdvMax = taxAdvantagedAccounts.reduce((sum, a) => sum + a.maxContribution, 0);
    if (totalTaxAdvContrib < totalTaxAdvMax) {
      items.push({
        id: `action-${Date.now()}-0`,
        timing: `${currentYear}`,
        action: `Max out tax-advantaged accounts - ${formatCurrency(totalTaxAdvMax - totalTaxAdvContrib)} remaining capacity`,
        completed: false
      });
    }

    // Check employer match
    const account401k = taxAdvantagedAccounts.find(a => a.type === '401k');
    if (account401k?.employerMatch && account401k.annualContribution < (account401k.employerMatch * 2)) {
      items.push({
        id: `action-${Date.now()}-1`,
        timing: `${currentYear}`,
        action: "PRIORITY: Increase 401(k) contributions to capture full employer match",
        completed: false
      });
    }

    // Savings rate check
    if (savingsRate < 15) {
      items.push({
        id: `action-${Date.now()}-2`,
        timing: `${currentYear}`,
        action: `Increase savings rate from ${savingsRate.toFixed(0)}% to at least 15%`,
        completed: false
      });
    }

    // Next 5 years
    items.push({
      id: `action-${Date.now()}-3`,
      timing: `${currentYear}-${currentYear + 5}`,
      action: "Build emergency fund to 6 months expenses, establish Roth conversion strategy",
      completed: false
    });

    // Asset allocation check
    const allocationDiff = Math.abs(currentAllocation.stocks - targetAllocation.stocks);
    if (allocationDiff > 10) {
      items.push({
        id: `action-${Date.now()}-4`,
        timing: `${currentYear + 1}`,
        action: `Rebalance portfolio: adjust stocks from ${currentAllocation.stocks}% toward target ${targetAllocation.stocks}%`,
        completed: false
      });
    }

    // Pre-retirement (10 years out)
    if (yearsToRetirement <= 15 && yearsToRetirement > 5) {
      items.push({
        id: `action-${Date.now()}-5`,
        timing: `${currentYear + 5}-${currentYear + 10}`,
        action: "Review glide path, consider catch-up contributions (age 50+), optimize Social Security timing",
        completed: false
      });
    }

    // 5 years to retirement
    if (yearsToRetirement <= 10 && yearsToRetirement > 0) {
      items.push({
        id: `action-${Date.now()}-6`,
        timing: `${retirementProfile.retirementAge - 5}-${retirementProfile.retirementAge}`,
        action: "Finalize retirement income plan, healthcare coverage (Medicare/ACA), reduce portfolio volatility",
        completed: false
      });
    }

    // Post-retirement / Estate planning
    items.push({
      id: `action-${Date.now()}-7`,
      timing: `${retirementProfile.retirementAge}+`,
      action: "Implement RMD strategy, review estate plan and beneficiaries, consider legacy goals",
      completed: false
    });

    // Psychology-informed recommendations
    const riskTolerance = psychologicalInsights.find(p => p.aspect === "Risk Tolerance");
    if (riskTolerance?.sliderValue && riskTolerance.sliderValue <= 2) {
      items.push({
        id: `action-${Date.now()}-psych`,
        timing: "Ongoing",
        action: "Consider more conservative allocation given risk profile - prioritize capital preservation",
        completed: false
      });
    }

    setActionItems(items);
    toast({ 
      title: "Decade-Based Timeline Generated", 
      description: `${items.length} action items created for your long-term plan` 
    });
  }, [savingsRate, currentAllocation, targetAllocation, taxAdvantagedAccounts, retirementProfile, psychologicalInsights, toast]);

  // Save plan and action items
  const handleSavePlan = () => {
    const planItems = actionItems.map(item => ({
      id: item.id,
      text: `${item.timing}: ${item.action}`,
      completed: item.completed
    }));
    
    onSaveActionItems(planItems);
    
    toast({
      title: "Plan Saved",
      description: "Action items added to Next Steps panel"
    });
    
    navigate("/tepilot/advisor-console");
  };

  // Export to PDF
  const handleExportPDF = async () => {
    const element = document.getElementById("financial-plan-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`long-term-financial-plan-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({ title: "PDF Exported", description: "Long-term financial plan saved as PDF" });
    } catch (error) {
      toast({ title: "Export Failed", description: "Could not generate PDF", variant: "destructive" });
    }
  };

  const toggleActionItem = (id: string) => {
    setActionItems(prev => 
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  return (
    <div id="financial-plan-content" className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/tepilot/advisor-console")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Console
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Long-Term Financial Planning</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button size="sm" onClick={handleSavePlan}>
            <Save className="w-4 h-4 mr-2" />
            Save Plan
          </Button>
        </div>
      </div>

      {/* Client Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Client Overview</CardTitle>
            </div>
            {clientProfile && (
              <Badge variant="secondary">{clientProfile.segment}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Client Name</p>
              <p className="font-semibold">{clientProfile?.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-semibold">{retirementProfile.currentAge}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Net Worth</p>
              <p className="font-semibold text-primary">{formatCurrency(currentNetWorth)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Years to Retirement</p>
              <p className="font-semibold">{retirementProfile.retirementAge - retirementProfile.currentAge}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Profile</p>
              <p className="font-semibold">{clientProfile?.compliance?.riskProfile || "Moderate"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retirement Planning Section - Most Prominent */}
      <RetirementPlanningSection
        profile={retirementProfile}
        onProfileChange={setRetirementProfile}
        currentNetWorth={currentNetWorth}
      />

      {/* Net Worth Projection - Enhanced with Scenarios */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Net Worth Projection</CardTitle>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Years:</Label>
                <Input 
                  type="number"
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(Math.max(10, Math.min(50, parseInt(e.target.value) || 30)))}
                  className="w-16 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Return %:</Label>
                <Input 
                  type="number"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Math.max(0, Math.min(15, parseFloat(e.target.value) || 6)))}
                  className="w-16 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Inflation %:</Label>
                <Input 
                  type="number"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Math.min(10, parseFloat(e.target.value) || 3)))}
                  className="w-16 h-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <NetWorthProjectionChart 
            data={projectedNetWorth}
            currentNetWorth={currentNetWorth}
            currentAge={retirementProfile.currentAge}
            retirementAge={retirementProfile.retirementAge}
            inflationRate={inflationRate}
          />
        </CardContent>
      </Card>

      {/* Glide Path Visualization */}
      <GlidePathVisualization
        currentAge={retirementProfile.currentAge}
        retirementAge={retirementProfile.retirementAge}
        currentAllocation={currentAllocation}
      />

      {/* Monte Carlo Simulator */}
      <MonteCarloSimulator
        initialPortfolio={retirementProfile.currentRetirementSavings}
        annualContribution={taxAdvantagedAccounts.reduce((sum, a) => sum + a.annualContribution, 0)}
        yearsToRetirement={retirementProfile.retirementAge - retirementProfile.currentAge}
        targetGoal={retirementProfile.desiredRetirementIncome * 25}
        onResultsChange={setMonteCarloResults}
      />

      {/* Tax-Advantaged Accounts */}
      <TaxAdvantagedAccountsSection
        accounts={taxAdvantagedAccounts}
        onAccountsChange={setTaxAdvantagedAccounts}
        clientAge={retirementProfile.currentAge}
      />

      {/* RMD Calculator */}
      <RMDCalculator 
        clientAge={retirementProfile.currentAge} 
        taxAdvantagedAccounts={taxAdvantagedAccounts}
      />

      {/* Asset Allocation */}
      <AssetAllocationEditor
        currentAllocation={currentAllocation}
        targetAllocation={targetAllocation}
        onTargetChange={setTargetAllocation}
      />

      {/* Financial Goals - Grouped by Time Horizon */}
      <FinancialGoalsSection
        goals={goals}
        onGoalsChange={setGoals}
        detectedEvents={aiInsights?.detected_events || []}
        onOpenEventPlanner={onOpenLifeEventPlanner}
      />

      {/* Decade-Based Action Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Decade-Based Action Timeline</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={generateActionItems}>
              <Calculator className="w-4 h-4 mr-2" />
              Generate Timeline
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {actionItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click "Generate Timeline" to create decade-based action items</p>
              <p className="text-sm">Based on your retirement profile and long-term goals</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.completed ? 'bg-muted/50 opacity-70' : 'bg-background'
                  }`}
                >
                  <Checkbox 
                    checked={item.completed}
                    onCheckedChange={() => toggleActionItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {item.timing}
                      </Badge>
                    </div>
                    <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income & Expenses (Collapsed by default for long-term focus) */}
      <details className="group">
        <summary className="cursor-pointer list-none">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Income & Expenses</CardTitle>
                  <Badge variant="secondary">
                    Savings Rate: {savingsRate.toFixed(0)}%
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground group-open:hidden">Click to expand</span>
                <span className="text-sm text-muted-foreground hidden group-open:inline">Click to collapse</span>
              </div>
            </CardHeader>
          </Card>
        </summary>
        <div className="mt-2">
          <IncomeExpenseEditor
            monthlyIncome={monthlyIncome}
            onIncomeChange={setMonthlyIncome}
            expenses={expenses}
            onExpensesChange={setExpenses}
          />
        </div>
      </details>
    </div>
  );
}
