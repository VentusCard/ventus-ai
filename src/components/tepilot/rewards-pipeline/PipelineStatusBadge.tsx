import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/types/bankwide";

interface PipelineStatusBadgeProps {
  status: PipelineStage;
  className?: string;
}

const statusConfig: Record<PipelineStage, { label: string; className: string }> = {
  not_started: {
    label: 'Not Started',
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  negotiating: {
    label: 'Negotiating',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  contract_sent: {
    label: 'Contract Sent',
    className: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  live: {
    label: 'Live',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
};

export function PipelineStatusBadge({ status, className }: PipelineStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: PipelineStage): string {
  return statusConfig[status].label;
}

export const PIPELINE_STAGES: PipelineStage[] = ['not_started', 'contacted', 'negotiating', 'contract_sent', 'live'];
