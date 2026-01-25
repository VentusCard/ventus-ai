import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Download } from "lucide-react";
import type { RevenueOpportunity } from "@/types/bankwide";
import { usePipelineStatus } from "@/hooks/usePipelineStatus";
import { toast } from "sonner";
interface PipelineHeaderProps {
  opportunities: RevenueOpportunity[];
  selectedGapId: string | null;
  onGapChange: (gapId: string | null) => void;
}
const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toFixed(0)}`;
};
export function PipelineHeader({
  opportunities,
  selectedGapId,
  onGapChange
}: PipelineHeaderProps) {
  const navigate = useNavigate();
  const {
    getStatusCounts
  } = usePipelineStatus();
  const counts = getStatusCounts(selectedGapId || undefined);
  const totalMerchants = selectedGapId ? opportunities.find(o => o.id === selectedGapId)?.merchantPartnerships.length || 0 : opportunities.reduce((sum, o) => sum + o.merchantPartnerships.length, 0);
  const totalOpportunity = selectedGapId ? opportunities.find(o => o.id === selectedGapId)?.totalOpportunityAmount || 0 : opportunities.reduce((sum, o) => sum + o.totalOpportunityAmount, 0);
  const handleExport = () => {
    const rows: string[] = ['Merchant,Gap,Category,Status,Est. Revenue,Target Users,Peak Quarter,Deadline'];
    const filteredOpps = selectedGapId ? opportunities.filter(o => o.id === selectedGapId) : opportunities;
    filteredOpps.forEach(opp => {
      opp.merchantPartnerships.forEach(mp => {
        rows.push([`"${mp.merchantName}"`, `"${opp.gapTitle}"`, `"${mp.merchantCategory}"`, 'Not Started', formatCurrency(mp.estimatedRevenueCapture), mp.targetedUserCount.toString(), mp.peakQuarter, mp.negotiationDeadline].join(','));
      });
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Pipeline exported');
  };
  return <div className="space-y-4">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/tepilot')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Bank-wide Analytics
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Pipeline
        </Button>
      </div>

      {/* Title Row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Consumer Rewards Pipeline (WIP not fully working)</h1>
          </div>
          <p className="text-slate-500">
            Manage merchant partnerships and track deal progress across all revenue opportunities
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{formatCurrency(totalOpportunity)}</div>
          <div className="text-sm text-slate-500">total opportunity</div>
        </div>
      </div>

      {/* Filters and Stats Row */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by Gap:</span>
            <Select value={selectedGapId || 'all'} onValueChange={v => onGapChange(v === 'all' ? null : v)}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="All Gaps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gaps ({opportunities.length})</SelectItem>
                {opportunities.map(opp => <SelectItem key={opp.id} value={opp.id}>
                    {opp.gapTitle} ({opp.merchantPartnerships.length})
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{totalMerchants} merchants:</span>
            {counts.live > 0 && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {counts.live} live
              </Badge>}
            {counts.negotiating > 0 && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {counts.negotiating} negotiating
              </Badge>}
            {counts.contacted > 0 && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {counts.contacted} contacted
              </Badge>}
            {counts.contract_sent > 0 && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {counts.contract_sent} contract sent
              </Badge>}
          </div>
        </div>
      </div>
    </div>;
}