import { Badge } from "@/components/ui/badge";
import { CalendarClock, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import type { MerchantPartnershipPitch, RevenueOpportunity } from "@/types/bankwide";
import { cn } from "@/lib/utils";

interface DeadlineOverviewProps {
  opportunities: RevenueOpportunity[];
}

interface DeadlineItem {
  merchantName: string;
  opportunityTitle: string;
  deadline: string;
  peakQuarter: string;
  urgency: 'overdue' | 'this_week' | 'this_month' | 'upcoming';
}

function parseDeadline(deadline: string): Date {
  // Parse "Oct 15, 2025" format
  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  const parts = deadline.replace(',', '').split(' ');
  return new Date(parseInt(parts[2]), months[parts[0]], parseInt(parts[1]));
}

function getUrgency(deadline: string): DeadlineItem['urgency'] {
  const now = new Date();
  const deadlineDate = parseDeadline(deadline);
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'this_week';
  if (diffDays <= 30) return 'this_month';
  return 'upcoming';
}

const urgencyConfig = {
  overdue: {
    icon: AlertTriangle,
    label: 'Overdue',
    className: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800'
  },
  this_week: {
    icon: Clock,
    label: 'This Week',
    className: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
  },
  this_month: {
    icon: CalendarClock,
    label: 'This Month',
    className: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
  },
  upcoming: {
    icon: CheckCircle2,
    label: 'Upcoming',
    className: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
  }
};

export function DeadlineOverview({ opportunities }: DeadlineOverviewProps) {
  const deadlines: DeadlineItem[] = opportunities.flatMap(opp => 
    opp.merchantPartnerships.map(mp => ({
      merchantName: mp.merchantName,
      opportunityTitle: opp.gapTitle,
      deadline: mp.negotiationDeadline,
      peakQuarter: mp.peakQuarter,
      urgency: getUrgency(mp.negotiationDeadline)
    }))
  ).sort((a, b) => {
    const urgencyOrder = { overdue: 0, this_week: 1, this_month: 2, upcoming: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const urgentCount = deadlines.filter(d => d.urgency === 'overdue' || d.urgency === 'this_week').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Upcoming Deadlines</h3>
        </div>
        {urgentCount > 0 && (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            {urgentCount} urgent
          </Badge>
        )}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {deadlines.slice(0, 10).map((item, idx) => {
          const config = urgencyConfig[item.urgency];
          const Icon = config.icon;
          
          return (
            <div 
              key={`${item.merchantName}-${idx}`}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                item.urgency === 'overdue' && "bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800",
                item.urgency === 'this_week' && "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
                item.urgency === 'this_month' && "bg-slate-50 border-slate-200",
                item.urgency === 'upcoming' && "bg-slate-50/50 border-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", 
                  item.urgency === 'overdue' && "text-rose-600",
                  item.urgency === 'this_week' && "text-amber-600",
                  item.urgency === 'this_month' && "text-blue-600",
                  item.urgency === 'upcoming' && "text-emerald-600"
                )} />
                <div>
                  <p className="font-medium text-sm">{item.merchantName}</p>
                  <p className="text-xs text-slate-500">{item.opportunityTitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{item.deadline}</p>
                <p className="text-xs text-slate-500">Peak: {item.peakQuarter}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
