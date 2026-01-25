import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, ChevronDown, ChevronUp, DollarSign, Users, Percent, CalendarClock, Handshake, TrendingUp, Lightbulb } from "lucide-react";
import type { RevenueOpportunity, MerchantPartnershipPitch, PipelineStage } from "@/types/bankwide";
import { PipelineStatusBadge, PIPELINE_STAGES, getStatusLabel } from "./PipelineStatusBadge";
import { PartnershipActionButtons } from "./PartnershipActionButtons";
import { usePipelineStatus } from "@/hooks/usePipelineStatus";
import { cn } from "@/lib/utils";

interface MerchantPipelineTableProps {
  opportunities: RevenueOpportunity[];
  filterOpportunityId?: string;
}

interface FlattenedMerchant {
  pitch: MerchantPartnershipPitch;
  opportunityId: string;
  opportunityTitle: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const formatUsers = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  return `${(num / 1_000).toFixed(0)}K`;
};

const getConfidenceColor = (score: number): string => {
  if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
  if (score >= 80) return 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800';
  if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
  return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700';
};

type SortField = 'merchant' | 'status' | 'revenue' | 'deadline' | 'confidence';
type SortDirection = 'asc' | 'desc';

export function MerchantPipelineTable({ opportunities, filterOpportunityId }: MerchantPipelineTableProps) {
  const { getOrCreateStatus, updateStatus, logContact } = usePipelineStatus();
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedMerchant, setSelectedMerchant] = useState<FlattenedMerchant | null>(null);

  // Flatten opportunities into merchant list
  const merchants: FlattenedMerchant[] = opportunities
    .filter(opp => !filterOpportunityId || opp.id === filterOpportunityId)
    .flatMap(opp => 
      opp.merchantPartnerships.map(pitch => ({
        pitch,
        opportunityId: opp.id,
        opportunityTitle: opp.gapTitle
      }))
    );

  // Sort merchants
  const sortedMerchants = [...merchants].sort((a, b) => {
    const aStatus = getOrCreateStatus(a.pitch.merchantName, a.opportunityId);
    const bStatus = getOrCreateStatus(b.pitch.merchantName, b.opportunityId);
    
    let comparison = 0;
    switch (sortField) {
      case 'merchant':
        comparison = a.pitch.merchantName.localeCompare(b.pitch.merchantName);
        break;
      case 'status':
        const statusOrder = { not_started: 0, contacted: 1, negotiating: 2, contract_sent: 3, live: 4 };
        comparison = statusOrder[aStatus.status] - statusOrder[bStatus.status];
        break;
      case 'revenue':
        comparison = a.pitch.estimatedRevenueCapture - b.pitch.estimatedRevenueCapture;
        break;
      case 'deadline':
        // Parse deadline for sorting
        const parseDate = (d: string) => new Date(d.replace(/(\w+) (\d+), (\d+)/, '$1 $2 $3'));
        comparison = parseDate(a.pitch.negotiationDeadline).getTime() - parseDate(b.pitch.negotiationDeadline).getTime();
        break;
      case 'confidence':
        comparison = a.pitch.patternConfidence - b.pitch.patternConfidence;
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead 
                className="cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort('merchant')}
              >
                <div className="flex items-center gap-1">
                  Merchant
                  <SortIcon field="merchant" />
                </div>
              </TableHead>
              <TableHead>Gap</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon field="status" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-200 text-right"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center gap-1 justify-end">
                  Est. Revenue
                  <SortIcon field="revenue" />
                </div>
              </TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort('deadline')}
              >
                <div className="flex items-center gap-1">
                  Deadline
                  <SortIcon field="deadline" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-200 text-right"
                onClick={() => handleSort('confidence')}
              >
                <div className="flex items-center gap-1 justify-end">
                  Confidence
                  <SortIcon field="confidence" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMerchants.map((item, idx) => {
              const status = getOrCreateStatus(item.pitch.merchantName, item.opportunityId);
              
              return (
                <TableRow 
                  key={`${item.pitch.merchantName}-${idx}`}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedMerchant(item)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-100 border border-slate-200">
                        <Building2 className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium">{item.pitch.merchantName}</p>
                        <p className="text-xs text-slate-500">{item.pitch.merchantCategory}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-500">{item.opportunityTitle}</span>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Select 
                      value={status.status} 
                      onValueChange={(v) => updateStatus(item.pitch.merchantName, item.opportunityId, v as PipelineStage)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue>
                          <PipelineStatusBadge status={status.status} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map(stage => (
                          <SelectItem key={stage} value={stage}>
                            {getStatusLabel(stage)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.pitch.estimatedRevenueCapture)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatUsers(item.pitch.targetedUserCount)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{item.pitch.negotiationDeadline}</p>
                      <p className="text-xs text-slate-500">{item.pitch.peakQuarter}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={cn("text-xs", getConfidenceColor(item.pitch.patternConfidence))}>
                      {item.pitch.patternConfidence}%
                    </Badge>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <PartnershipActionButtons 
                      pitch={item.pitch}
                      opportunityId={item.opportunityId}
                      onLogContact={(entry) => logContact(item.pitch.merchantName, item.opportunityId, entry)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Merchant Detail Dialog */}
      <Dialog open={!!selectedMerchant} onOpenChange={() => setSelectedMerchant(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMerchant && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  {selectedMerchant.pitch.merchantName}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-slate-500">{selectedMerchant.pitch.merchantCategory}</p>
                
                {/* Proposed Deal */}
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-primary">{selectedMerchant.pitch.proposedDeal}</p>
                </div>

                {/* Win-Win Section */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Handshake className="h-3.5 w-3.5 text-emerald-600/70" />
                      <span className="text-xs font-semibold text-emerald-700/80 uppercase">For {selectedMerchant.pitch.merchantName}</span>
                    </div>
                    <p className="text-sm">{selectedMerchant.pitch.merchantBenefit}</p>
                  </div>
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-800/30 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-600/70" />
                      <span className="text-xs font-semibold text-blue-700/80 uppercase">For Bank</span>
                    </div>
                    <p className="text-sm">{selectedMerchant.pitch.bankBenefit}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <DollarSign className="h-4 w-4 mx-auto text-slate-500 mb-1" />
                    <p className="text-lg font-bold">{formatCurrency(selectedMerchant.pitch.estimatedRevenueCapture)}</p>
                    <p className="text-xs text-slate-500">Est. Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Users className="h-4 w-4 mx-auto text-slate-500 mb-1" />
                    <p className="text-lg font-bold">{formatUsers(selectedMerchant.pitch.targetedUserCount)}</p>
                    <p className="text-xs text-slate-500">Target Users</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Percent className="h-4 w-4 mx-auto text-slate-500 mb-1" />
                    <p className="text-lg font-bold">{selectedMerchant.pitch.projectedConversionRate}%</p>
                    <p className="text-xs text-slate-500">Conversion</p>
                  </div>
                </div>

                {/* Timing */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarClock className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-medium uppercase">Timeline</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-slate-500">Negotiate by</p>
                      <p className="font-semibold text-amber-600">{selectedMerchant.pitch.negotiationDeadline}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Deploy</p>
                      <p className="font-semibold text-primary">{selectedMerchant.pitch.deploymentWindow.split(' - ')[0]}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Peak</p>
                      <p className="font-semibold">{selectedMerchant.pitch.peakQuarter}</p>
                    </div>
                  </div>
                </div>

                {/* Pattern Reason */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                  <p>{selectedMerchant.pitch.patternReason}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
