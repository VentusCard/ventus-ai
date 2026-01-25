import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EnrichedTransaction } from "@/types/transaction";
import { ChevronDown, MapPin, ArrowRight, Plane } from "lucide-react";
import { useState } from "react";

interface TravelTimelineProps {
  transactions: EnrichedTransaction[];
}

interface Trip {
  destination: string;
  startDate: string;
  endDate: string;
  transactions: EnrichedTransaction[];
  totalSpend: number;
  reclassifiedCount: number;
}

function groupTransactionsByTrip(transactions: EnrichedTransaction[]): Trip[] {
  // Filter out transactions without valid destinations to prevent "Unknown" trips
  const travelTransactions = transactions.filter(t => 
    t.travel_context?.is_travel_related && 
    t.travel_context?.travel_destination && 
    t.travel_context.travel_destination.toLowerCase() !== 'unknown'
  );
  
  // Group by destination + travel period
  const tripMap = new Map<string, EnrichedTransaction[]>();
  
  travelTransactions.forEach(t => {
    const destination = t.travel_context?.travel_destination || 'Unknown';
    const periodStart = t.travel_context?.travel_period_start || t.date;
    const periodEnd = t.travel_context?.travel_period_end || t.date;
    
    // Create composite key for trip grouping
    const tripKey = `${destination}|${periodStart}|${periodEnd}`;
    
    if (!tripMap.has(tripKey)) {
      tripMap.set(tripKey, []);
    }
    tripMap.get(tripKey)!.push(t);
  });
  
  // Convert to Trip objects
  const trips: Trip[] = [];
  
  tripMap.forEach((txns, key) => {
    const [destination, periodStart, periodEnd] = key.split('|');
    
    // Get actual date range from transactions
    const dates = txns.map(t => t.date).sort();
    const actualStart = dates[0];
    const actualEnd = dates[dates.length - 1];
    
    trips.push({
      destination,
      startDate: periodStart || actualStart,
      endDate: periodEnd || actualEnd,
      transactions: txns.sort((a, b) => a.date.localeCompare(b.date)),
      totalSpend: txns.reduce((sum, t) => sum + t.amount, 0),
      reclassifiedCount: txns.filter(t => t.travel_context?.original_pillar !== "Travel & Experiences").length
    });
  });
  
  // Sort trips by start date (most recent first)
  return trips.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function TripSection({ trip, defaultOpen = false }: { trip: Trip; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Group transactions by date
  const dateGroups = trip.transactions.reduce((acc, t) => {
    const date = t.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, EnrichedTransaction[]>);
  
  const sortedDates = Object.keys(dateGroups).sort();
  const days = calculateDays(trip.startDate, trip.endDate);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-slate-200 rounded-lg bg-slate-50">
        <CollapsibleTrigger className="w-full">
          <div className="p-4 flex items-center justify-between hover:bg-slate-100 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Plane className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">{trip.destination}</p>
                <p className="text-sm text-slate-500">
                  {formatDateRange(trip.startDate, trip.endDate)} • {days} day{days > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">{trip.transactions.length} txns</span>
              <span className="font-medium text-slate-900">${trip.totalSpend.toFixed(2)}</span>
              <ChevronDown className={`w-5 h-5 transition-transform text-slate-500 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t border-slate-200">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              
              {sortedDates.map((date) => {
                const dayTransactions = dateGroups[date];
                const daySpend = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
                
                return (
                  <div key={date} className="relative pl-10 pb-4 last:pb-0">
                    <div className="absolute left-2.5 w-3 h-3 bg-purple-500 rounded-full border-2 border-white" />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-slate-900">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-slate-500">${daySpend.toFixed(2)}</p>
                      </div>
                      
                      {dayTransactions.map((t, tidx) => (
                        <div key={tidx} className="flex items-center gap-2 text-sm bg-white p-2 rounded">
                          <span className="flex-1 truncate text-slate-900">{t.merchant_name}</span>
                          {t.travel_context?.original_pillar && t.travel_context.original_pillar !== "Travel & Experiences" && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <span className="hidden sm:inline">{t.travel_context.original_pillar}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span className="text-purple-500">Travel</span>
                            </div>
                          )}
                          <span className="text-slate-500">${t.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function TravelTimeline({ transactions }: TravelTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const trips = groupTransactionsByTrip(transactions);
  const totalTravelTransactions = trips.reduce((sum, t) => sum + t.transactions.length, 0);
  const totalTravelSpend = trips.reduce((sum, t) => sum + t.totalSpend, 0);
  const totalReclassified = trips.reduce((sum, t) => sum + t.reclassifiedCount, 0);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white border-slate-200">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-slate-900">Travel Intelligence (Pattern Recognition)</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
                <span>{totalTravelTransactions} txns</span>
                <span>${totalTravelSpend.toFixed(2)}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {trips.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1 text-slate-900">No travel patterns detected</p>
                <p className="text-sm">Travel Intelligence uses AI pattern recognition to identify and contextualize travel-related spending across all transaction categories.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {totalReclassified > 0 && (
                  <p className="text-sm text-slate-500 mb-4">
                    {totalReclassified} transaction{totalReclassified !== 1 ? 's' : ''} reclassified from other pillars to Travel
                  </p>
                )}
                
                {trips.map((trip, idx) => (
                  <TripSection key={`${trip.destination}-${trip.startDate}`} trip={trip} defaultOpen={idx === 0} />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
