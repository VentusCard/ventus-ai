import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings2, Sliders, FileText } from "lucide-react";
import { defaultConfig, cohorts, type FVIConfig } from "@/lib/fviData";

export function FVISettings() {
  const [config, setConfig] = useState<FVIConfig>(defaultConfig);

  const categories = [
    { key: 'gambling', label: 'Gambling' },
    { key: 'paydayLending', label: 'Payday / High-Risk Lending' },
    { key: 'adultContent', label: 'Adult Content' },
    { key: 'cashAdvances', label: 'Cash Advances' },
    { key: 'alcoholTobacco', label: 'Alcohol & Tobacco' },
  ];

  const updateThreshold = (category: string, type: 'spend' | 'incomePct' | 'velocity', tier: 'monitor' | 'alert' | 'critical', value: number) => {
    setConfig(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [category]: {
          ...prev.thresholds[category],
          [type]: { ...prev.thresholds[category][type], [tier]: value },
        },
      },
    }));
  };

  const updateWeight = (key: string, value: number) => {
    setConfig(prev => ({ ...prev, weights: { ...prev.weights, [key]: value } }));
  };

  const totalWeight = Object.values(config.weights).reduce((sum, w) => sum + w, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-slate-700" />
          FVI Configuration
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Configure thresholds, weights, and cohort definitions to match your bank's risk appetite</p>
      </div>

      {/* Threshold Configuration */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Threshold Configuration
          </CardTitle>
          <CardDescription className="text-xs">Per-category sensitivity levels for Monitor / Alert / Critical tiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map(cat => {
            const th = config.thresholds[cat.key];
            return (
              <div key={cat.key} className="border border-slate-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">{cat.label}</h4>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label className="text-xs text-slate-500 mb-2 block">Spend Threshold ($)</Label>
                    <div className="space-y-2">
                      {(['monitor', 'alert', 'critical'] as const).map(tier => (
                        <div key={tier} className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[9px] w-14 justify-center" style={{
                            backgroundColor: tier === 'monitor' ? '#FEF3C7' : tier === 'alert' ? '#FFEDD5' : '#FEE2E2',
                            color: tier === 'monitor' ? '#D97706' : tier === 'alert' ? '#EA580C' : '#DC2626',
                          }}>{tier}</Badge>
                          <Slider
                            value={[th.spend[tier]]}
                            onValueChange={([v]) => updateThreshold(cat.key, 'spend', tier, v)}
                            min={0} max={2000} step={50}
                            className="flex-1"
                          />
                          <span className="text-xs text-slate-500 w-12 text-right">${th.spend[tier]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 mb-2 block">% of Income</Label>
                    <div className="space-y-2">
                      {(['monitor', 'alert', 'critical'] as const).map(tier => (
                        <div key={tier} className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[9px] w-14 justify-center" style={{
                            backgroundColor: tier === 'monitor' ? '#FEF3C7' : tier === 'alert' ? '#FFEDD5' : '#FEE2E2',
                            color: tier === 'monitor' ? '#D97706' : tier === 'alert' ? '#EA580C' : '#DC2626',
                          }}>{tier}</Badge>
                          <Slider
                            value={[th.incomePct[tier]]}
                            onValueChange={([v]) => updateThreshold(cat.key, 'incomePct', tier, v)}
                            min={0} max={50} step={1}
                            className="flex-1"
                          />
                          <span className="text-xs text-slate-500 w-10 text-right">{th.incomePct[tier]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 mb-2 block">Velocity (MoM %)</Label>
                    <div className="space-y-2">
                      {(['monitor', 'alert', 'critical'] as const).map(tier => (
                        <div key={tier} className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[9px] w-14 justify-center" style={{
                            backgroundColor: tier === 'monitor' ? '#FEF3C7' : tier === 'alert' ? '#FFEDD5' : '#FEE2E2',
                            color: tier === 'monitor' ? '#D97706' : tier === 'alert' ? '#EA580C' : '#DC2626',
                          }}>{tier}</Badge>
                          <Slider
                            value={[th.velocity[tier]]}
                            onValueChange={([v]) => updateThreshold(cat.key, 'velocity', tier, v)}
                            min={0} max={300} step={10}
                            className="flex-1"
                          />
                          <span className="text-xs text-slate-500 w-12 text-right">{th.velocity[tier]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Cohort Definition Rules */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Cohort Definition Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-xs text-slate-500 mb-2 block">Financial Distress Cascade — Category Combinations</Label>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.key} className="flex items-center gap-2 text-xs text-slate-700">
                    <Checkbox
                      checked={config.cohortRules.distressCascadeCombinations.includes(cat.key)}
                      onCheckedChange={(checked) => {
                        setConfig(prev => ({
                          ...prev,
                          cohortRules: {
                            ...prev.cohortRules,
                            distressCascadeCombinations: checked
                              ? [...prev.cohortRules.distressCascadeCombinations, cat.key]
                              : prev.cohortRules.distressCascadeCombinations.filter(c => c !== cat.key),
                          },
                        }));
                      }}
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">New Pattern Emergence — Minimum Amount</Label>
                <Select
                  value={String(config.cohortRules.newPatternMinAmount)}
                  onValueChange={v => setConfig(prev => ({ ...prev, cohortRules: { ...prev.cohortRules, newPatternMinAmount: Number(v) } }))}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">$50</SelectItem>
                    <SelectItem value="100">$100</SelectItem>
                    <SelectItem value="200">$200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Cohort Outlier — σ Threshold</Label>
                <Select
                  value={String(config.cohortRules.outlierSigma)}
                  onValueChange={v => setConfig(prev => ({ ...prev, cohortRules: { ...prev.cohortRules, outlierSigma: Number(v) } }))}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2σ</SelectItem>
                    <SelectItem value="3">3σ</SelectItem>
                    <SelectItem value="4">4σ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Recovery Trajectory — Months of Decline</Label>
                <Select
                  value={String(config.cohortRules.recoveryMonths)}
                  onValueChange={v => setConfig(prev => ({ ...prev, cohortRules: { ...prev.cohortRules, recoveryMonths: Number(v) } }))}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="2">2 months</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composite Score Weights */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Composite Score Weights</CardTitle>
          <CardDescription className="text-xs">
            Total: <span className={totalWeight === 100 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{totalWeight}%</span>
            {totalWeight !== 100 && ' (must equal 100%)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...categories, { key: 'other', label: 'Other' }].map(cat => (
            <div key={cat.key} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 w-44">{cat.label}</span>
              <Slider
                value={[config.weights[cat.key]]}
                onValueChange={([v]) => updateWeight(cat.key, v)}
                min={0} max={50} step={5}
                className="flex-1"
              />
              <span className="text-xs font-medium text-slate-700 w-10 text-right">{config.weights[cat.key]}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Templates */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Action Templates
          </CardTitle>
          <CardDescription className="text-xs">Customize recommended next steps per cohort to match your bank's programs and brand voice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cohorts.filter(c => c.recommendedActions.length > 0).slice(0, 4).map(cohort => (
            <div key={cohort.id} className="border border-slate-100 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">{cohort.name}</h4>
              {cohort.recommendedActions.map((action, i) => (
                <Textarea
                  key={action.id}
                  defaultValue={action.description}
                  className="text-xs mb-2 min-h-[36px] resize-none"
                  rows={1}
                />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
