import { DashboardClient, DetectedLifeEvent, LIFE_EVENT_CONFIG } from "@/types/dashboardClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart,
  Phone, Eye, Calendar, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LifeEventAlertCardProps {
  client: DashboardClient;
  event: DetectedLifeEvent;
  onPrepare: (clientId: string) => void;
  onView: (clientId: string) => void;
  onScheduleCall: (clientId: string) => void;
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

const segmentColors: Record<string, string> = {
  Preferred: 'bg-blue-100 text-blue-800',
  Private: 'bg-purple-100 text-purple-800',
  Premium: 'bg-amber-100 text-amber-800',
};

export function LifeEventAlertCard({
  client,
  event,
  onPrepare,
  onView,
  onScheduleCall,
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
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Card className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-3">
        {/* Header: Client Name + Segment */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{client.profile.name}</h3>
            <p className="text-sm text-slate-500">{client.profile.aum} AUM</p>
          </div>
          <Badge className={cn('text-xs shrink-0', segmentColors[client.profile.segment])}>
            {client.profile.segment}
          </Badge>
        </div>

        {/* Life Event + Confidence */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
          <div className={cn('p-1.5 rounded', `bg-${config.color}-100`)}>
            <IconComponent className={cn('h-4 w-4', `text-${config.color}-600`)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{event.eventName}</p>
            <p className="text-xs text-slate-500">{event.estimatedTiming}</p>
          </div>
          <Badge className={cn('text-xs', getConfidenceColor(event.confidence))}>
            {event.confidence}%
          </Badge>
        </div>

        {/* Evidence snippet */}
        {event.keyEvidence.length > 0 && (
          <p className="text-xs text-slate-600 italic line-clamp-2">
            "{event.keyEvidence[0]}"
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Last contact: {formatLastContact(client.lastContactDate)}</span>
          <Badge className={cn('text-[10px]', urgencyBadge.className)}>
            {urgencyBadge.label}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => onPrepare(client.id)}
            className="flex-1 h-8 text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Prepare
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(client.id)}
            className="h-8 px-3"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onScheduleCall(client.id)}
            className="h-8 px-3"
          >
            <Phone className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
