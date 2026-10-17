import { Gift, Mail, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DECKMO } from "@/lib/deckmoScript";
import { timelineMonthDelay, timelineRevealState } from "@/lib/deckmoTimelineReveal";
import { cn } from "@/lib/utils";

const ICONS = { phone: Smartphone, gift: Gift, mail: Mail, user: UserRound, shield: ShieldCheck };

export function RickySignalTimeline({ step, active, onOpenSignal }: { step: number; active: boolean; onOpenSignal?: (label: string) => void }) {
  const timeline = DECKMO.ricky.timeline;
  const reveal = timelineRevealState(active, step);
  const columns = timeline.months.map((_, month) => timeline.events.filter(event => event.month === month));
  return <div className="ricky-timeline" data-ricky-timeline data-step={step}>
    <div className="timeline-axis"><span />{timeline.months.map((month, index) => <span key={month} className={cn(reveal.animateMarkers && "timeline-enter")} style={{ animationDelay: `${timelineMonthDelay(index)}ms` }}>{month}</span>)}</div>
    <div className="timeline-body">
      <div className="timeline-labels">
        <div className={cn("timeline-band-label", reveal.animateMarkers && "timeline-enter")}>{timeline.signalBandLabel}</div>
        {timeline.lanes.map((lane, index) => { const Icon = ICONS[lane.icon]; return <div key={lane.id} data-lane-label={lane.id} className={cn("timeline-lane-label", lane.id === "internal" && "timeline-governed", reveal.animateMarkers && "timeline-enter")} style={{ animationDelay: `${150 + index * 90}ms` }}><Icon aria-hidden="true" /><span>{lane.label}</span></div>; })}
      </div>
      <div className="timeline-chart">
        <svg className="timeline-journeys" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <path className="timeline-home-journey ricky-story-amber" d="M250 54 H950" />
          <path className="timeline-learned-journey ricky-story-blue" d="M50 54 V12 H985 V266 H950" />
        </svg>
        {reveal.showActivations && <svg className="timeline-connectors" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" data-timeline-connectors>
          {columns.flatMap((events, month) => events.flatMap((event, slot) => {
            const signal = DECKMO.ricky.signals.find(item => item.label === event.label);
            if (!signal) return [];
            const x = month * 100 + 50;
            const start = (slot + 1) * (320 / 3) - 12;
            const track = month * 100 + 8 + slot * 7;
            return event.activations.map(activation => {
              const lane = timeline.lanes.findIndex(item => item.id === activation.lane);
              const end = 320 + lane * 136 + 24;
              return <path key={`${event.id}-${activation.lane}`} className={`timeline-connector ricky-story-${signal.tone}`} pathLength="1" d={`M${x} ${start} H${track} V${end} H${x}`} style={{ animationDelay: `${timelineMonthDelay(month)}ms` }} />;
            });
          }))}
        </svg>}
        <div className="timeline-columns">{columns.map((events, month) => <div key={timeline.months[month]} className="timeline-column" data-month={month}>
          <div className="timeline-signals">{events.map((event, slot) => {
            const signal = DECKMO.ricky.signals.find(item => item.label === event.label);
            if (!signal) return null;
            const learned = "learned" in event && event.learned;
            return <div key={event.id} className={cn("timeline-marker-wrap", reveal.animateMarkers && "timeline-enter")} style={{ gridRow: slot + 1, animationDelay: `${timelineMonthDelay(month)}ms` }}>
              <Button variant="outline" className={cn("timeline-marker", `ricky-story-${signal.tone}`)} data-signal-source={signal.source} data-signal-label={signal.label} data-timeline-marker={event.id} data-learned={learned || undefined} aria-label={`${event.shortLabel}, ${timeline.months[month]}: ${signal.label}`} disabled={!reveal.showActivations} onClick={() => onOpenSignal?.(signal.label)} title={event.evidence}>
                <span className="timeline-marker-dot" /> <span>{signal.source === "external" && <span className="timeline-ext">Ext </span>}{event.shortLabel}</span>
              </Button>
              {learned ? <span className="timeline-learned-caption">{timeline.learnedLabel}</span> : <span className="timeline-evidence">{event.evidence}</span>}
            </div>;
          })}</div>
          {timeline.lanes.map(lane => <div key={lane.id} className={cn("timeline-cell", lane.id === "internal" && "timeline-governed")} data-timeline-lane={lane.id}>
            {reveal.showActivations && events.flatMap(event => event.activations.filter(activation => activation.lane === lane.id).map(activation => {
              const signal = DECKMO.ricky.signals.find(item => item.label === event.label);
              if (!signal) return null;
              return <Button key={event.id} variant="outline" className={cn("timeline-activation timeline-enter", `ricky-story-${signal.tone}`)} data-timeline-activation={event.id} data-signal-label={event.label} onClick={() => onOpenSignal?.(event.label)} style={{ animationDelay: `${timelineMonthDelay(month) + 400}ms` }}>{activation.label}</Button>;
            }))}
          </div>)}
        </div>)}</div>
      </div>
    </div>
  </div>;
}