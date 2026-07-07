import { DashboardClient, DetectedLifeEvent, LIFE_EVENT_CONFIG } from "@/types/dashboardClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart,
  Phone, Eye, Calendar, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSegmentColorClasses } from "@/lib/segmentColors";

interface LifeEventAlertCardProps {
  client: DashboardClient;
  event: DetectedLifeEvent;
  onPrepare: (clientId: string, event: DetectedLifeEvent) => void;
  onView: (clientId: string) => void;
  onScheduleCall: (clientId: string) => void;
  showEventLabel?: boolean;
  sourceLabel?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunset,
  GraduationCap,
  Home,
  Gift,
  Briefcase,
  Baby,
  Heart,
};


export function LifeEventAlertCard({
  client,
  event,
  onPrepare,
  onView,
  onScheduleCall,
  showEventLabel = false,
  sourceLabel,
}: LifeEventAlertCardProps) {
  const config = LIFE_EVENT_CONFIG[event.eventType];
  const IconComponent = iconMap[config.icon] || AlertTriangle;
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-50';
    if (confidence >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getUrgencyBadge = (score: number) => {
    if (score >= 4) return { label: 'Urgent', className: 'bg-red-100 text-red-700' };
    if (score >= 3) return { label: 'Soon', className: 'bg-amber-100 text-amber-700' };
    return { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' };
  };

  const urgencyBadge = getUrgencyBadge(event.urgencyScore);

  const formatLastContact = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    const weeks = Math.floor(diffDays / 7);
    if (diffDays < 30) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  };

  return (
    <Card className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          {/* Event Icon */}
          <div className={cn('p-2 rounded-lg shrink-0', `bg-${config.color}-50`)}>
            <IconComponent className={cn('h-5 w-5', `text-${config.color}-600`)} />
          </div>

          {/* Client Info */}
          <div className="min-w-0 w-36 shrink-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-slate-900 truncate text-sm">{client.profile.name}</h3>
              {sourceLabel && (
                <Badge className={cn('text-[9px] px-1 py-0 shrink-0 whitespace-nowrap', 
                  sourceLabel.includes('Enrichment') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                )}>
                  {sourceLabel}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{client.profile.aum}</span>
              <Badge className={cn('text-[10px] px-1.5 py-0', getSegmentColorClasses(client.profile.segment))}>
                {client.profile.segment}
              </Badge>
            </div>
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
            {showEventLabel && (
                <Badge className={cn('text-[10px] px-1.5 py-0 shrink-0', `bg-${config.color}-100 text-${config.color}-700 border-${config.color}-200`)}>
                  {config.label}
                </Badge>
              )}
              <span className="text-sm font-medium text-slate-800 truncate">{event.eventName}</span>
              <Badge className={cn('text-[10px] px-1.5 py-0 shrink-0', urgencyBadge.className)}>
                {urgencyBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {event.keyEvidence[0] || event.estimatedTiming}
            </p>
          </div>

          {/* Confidence + Timing */}
          <div className="text-right shrink-0 w-20">
            <Badge className={cn('text-[10px]', getConfidenceColor(event.confidence))}>
              {event.confidence}% conf
            </Badge>
            <p className="text-[10px] text-slate-400 mt-1">{event.estimatedTiming}</p>
          </div>

          {/* Last Contact */}
          <div className="text-right shrink-0 w-20 hidden lg:block">
            <p className="text-[10px] text-slate-400">Last contact</p>
            <p className="text-xs text-slate-600">{formatLastContact(client.lastContactDate)}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              onClick={() => onPrepare(client.id, event)}
              className="h-7 px-3 text-xs"
            >
              Prepare
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(client.id)}
              className="h-7 w-7 p-0"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onScheduleCall(client.id)}
              className="h-7 w-7 p-0"
            >
              <Phone className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
