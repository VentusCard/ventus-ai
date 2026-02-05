import { useState, useMemo } from "react";
import { DashboardClient, DetectedLifeEvent, LIFE_EVENT_CONFIG } from "@/types/dashboardClient";
import { LifeEventAlertCard } from "./LifeEventAlertCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, AlertCircle, Clock, CalendarDays, Users,
  Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LifeEventsAlertDashboardProps {
  clients: DashboardClient[];
  onOpenClient: (clientId: string) => void;
  onScheduleCall: (clientId: string) => void;
}

type EventTypeFilter = 'all' | DetectedLifeEvent['eventType'];
type SortOption = 'urgency' | 'confidence' | 'timing' | 'aum';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunset,
  GraduationCap,
  Home,
  Gift,
  Briefcase,
  Baby,
  Heart,
};

export function LifeEventsAlertDashboard({
  clients,
  onOpenClient,
  onScheduleCall,
}: LifeEventsAlertDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<EventTypeFilter>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('urgency');

  // Flatten clients with events for display
  const clientsWithEvents = useMemo(() => {
    return clients.filter(c => c.detectedEvents.length > 0);
  }, [clients]);

  // Compute metrics
  const metrics = useMemo(() => {
    const allEvents = clientsWithEvents.flatMap(c => 
      c.detectedEvents.map(e => ({ client: c, event: e }))
    );
    
    const urgent = allEvents.filter(item => item.event.urgencyScore >= 4).length;
    const thisQuarter = allEvents.filter(item => 
      item.event.estimatedTiming.includes('Q1') || 
      item.event.estimatedTiming.includes('2026') ||
      item.event.estimatedTiming.includes('3 months') ||
      item.event.estimatedTiming.includes('1-3')
    ).length;

    const byType = Object.keys(LIFE_EVENT_CONFIG).reduce((acc, type) => {
      acc[type as DetectedLifeEvent['eventType']] = allEvents.filter(
        item => item.event.eventType === type
      ).length;
      return acc;
    }, {} as Record<DetectedLifeEvent['eventType'], number>);

    return {
      totalClients: clientsWithEvents.length,
      totalEvents: allEvents.length,
      urgent,
      thisQuarter,
      byType,
    };
  }, [clientsWithEvents]);

  // Filter and sort client-event pairs
  const filteredItems = useMemo(() => {
    let items = clientsWithEvents.flatMap(client =>
      client.detectedEvents.map(event => ({ client, event }))
    );

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.client.profile.name.toLowerCase().includes(query) ||
        item.event.eventName.toLowerCase().includes(query)
      );
    }

    // Event type filter
    if (eventFilter !== 'all') {
      items = items.filter(item => item.event.eventType === eventFilter);
    }

    // Confidence filter
    if (confidenceFilter !== 'all') {
      const minConfidence = parseInt(confidenceFilter);
      items = items.filter(item => item.event.confidence >= minConfidence);
    }

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          return b.event.urgencyScore - a.event.urgencyScore;
        case 'confidence':
          return b.event.confidence - a.event.confidence;
        case 'aum':
          const aumA = parseFloat(a.client.profile.aum.replace(/[$MK,]/g, ''));
          const aumB = parseFloat(b.client.profile.aum.replace(/[$MK,]/g, ''));
          return aumB - aumA;
        default:
          return b.event.urgencyScore - a.event.urgencyScore;
      }
    });

    return items;
  }, [clientsWithEvents, searchQuery, eventFilter, confidenceFilter, sortBy]);

  // Group by event type for display
  const groupedByType = useMemo(() => {
    if (eventFilter !== 'all') {
      return { [eventFilter]: filteredItems };
    }
    
    return filteredItems.reduce((acc, item) => {
      const type = item.event.eventType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {} as Record<string, typeof filteredItems>);
  }, [filteredItems, eventFilter]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Life Events Detected</h1>
            <p className="text-sm text-slate-500 mt-1">
              {metrics.totalClients} clients with upcoming life events need attention
            </p>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100">
            <Users className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">{metrics.totalClients} Clients</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">{metrics.urgent} Urgent</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">{metrics.thisQuarter} This Quarter</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{metrics.totalEvents} Total Events</span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
          
          <Select value={eventFilter} onValueChange={(v) => setEventFilter(v as EventTypeFilter)}>
            <SelectTrigger className="w-[180px] h-9 bg-white text-slate-700 border-slate-300">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {Object.entries(LIFE_EVENT_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label} ({metrics.byType[key as DetectedLifeEvent['eventType']] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <SelectTrigger className="w-[140px] h-9 bg-white text-slate-700 border-slate-300">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="85">85%+</SelectItem>
              <SelectItem value="70">70%+</SelectItem>
              <SelectItem value="50">50%+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[130px] h-9 bg-white text-slate-700 border-slate-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgency">Urgency</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="aum">AUM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content - Grouped by Event Type */}
      <div className="flex-1 overflow-y-auto p-6">
        {Object.entries(groupedByType).map(([eventType, items], groupIdx) => {
          const config = LIFE_EVENT_CONFIG[eventType as DetectedLifeEvent['eventType']];
          const IconComponent = iconMap[config?.icon] || AlertCircle;
          
          return (
            <div key={eventType} className="mb-6">
              {/* Section Header with Divider */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('p-1.5 rounded', `bg-${config?.color || 'slate'}-100`)}>
                  <IconComponent className={cn('h-4 w-4', `text-${config?.color || 'slate'}-600`)} />
                </div>
                <h2 className="text-base font-semibold text-slate-800">
                  {config?.label || eventType}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              
              <div className="flex flex-col gap-2 pl-2 border-l-2 border-slate-200 ml-3">
                {items.map((item, idx) => (
                  <LifeEventAlertCard
                    key={`${item.client.id}-${item.event.eventType}-${idx}`}
                    client={item.client}
                    event={item.event}
                    onPrepare={onOpenClient}
                    onView={onOpenClient}
                    onScheduleCall={onScheduleCall}
                    showEventLabel
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Search className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">No matching clients found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
