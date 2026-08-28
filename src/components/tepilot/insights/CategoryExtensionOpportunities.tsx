import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CATEGORY_EXTENSION_OPPORTUNITIES, getCategoryExtensionSummary } from "@/lib/categoryExtensionData";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import {
  ArrowRight, Users, DollarSign, TrendingUp, Calendar, Target, ChevronDown, ExternalLink, Megaphone
} from "lucide-react";

import type { CategoryExtensionOpportunity } from "@/types/bankwide";

type SortKey = 'estimatedRevenue' | 'confidenceScore' | 'priority';

const PILLAR_FILTERS = [
  'All',
  'Sports & Active Living',
  'Family & Community',
  'Home & Living',
  'Travel & Exploration',
  'Food & Dining',
  'Health & Wellness',
  'Entertainment & Culture',
  'Technology & Digital Life',
  'Pets',
  'Style & Beauty',
];

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

interface CategoryExtensionOpportunitiesProps {
  onLaunchCampaign?: (productName: string, offers: string[]) => void;
}

export function CategoryExtensionOpportunities({ onLaunchCampaign }: CategoryExtensionOpportunitiesProps = {}) {
  const [sortBy, setSortBy] = useState<SortKey>('estimatedRevenue');
  const [pillarFilter, setPillarFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const summary = useMemo(() => getCategoryExtensionSummary(), []);


  const filtered = useMemo(() => {
    let items = [...CATEGORY_EXTENSION_OPPORTUNITIES];
    if (pillarFilter !== 'All') {
      items = items.filter(i => i.sourcePillar === pillarFilter);
    }
    items.sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return (b[sortBy] as number) - (a[sortBy] as number);
    });
    return items;
  }, [sortBy, pillarFilter]);

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Opportunities', value: formatNumber(summary.totalOpportunities), icon: Target },
          { label: 'Est. GMV', value: formatCurrency(summary.totalEstimatedRevenue), icon: DollarSign },
          { label: 'Addressable Users', value: `${(summary.totalAddressableUsers / 1_000_000).toFixed(1)}M`, icon: Users },
          { label: 'Avg Confidence', value: `${summary.avgConfidenceScore}%`, icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <s.icon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {PILLAR_FILTERS.map(p => (
            <button
              key={p}
              onClick={() => setPillarFilter(p)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                 pillarFilter === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p === 'All' ? 'All Pillars' : p.split(' & ')[0]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {([
            { key: 'estimatedRevenue' as SortKey, label: 'Revenue' },
            { key: 'confidenceScore' as SortKey, label: 'Confidence' },
            { key: 'priority' as SortKey, label: 'Priority' },
          ]).map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                sortBy === s.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Cards */}
      <div className="space-y-3">
        {filtered.map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            isExpanded={expandedId === opp.id}
            onToggle={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
            onLaunchCampaign={onLaunchCampaign}
          />

        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No opportunities match the current filter.
        </div>
      )}
    </div>
  );
}

function OpportunityCard({
  opportunity: o,
  isExpanded,
  onToggle,
  onLaunchCampaign,
}: {
  opportunity: CategoryExtensionOpportunity;
  isExpanded: boolean;
  onToggle: () => void;
  onLaunchCampaign?: (productName: string, offers: string[]) => void;
}) {

  const priorityStyles = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <Card className="overflow-hidden border-slate-200 bg-white hover:shadow-md transition-shadow">
      <button onClick={onToggle} className="w-full text-left p-4">
        {/* Behavioral Bridge Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Source → Extension Bridge */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {o.sourceSubcategory}
              </Badge>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                {o.extensionProduct}
              </Badge>
              <Badge variant="outline" className={`text-[10px] ml-auto ${priorityStyles[o.priority]}`}>
                {o.priority}
              </Badge>
            </div>

            {/* Signal */}
            <p className="text-sm text-slate-700 leading-snug">{o.behavioralSignal}</p>

            {/* Metrics Row */}
            <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {formatNumber(o.addressableUsers)} users
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {formatCurrency(o.estimatedRevenue)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {o.confidenceScore}% confidence
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {o.optimalDeploymentWindow}
              </span>
            </div>
          </div>

          <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 mt-1 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-slate-100">
          {/* Why It Fits + Deployment Strategy — side by side */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Why This Fits</p>
              <p className="text-sm text-emerald-900 leading-snug">{o.whyItFits}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Deployment Strategy</p>
              <p className="text-sm text-blue-900 leading-snug">{o.deploymentRationale}</p>
            </div>
          </div>

          {/* Detail Grid (2 columns now) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Conversion Rate</p>
              <p className="text-sm font-semibold text-slate-800">{o.projectedConversionRate}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Projected</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Peak Spending</p>
              <p className="text-sm font-semibold text-slate-800">{o.peakSpendingWeeks}</p>
            </div>
          </div>

          {/* Merchant Partners Table */}
          {o.merchantDetails && o.merchantDetails.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Merchant Partners</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold text-slate-600 h-9">Merchant</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 h-9">Product</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 h-9">MSRP</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 h-9 text-right">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {o.merchantDetails.map((m) => (
                      <TableRow key={m.name} className="hover:bg-slate-50/50">
                        <TableCell className="text-sm font-medium text-slate-800 py-2.5">{m.name}</TableCell>
                        <TableCell className="text-sm text-slate-600 py-2.5">{m.product}</TableCell>
                        <TableCell className="text-sm text-slate-600 py-2.5">{m.msrp}</TableCell>
                        <TableCell className="text-right py-2.5">
                          <a
                            href={m.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Visit <ExternalLink className="w-3 h-3" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Audience Tags */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-600">Personas:</span>
              {o.matchingPersonas.map(p => (
                <Badge key={p} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">{p}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-600">Ages:</span>
              {o.topAgeRanges.map(a => (
                <Badge key={a} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">{a}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-600">Regions:</span>
              {o.topRegions.map(r => (
                <Badge key={r} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">{r}</Badge>
              ))}
            </div>
          </div>

          {onLaunchCampaign && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchCampaign(o.extensionProduct, [
                    `${o.extensionMerchant} — ${o.extensionProduct}`,
                    o.whyItFits,
                  ]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors"
              >
                <Megaphone className="w-3.5 h-3.5" />
                Launch campaign
              </button>
            </div>
          )}

        </div>
      )}
    </Card>
  );
}
