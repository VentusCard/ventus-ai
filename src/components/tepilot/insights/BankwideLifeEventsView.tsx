import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart,
  AlertTriangle, Users, AlertCircle, Clock, CalendarDays, Scan, CalendarHeart
} from "lucide-react";
import { TabHeader } from "./TabHeader";
import { cn } from "@/lib/utils";
import { LIFE_EVENT_CONFIG, DetectedLifeEvent, DashboardClient, EventPreparationData } from "@/types/dashboardClient";
import { LifeEventAlertCard } from "@/components/tepilot/advisor-console/LifeEventAlertCard";
import { PrepareEventDialog, generateEventPreparationData } from "@/components/tepilot/advisor-console/PrepareEventDialog";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import { ClientProfileData } from "@/types/clientProfile";
import { AIInsights } from "@/types/lifestyle-signals";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart,
};

// Bank-wide aggregate numbers per event type
const BANKWIDE_EVENT_STATS: Record<DetectedLifeEvent['eventType'], { detected: number; avgConfidence: number; urgent: number }> = {
  retirement:        { detected: 4200, avgConfidence: 82, urgent: 890 },
  education:         { detected: 3100, avgConfidence: 76, urgent: 620 },
  home_purchase:     { detected: 5800, avgConfidence: 79, urgent: 1240 },
  wealth_transfer:   { detected: 1900, avgConfidence: 71, urgent: 380 },
  business_liquidity:{ detected: 1400, avgConfidence: 68, urgent: 210 },
  family_formation:  { detected: 1800, avgConfidence: 84, urgent: 540 },
  elder_care:        { detected: 2600, avgConfidence: 73, urgent: 780 },
};

interface BankwideLifeEventsViewProps {
  userDemographics?: ClientProfileData | null;
  lifestyleSignals?: AIInsights | null;
}

