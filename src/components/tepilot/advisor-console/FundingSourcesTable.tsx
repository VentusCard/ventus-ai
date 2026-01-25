import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { FundingSource } from "@/types/lifestyle-signals";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";

interface FundingSourcesTableProps {
  sources: FundingSource[];
  years: number[];
  projectType: string;
  onChange: (sources: FundingSource[]) => void;
}

const fundingTypeLabels: Record<string, string> = {
  "529": "529 Plan",
  "gifts": "Annual Gifts/Family",
  "taxable": "Taxable Investment",
  "roth_ira": "Roth IRA",
  "ira_traditional": "Traditional IRA",
  "401k": "401(k) Distributions",
  "utma": "UTMA/UGMA",
  "loan": "Personal Loan",
  "savings": "Savings Account",
  "home_equity": "Home Equity/HELOC",
  "pension": "Pension",
  "social_security": "Social Security",
  "business_loan": "Business Loan/SBA",
  "investor": "Investor Funding",
  "grant": "Grants",
  "credit": "Credit Card/Financing",
  "inheritance": "Inheritance/Windfall",
  "other": "Other"
};

const fundingSourcesByProjectType: Record<string, FundingSource["type"][]> = {
  education: ["529", "utma", "gifts", "savings", "taxable", "loan", "other"],
  home: ["savings", "home_equity", "gifts", "taxable", "loan", "inheritance", "other"],
  retirement: ["roth_ira", "ira_traditional", "401k", "pension", "social_security", "taxable", "savings", "other"],
  business: ["business_loan", "investor", "savings", "grant", "taxable", "other"],
  wedding: ["savings", "gifts", "credit", "other"],
  medical: ["savings", "taxable", "loan", "gifts", "other"],
  other: ["savings", "taxable", "gifts", "loan", "other"]
};

export function FundingSourcesTable({ sources, years, projectType, onChange }: FundingSourcesTableProps) {
  const availableFundingTypes = fundingSourcesByProjectType[projectType] || fundingSourcesByProjectType.other;

  const addSource = () => {
    const newSource: FundingSource = {
      id: `source-${Date.now()}`,
      type: "savings",
      label: "New Source",
      amounts: {}
    };
    onChange([...sources, newSource]);
  };

  const removeSource = (id: string) => {
    onChange(sources.filter(s => s.id !== id));
  };

  const updateSourceType = (id: string, type: FundingSource["type"]) => {
    onChange(sources.map(s => s.id === id ? { ...s, type, label: fundingTypeLabels[type] } : s));
  };

  const updateSourceAmount = (id: string, year: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange(sources.map(s => {
      if (s.id === id) {
        return { ...s, amounts: { ...s.amounts, [year]: numValue } };
      }
      return s;
    }));
  };

  const getTotalForYear = (year: number) => {
    return sources.reduce((sum, source) => sum + (source.amounts[year] || 0), 0);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <CardTitle className="text-base">Funding Sources</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={addSource}>
            <Plus className="w-4 h-4 mr-1" />
            Add Source
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Source Type</th>
                {years.map(year => (
                  <th key={year} className="text-right p-2 font-medium">{year}</th>
                ))}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id} className="border-b hover:bg-slate-50">
                  <td className="p-2">
                    <Select value={source.type} onValueChange={(value) => updateSourceType(source.id, value as FundingSource["type"])}>
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFundingTypes.map((type) => (
                          <SelectItem key={type} value={type}>{fundingTypeLabels[type]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {years.map(year => (
                    <td key={year} className="p-2">
                      <Input
                        type="number"
                        value={source.amounts[year] || ''}
                        onChange={(e) => updateSourceAmount(source.id, year, e.target.value)}
                        placeholder="$0"
                        className="h-8 text-right"
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => removeSource(source.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              <tr className="font-semibold bg-slate-50">
                <td className="p-2">Total Funding</td>
                {years.map(year => (
                  <td key={year} className="p-2 text-right text-green-600">
                    {formatCurrency(getTotalForYear(year))}
                  </td>
                ))}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
