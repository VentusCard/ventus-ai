import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DollarSign } from "lucide-react";
import { ExpenseCategory } from "@/types/financial-planning";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";

interface IncomeExpenseEditorProps {
  monthlyIncome: number;
  onIncomeChange: (income: number) => void;
  expenses: ExpenseCategory[];
  onExpensesChange: (expenses: ExpenseCategory[]) => void;
}

export function IncomeExpenseEditor({
  monthlyIncome,
  onIncomeChange,
  expenses,
  onExpensesChange,
}: IncomeExpenseEditorProps) {
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.monthlyAmount, 0);

  const handleExpenseChange = (id: string, amount: number) => {
    const updated = expenses.map(e => {
      if (e.id === id) {
        return { 
          ...e, 
          monthlyAmount: amount,
          percentage: monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0
        };
      }
      return e;
    });
    onExpensesChange(updated);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Income & Expenses</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Income */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="font-medium">Monthly Income</Label>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(monthlyIncome)}
            </span>
          </div>
          <Input
            type="number"
            value={monthlyIncome}
            onChange={(e) => onIncomeChange(parseFloat(e.target.value) || 0)}
            className="text-right font-medium"
          />
        </div>

        {/* Expenses */}
        <div className="space-y-1">
          <div className="flex justify-between items-center mb-3">
            <Label className="font-medium">Monthly Expenses</Label>
            <span className={`font-bold ${totalExpenses > monthlyIncome ? 'text-red-600' : 'text-slate-900'}`}>
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          
          <div className="space-y-4">
            {expenses.map((expense) => {
              const percentage = monthlyIncome > 0 
                ? ((expense.monthlyAmount / monthlyIncome) * 100).toFixed(0)
                : "0";
              
              return (
                <div key={expense.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: expense.color }}
                      />
                      <span>{expense.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">
                        {percentage}%
                      </span>
                      <span className="font-medium w-20 text-right">
                        {formatCurrency(expense.monthlyAmount)}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[expense.monthlyAmount]}
                    onValueChange={([value]) => handleExpenseChange(expense.id, value)}
                    min={0}
                    max={Math.max(monthlyIncome * 0.5, expense.monthlyAmount * 2)}
                    step={50}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual breakdown bar */}
        <div className="pt-4 border-t">
          <Label className="text-sm mb-2 block">Expense Breakdown</Label>
          <div className="flex h-4 rounded-full overflow-hidden bg-slate-200">
            {expenses.map((expense) => {
              const width = monthlyIncome > 0 
                ? (expense.monthlyAmount / monthlyIncome) * 100 
                : 0;
              return (
                <div
                  key={expense.id}
                  className="transition-all"
                  style={{ 
                    width: `${width}%`, 
                    backgroundColor: expense.color 
                  }}
                  title={`${expense.label}: ${formatCurrency(expense.monthlyAmount)}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