export function BankwideLifeEventsView({ userDemographics, lifestyleSignals }: BankwideLifeEventsViewProps) {
  const [prepareDialogOpen, setPrepareDialogOpen] = useState(false);
  const [prepareData, setPrepareData] = useState<EventPreparationData | null>(null);

  // Generate static example clients
  const staticClients = useMemo(() => generateDashboardClients(12), []);

  // Build enriched client from transaction enrichment flow if available
  const enrichedClient: DashboardClient | null = useMemo(() => {
    if (!userDemographics) return null;
    
    const detectedEvents: DetectedLifeEvent[] = [];
    if (lifestyleSignals?.detected_events) {
      lifestyleSignals.detected_events.forEach((evt: any) => {
        const eventType = mapEventType(evt.event_type || evt.eventType || '');
        if (eventType) {
          detectedEvents.push({
            eventType,
            eventName: evt.event_name || evt.eventName || LIFE_EVENT_CONFIG[eventType].label,
            confidence: evt.confidence || 78,
            estimatedTiming: evt.estimated_timing || evt.estimatedTiming || '3-6 months',
            keyEvidence: evt.key_evidence || evt.keyEvidence || evt.talking_points || [],
            urgencyScore: evt.urgency_score || evt.urgencyScore || 3,
          });
        }
      });
    }

    if (detectedEvents.length === 0) {
      detectedEvents.push({
        eventType: 'home_purchase',
        eventName: 'Potential Home Purchase',
        confidence: 72,
        estimatedTiming: '6-12 months',
        keyEvidence: ['Increased spending on home improvement stores', 'Multiple mortgage-related searches'],
        urgencyScore: 3,
      });
    }

    return {
      id: 'enriched-user',
      profile: userDemographics,
      detectedEvents,
      lastContactDate: new Date(),
      engagementStatus: 'active' as const,
    };
  }, [userDemographics, lifestyleSignals]);

  // Flatten for the card list (one card per client-event pair)
  const clientEventPairs = useMemo(() => {
    const pairs: Array<{ client: DashboardClient; event: DetectedLifeEvent; sourceLabel: string }> = [];
    
    if (enrichedClient) {
      enrichedClient.detectedEvents.forEach(event => {
        pairs.push({ client: enrichedClient, event, sourceLabel: 'From Transaction Enrichment' });
      });
    }

    staticClients.forEach(client => {
      client.detectedEvents.forEach(event => {
        pairs.push({ client, event, sourceLabel: 'Static Example' });
      });
    });

    return pairs;
  }, [enrichedClient, staticClients]);

  const handlePrepare = (clientId: string, event: DetectedLifeEvent) => {
    const client = clientEventPairs.find(p => p.client.id === clientId)?.client;
    if (client) {
      const data = generateEventPreparationData(client, event);
      setPrepareData(data);
      setPrepareDialogOpen(true);
    }
  };

  const handleView = (clientId: string) => {
    toast.info('Client detail view available in the WM Copilot tab');
  };

  const handleScheduleCall = (clientId: string) => {
    const client = clientEventPairs.find(p => p.client.id === clientId)?.client;
    toast.success(`Scheduling call with ${client?.profile.name || 'client'}...`);
  };

  const totalDetected = Object.values(BANKWIDE_EVENT_STATS).reduce((s, v) => s + v.detected, 0);
  const totalUrgent = Object.values(BANKWIDE_EVENT_STATS).reduce((s, v) => s + v.urgent, 0);

  return (
    <div className="space-y-6">
      <TabHeader
        icon={<CalendarHeart className="w-4 h-4" />}
        title="Life Event Detection"
        subtitle="Transaction-based life event signals across 2.4M scanned customers"
        howItWorks="Ventus detects life events (home purchase, retirement, family formation) from transaction pattern shifts — months before customers self-report."
        whyItMatters="Enables proactive outreach at the highest-intent moments, dramatically improving conversion and deepening relationships."
      />
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={<Scan className="h-5 w-5 text-slate-600" />} label="Customers Scanned" value="2.4M" bg="bg-slate-50" />
        <MetricCard icon={<CalendarDays className="h-5 w-5 text-blue-600" />} label="Events Detected" value={totalDetected.toLocaleString()} bg="bg-blue-50" />
        <MetricCard icon={<AlertCircle className="h-5 w-5 text-red-600" />} label="Urgent (90 days)" value={totalUrgent.toLocaleString()} bg="bg-red-50" />
        <MetricCard icon={<Users className="h-5 w-5 text-green-600" />} label="Avg Confidence" value="77%" bg="bg-green-50" />
      </div>

      {/* Event Type Grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Detection by Life Event Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {(Object.entries(LIFE_EVENT_CONFIG) as Array<[DetectedLifeEvent['eventType'], typeof LIFE_EVENT_CONFIG[DetectedLifeEvent['eventType']]]>).map(([key, config]) => {
            const stats = BANKWIDE_EVENT_STATS[key];
            const IconComponent = iconMap[config.icon] || AlertTriangle;
            return (
              <Card key={key} className="border border-slate-200 hover:shadow-sm transition-shadow">
                <CardContent className="p-3 text-center">
                  <div className={cn('mx-auto w-10 h-10 rounded-lg flex items-center justify-center mb-2', `bg-${config.color}-50`)}>
                    <IconComponent className={cn('h-5 w-5', `text-${config.color}-600`)} />
                  </div>
                  <p className="text-xs font-medium text-slate-700 mb-1">{config.label}</p>
                  <p className="text-lg font-bold text-slate-900">{stats.detected.toLocaleString()}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Badge className="text-[9px] px-1 py-0 bg-slate-100 text-slate-600">{stats.avgConfidence}% avg</Badge>
                  </div>
                  <p className="text-[10px] text-red-500 mt-1">{stats.urgent} urgent</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Client Examples List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Example Detected Clients</h3>
        <div className="flex flex-col gap-2">
          {clientEventPairs.slice(0, 20).map((item, idx) => (
            <LifeEventAlertCard
              key={`${item.client.id}-${item.event.eventType}-${idx}`}
              client={item.client}
              event={item.event}
              onPrepare={handlePrepare}
              onView={handleView}
              onScheduleCall={handleScheduleCall}
              showEventLabel
              sourceLabel={item.sourceLabel}
            />
          ))}
        </div>
      </div>

      <PrepareEventDialog
        open={prepareDialogOpen}
        onOpenChange={setPrepareDialogOpen}
        data={prepareData}
      />
    </div>
  );
}

function MetricCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', bg)}>{icon}</div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function mapEventType(raw: string): DetectedLifeEvent['eventType'] | null {
  const lower = raw.toLowerCase().replace(/[\s_-]+/g, '_');
  const map: Record<string, DetectedLifeEvent['eventType']> = {
    retirement: 'retirement',
    retirement_planning: 'retirement',
    education: 'education',
    education_funding: 'education',
    home_purchase: 'home_purchase',
    home: 'home_purchase',
    wealth_transfer: 'wealth_transfer',
    estate: 'wealth_transfer',
    business_liquidity: 'business_liquidity',
    business: 'business_liquidity',
    family_formation: 'family_formation',
    family: 'family_formation',
    baby: 'family_formation',
    elder_care: 'elder_care',
    eldercare: 'elder_care',
  };
  return map[lower] || null;
}
