import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FVISensitivityMatrix } from "./FVISensitivityMatrix";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, AlertTriangle, TrendingUp, ShieldAlert, Eye } from "lucide-react";
import { cohorts, FVICohort, getRiskColor, getTrendIcon, getRiskLevel, RISK_COLORS } from "@/lib/fviData";
import type { RiskLevel } from "@/lib/fviData";

interface FVICohortOverviewProps {
  onViewCohort: (cohortId: string) => void;
}

const totalMonitored = 12847;
const totalFlagged = cohorts.reduce((sum, c) => sum + (c.avgFviScore > 25 ? c.customerCount : 0), 0);
const cohortsRequiringAction = cohorts.filter(c => c.avgFviScore > 50).length;

const riskFilters: { label: string; value: RiskLevel | 'all' }[] = [
  { label: 'All Cohorts', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Alert', value: 'alert' },
  { label: 'Monitor', value: 'monitor' },
  { label: 'Green', value: 'green' },
];

export function FVICohortOverview({ onViewCohort }: FVICohortOverviewProps) {
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [portfolio, setPortfolio] = useState('all');

  const filteredCohorts = riskFilter === 'all'
    ? cohorts
    : cohorts.filter(c => getRiskLevel(c.avgFviScore) === riskFilter);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-700" />
            Financial Vulnerability Indicators
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Identify and protect at-risk customer cohorts</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={portfolio} onValueChange={setPortfolio}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="premier">Premier</SelectItem>
              <SelectItem value="mass-retail">Mass Retail</SelectItem>
              <SelectItem value="small-business">Small Business</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="6m">
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Users className="w-3.5 h-3.5" /> Total Monitored
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalMonitored.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-0.5">Active customer accounts</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Vulnerability Signals
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {totalFlagged.toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1">({((totalFlagged / totalMonitored) * 100).toFixed(1)}%)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Customers showing signals</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Cohorts Requiring Action
            </div>
            <div className="text-2xl font-bold text-slate-900">{cohortsRequiringAction} <span className="text-sm font-normal text-slate-400">of {cohorts.length}</span></div>
            <p className="text-xs text-slate-400 mt-0.5">Have recommended interventions</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-red-500" /> Quarterly Trend
            </div>
            <div className="text-2xl font-bold text-red-600">↗ +12%</div>
            <p className="text-xs text-slate-400 mt-0.5">Increase in flagged customers vs prior quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Sensitivity Matrix */}
      <FVISensitivityMatrix />
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">Filter:</span>
        {riskFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setRiskFilter(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              riskFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.value !== 'all' && (
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: RISK_COLORS[f.value as RiskLevel] }} />
            )}
            {f.label}
          </button>
        ))}
      </div>

      {/* Cohort Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCohorts.map(cohort => (
          <CohortCard key={cohort.id} cohort={cohort} onView={() => onViewCohort(cohort.id)} />
        ))}
      </div>

      {filteredCohorts.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No cohorts match the selected filter</p>
        </div>
      )}
    </div>
  );
}

function CohortCard({ cohort, onView }: { cohort: FVICohort; onView: () => void }) {
  const riskLevel = getRiskLevel(cohort.avgFviScore);
  const isUrgent = (cohort.trend === 'growing' && cohort.avgFviScore >= 70);
  const isRecovery = cohort.id === 'recovery-trajectory';

  return (
    <Card className={`bg-white border-slate-200 transition-all ${
      isUrgent ? 'ring-1 ring-red-200 shadow-md' : ''
    } ${isRecovery ? 'ring-1 ring-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              {cohort.name}
              {isUrgent && <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">{cohort.description}</p>
          </div>
          <div className="text-right shrink-0 ml-3">
            <div className="text-2xl font-bold" style={{ color: getRiskColor(cohort.avgFviScore) }}>
              {cohort.avgFviScore}
            </div>
            <div className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: getRiskColor(cohort.avgFviScore) }}>
              {riskLevel}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-700 font-medium">{cohort.customerCount.toLocaleString()} customers</span>
          <span className="text-slate-400">({cohort.totalPortfolioPercent}%)</span>
          <span className={`font-medium ${
            cohort.trend === 'growing' && cohort.avgFviScore > 50 ? 'text-red-600' :
            cohort.trend === 'growing' && cohort.avgFviScore <= 50 ? 'text-green-600' :
            cohort.trend === 'shrinking' ? 'text-green-600' : 'text-slate-500'
          }`}>
            {getTrendIcon(cohort.trend)} {cohort.trendPercent > 0 ? `${cohort.trend === 'shrinking' ? '-' : '+'}${cohort.trendPercent}%` : 'Stable'}
          </span>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {cohort.topCategories.map(cat => (
            <Badge key={cat} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-normal">
              {cat}
            </Badge>
          ))}
        </div>

        {/* Recommended actions */}
        <div className="border-t border-slate-100 pt-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Recommended Next Steps</p>
          <ul className="space-y-1">
            {cohort.recommendedActions.slice(0, 2).map(action => (
              <li key={action.id} className="text-xs text-slate-600 flex items-start gap-1.5">
                <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: action.priority === 'high' ? '#EF4444' : action.priority === 'medium' ? '#F97316' : '#94A3B8' }} />
                {action.description}
              </li>
            ))}
          </ul>
        </div>

        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={onView}>
          <Eye className="w-3 h-3 mr-1" /> View Cohort
        </Button>
      </CardContent>
    </Card>
  );
}
