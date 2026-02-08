import { useState, useMemo } from "react";
import { DashboardClient, DetectedLifeEvent, LIFE_EVENT_CONFIG, EventPreparationData } from "@/types/dashboardClient";
import { LifeEventAlertCard } from "./LifeEventAlertCard";
import { PrepareEventDialog, generateEventPreparationData } from "./PrepareEventDialog";
import { Badge } from "@/components/ui/badge";
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
  onPrepareWithVentus?: (data: EventPreparationData) => void;
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
  onPrepareWithVentus,
}: LifeEventsAlertDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<EventTypeFilter>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('urgency');
  const [prepareDialogOpen, setPrepareDialogOpen] = useState(false);
  const [prepareData, setPrepareData] = useState<EventPreparationData | null>(null);

  const handlePrepare = (clientId: string, event: DetectedLifeEvent) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      const data = generateEventPreparationData(client, event);
      setPrepareData(data);
      setPrepareDialogOpen(true);
    }
  };

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
          // Primary: urgency score, Secondary: confidence for ties
          if (b.event.urgencyScore !== a.event.urgencyScore) {
            return b.event.urgencyScore - a.event.urgencyScore;
          }
          return b.event.confidence - a.event.confidence;
        case 'confidence':
          return b.event.confidence - a.event.confidence;
        case 'timing':
          // Parse timing strings to approximate months
          const getMonths = (timing: string): number => {
            const lower = timing.toLowerCase();
            if (lower.includes('1-3 months') || lower.includes('q1')) return 2;
            if (lower.includes('3-6 months') || lower.includes('q2')) return 4;
            if (lower.includes('6-12 months') || lower.includes('q3')) return 9;
            if (lower.includes('12-18 months') || lower.includes('q4')) return 15;
            if (lower.includes('18-24 months')) return 21;
            return 12; // default to mid-range
          };
          return getMonths(a.event.estimatedTiming) - getMonths(b.event.estimatedTiming);
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


  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Wealth Management Client Life Event Intelligence <span className="text-sm font-normal text-slate-500">Powered by Ventus AI</span></h1>
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
              <SelectItem value="timing">Timeline</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="aum">AUM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content - Flat List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-3">
          {filteredItems.map((item, idx) => (
            <LifeEventAlertCard
              key={`${item.client.id}-${item.event.eventType}-${idx}`}
              client={item.client}
              event={item.event}
              onPrepare={handlePrepare}
              onView={onOpenClient}
              onScheduleCall={onScheduleCall}
              showEventLabel
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Search className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">No matching clients found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <PrepareEventDialog
        open={prepareDialogOpen}
        onOpenChange={setPrepareDialogOpen}
        data={prepareData}
        onPrepareWithVentus={onPrepareWithVentus}
      />
    </div>
  );
}
