import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EnrichedTransaction } from "@/types/transaction";
import { aggregateByPillar, getSubcategoriesForPillar } from "@/lib/aggregations";
import { formatDateRange, calculateDays } from "./TravelTimeline";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { useState, useCallback, useEffect } from "react";
import { SubcategoryTransactionsModal } from "./SubcategoryTransactionsModal";
import { TransactionDetailModal } from "../TransactionDetailModal";
import { hashString, getBudgetStatus } from "@/lib/budgetUtils";
import { groupTransactionsByTrip, TripSection } from "./TravelTimeline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Map } from "lucide-react";

interface PillarExplorerProps {
  transactions: EnrichedTransaction[];
  budgetMode?: boolean;
  budgets: Record<string, number>;
  setBudgets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  subcategoryBudgets: Record<string, number>;
  setSubcategoryBudgets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function PillarExplorer({ transactions, budgetMode = false, budgets, setBudgets, subcategoryBudgets, setSubcategoryBudgets }: PillarExplorerProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    subcategory: string;
    pillar: string;
  } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<EnrichedTransaction | null>(null);
  const [travelViewMode, setTravelViewMode] = useState<"categories" | "trips">("categories");
  const [selectedTripIdx, setSelectedTripIdx] = useState<number | null>(null);

  // Reset travel view mode when pillar changes
  useEffect(() => {
    setTravelViewMode("categories");
    setSelectedTripIdx(null);
  }, [selectedPillar]);
  
  const trips = groupTransactionsByTrip(transactions);
  const pillars = aggregateByPillar(transactions);
  const totalSpend = pillars.reduce((sum, p) => sum + p.totalSpend, 0);

  const getSubcategoryBudget = useCallback((pillar: string, subcategory: string, spend: number) => {
    const key = `${pillar}::${subcategory}`;
    if (subcategoryBudgets[key] !== undefined) return subcategoryBudgets[key];
    const seed = hashString(key);
    const multiplier = 0.7 + ((seed % 80) / 100);
    const budget = Math.round(spend * multiplier);
    setSubcategoryBudgets(prev => ({ ...prev, [key]: budget }));
    return budget;
  }, [subcategoryBudgets, setSubcategoryBudgets]);

  return (
    <div className="space-y-6">
      {/* Pillar Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 [grid-auto-rows:1fr]">
        {pillars.map((pillar) => {
          const color = PILLAR_COLORS[pillar.pillar] || "#64748b";
          const percentage = (pillar.totalSpend / totalSpend) * 100;
          const isSelected = selectedPillar === pillar.pillar;
          const budget = budgets[pillar.pillar] || 0;
          const budgetInfo = getBudgetStatus(pillar.totalSpend, budget);
          
          return (
            <Card
              key={pillar.pillar}
              className={`cursor-pointer transition-all hover:scale-105 hover:shadow-xl bg-white border-slate-200 relative h-full ${
                isSelected ? 'ring-2 shadow-xl' : ''
              }`}
              style={{
                borderColor: isSelected ? color : undefined,
                boxShadow: isSelected ? `0 10px 30px -10px ${color}40` : undefined
              }}
              onClick={() => setSelectedPillar(isSelected ? null : pillar.pillar)}
            >
              {/* Budget Badge */}
              {budgetMode && (
                <div
                  className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full border-2 bg-white shadow-md"
                  style={{ borderColor: budgetInfo.color }}
                  title={`${budgetInfo.label} — Budget: $${budget}`}
                >
                  <budgetInfo.icon className="w-3.5 h-3.5" style={{ color: budgetInfo.color }} />
                </div>
              )}
              <CardContent className="p-3 h-full">
                <div className="flex flex-col h-full gap-2">
                  <div 
                    className="w-full h-0.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <p className="font-semibold text-sm line-clamp-2 text-slate-900">{pillar.pillar}</p>
                    <p className="text-lg font-bold" style={{ color }}>${pillar.totalSpend.toFixed(0)}</p>
                    {budgetMode && (
                      <p className="text-xs mt-0.5" style={{ color: budgetInfo.color }}>
                        Budget: ${budget}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{pillar.transactionCount} trans.</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  {pillar.pillar === "Travel & Exploration" && trips.length > 0 && (() => {
                    const maxShow = 3;
                    const destinations = trips.slice(0, maxShow).map(t => t.destination);
                    const remaining = trips.length - maxShow;
                    const label = destinations.join(', ') + (remaining > 0 ? `, +${remaining} more` : '');
                    return (
                      <p className="text-xs font-medium" style={{ color }}>
                        {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'}: {label}
                      </p>
                    );
                  })()}
                  {/* Mini sparkline */}
                  <div className="mt-auto flex items-end gap-0.5 h-4">
                    {Array.from({ length: 8 }).map((_, idx) => {
                      const height = Math.random() * 100;
                      return (
                        <div
                          key={idx}
                          className="flex-1 rounded-t"
                          style={{
                            backgroundColor: `${color}60`,
                            height: `${height}%`
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expanded Details */}
      {selectedPillar && (
        <Card className="animate-fade-in bg-white border-slate-200">
          <div className="p-6 flex items-center gap-3 border-b border-slate-200 flex-wrap">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: PILLAR_COLORS[selectedPillar] || "#64748b" }}
            />
            <h3 className="text-xl font-semibold text-slate-900">
              {selectedPillar} (${pillars.find(p => p.pillar === selectedPillar)?.totalSpend.toFixed(0) || '0'}) - Detailed Breakdown
            </h3>
            
            {/* Travel view toggle */}
            {selectedPillar === "Travel & Exploration" && (
              <ToggleGroup
                type="single"
                value={travelViewMode}
                onValueChange={(val) => { if (val) setTravelViewMode(val as "categories" | "trips"); }}
                className="ml-auto"
              >
                <ToggleGroupItem value="categories" aria-label="Categories view" className="gap-1.5 text-xs px-3">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Categories
                </ToggleGroupItem>
                <ToggleGroupItem value="trips" aria-label="Trips view" className="gap-1.5 text-xs px-3">
                  <Map className="w-3.5 h-3.5" />
                  Trips ({trips.length})
                </ToggleGroupItem>
              </ToggleGroup>
            )}

            {budgetMode && selectedPillar !== "Travel & Exploration" && (
              <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
                <span>Budget: $</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-sm"
                  value={budgets[selectedPillar] ?? 0}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setBudgets(prev => ({ ...prev, [selectedPillar]: val }));
                  }}
                />
              </div>
            )}
            {budgetMode && selectedPillar === "Travel & Exploration" && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Budget: $</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-sm"
                  value={budgets[selectedPillar] ?? 0}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setBudgets(prev => ({ ...prev, [selectedPillar]: val }));
                  }}
                />
              </div>
            )}
          </div>
          
          <CardContent className="pt-6">
            {(() => {
              // When in trips view, exclude trip-associated transactions from subcategory totals to avoid double-counting
              const isTripsView = selectedPillar === "Travel & Exploration" && travelViewMode === "trips";
              const tripTransactionSet = new Set<number>();
              if (isTripsView) {
                const tripsData = groupTransactionsByTrip(transactions);
                tripsData.forEach(trip => trip.transactions.forEach((t, i) => {
                  // Use index in full transactions array to identify
                  const idx = transactions.indexOf(t);
                  if (idx >= 0) tripTransactionSet.add(idx);
                }));
              }
              const nonTripTransactions = isTripsView
                ? transactions.filter((_, idx) => !tripTransactionSet.has(idx))
                : transactions;
              const subcategories = getSubcategoriesForPillar(selectedPillar, isTripsView ? nonTripTransactions : transactions);
              const pillarTransactions = transactions.filter(t => t.pillar === selectedPillar);
              const pillarTotal = pillars.find(p => p.pillar === selectedPillar)?.totalSpend || 0;
              
              return (
                <div className="space-y-6">
                  {/* Unified grid: trip cards (when trips view) + subcategory cards */}
                  <div>
                    <h4 className="text-sm font-medium mb-4 text-slate-900">
                      {selectedPillar === "Travel & Exploration" && travelViewMode === "trips"
                        ? "Trips & Subcategories"
                        : "Subcategories"}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 [grid-auto-rows:1fr]">
                      {/* Trip cards first when trips view is active */}
                      {selectedPillar === "Travel & Exploration" && travelViewMode === "trips" && (() => {
                        const tripsData = groupTransactionsByTrip(transactions);
                        const pillarTotalSpend = pillars.find(p => p.pillar === "Travel & Exploration")?.totalSpend || 0;
                        return tripsData.map((trip, idx) => {
                          const percentage = pillarTotalSpend > 0 ? (trip.totalSpend / pillarTotalSpend) * 100 : 0;
                          const days = calculateDays(trip.startDate, trip.endDate);
                          const isSelected = selectedTripIdx === idx;
                          return (
                            <div
                              key={`trip-${trip.destination}-${trip.startDate}`}
                              className={`flex flex-col h-full p-4 rounded-lg bg-purple-50 border cursor-pointer hover:bg-purple-100 transition-colors ${isSelected ? 'border-purple-400 ring-1 ring-purple-400' : 'border-purple-200'}`}
                              onClick={() => setSelectedTripIdx(isSelected ? null : idx)}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <Map className="w-3.5 h-3.5 text-purple-500" />
                                <p className="font-medium text-sm text-slate-900">{trip.destination}</p>
                              </div>
                              <p className="text-xl font-bold text-slate-900">${trip.totalSpend.toFixed(2)}</p>
                              <p className="text-xs text-slate-600 mt-1">
                                {formatDateRange(trip.startDate, trip.endDate)} • {days} day{days > 1 ? 's' : ''}
                              </p>
                              <div className="mt-auto pt-3 space-y-2">
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                  <span>{trip.transactions.length} transactions</span>
                                  <span>{percentage.toFixed(1)}% of travel</span>
                                </div>
                                <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all bg-purple-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}

                      {/* Subcategory cards */}
                      {subcategories.slice(0, 6).map((subcat) => {
                        const percentage = (subcat.totalSpend / pillarTotal) * 100;
                        const subcatBudget = budgetMode ? getSubcategoryBudget(selectedPillar, subcat.subcategory, subcat.totalSpend) : 0;
                        const subcatBudgetInfo = budgetMode ? getBudgetStatus(subcat.totalSpend, subcatBudget) : null;
                        const budgetKey = `${selectedPillar}::${subcat.subcategory}`;
                        
                        return (
                          <div
                            key={subcat.subcategory}
                            className={`flex flex-col h-full p-4 rounded-lg border cursor-pointer transition-colors ${
                              selectedSubcategory?.subcategory === subcat.subcategory && selectedSubcategory?.pillar === selectedPillar
                                ? 'bg-slate-100 border-slate-400 ring-1 ring-slate-400'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const isAlreadySelected = selectedSubcategory?.subcategory === subcat.subcategory && selectedSubcategory?.pillar === selectedPillar;
                              setSelectedSubcategory(isAlreadySelected ? null : {
                                subcategory: subcat.subcategory,
                                pillar: selectedPillar
                              });
                            }}
                          >
                            <p className="font-medium text-sm mb-1 text-slate-900">{subcat.subcategory}</p>
                            <p className="text-xl font-bold text-slate-900">${subcat.totalSpend.toFixed(2)}</p>
                            {budgetMode && subcatBudgetInfo && (
                              <div className="flex items-center gap-2 mt-1">
                                <subcatBudgetInfo.icon className="w-3.5 h-3.5" style={{ color: subcatBudgetInfo.color }} />
                                <span className="text-xs" style={{ color: subcatBudgetInfo.color }}>Budget: $</span>
                                <Input
                                  type="number"
                                  className="w-20 h-6 text-xs px-1"
                                  value={subcategoryBudgets[budgetKey] ?? subcatBudget}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setSubcategoryBudgets(prev => ({ ...prev, [budgetKey]: val }));
                                  }}
                                />
                              </div>
                            )}
                            <div className="mt-auto pt-3 space-y-2">
                              <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>{subcat.transactionCount} transactions</span>
                                <span>{percentage.toFixed(1)}% of {selectedPillar}</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: budgetMode && subcatBudget > 0
                                      ? `${Math.min(100, (subcat.totalSpend / subcatBudget) * 100)}%`
                                      : `${percentage}%`,
                                    backgroundColor: budgetMode && subcatBudgetInfo
                                      ? subcatBudgetInfo.color
                                      : (PILLAR_COLORS[selectedPillar] || "#64748b")
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expanded trip detail below grid */}
                  {selectedPillar === "Travel & Exploration" && travelViewMode === "trips" && selectedTripIdx !== null && (() => {
                    const tripsData = groupTransactionsByTrip(transactions);
                    if (!tripsData[selectedTripIdx]) return null;
                    return (
                      <div>
                        <TripSection trip={tripsData[selectedTripIdx]} defaultOpen={true} />
                      </div>
                    );
                  })()}

                  <div>
                    <h4 className="text-sm font-medium mb-4 text-slate-900">
                      {selectedSubcategory
                        ? `${selectedSubcategory.subcategory} Transactions`
                        : 'Recent Transactions'}
                    </h4>
                    <div className="space-y-2">
                      {(() => {
                        const filtered = selectedSubcategory
                          ? pillarTransactions.filter(t => t.subcategory === selectedSubcategory.subcategory)
                          : pillarTransactions;
                        const shown = filtered.slice(0, selectedSubcategory ? 20 : 5);
                        if (shown.length === 0) {
                          return <p className="text-sm text-slate-500">No transactions found.</p>;
                        }
                        return shown.map((t, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setSelectedTransaction(t)}
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm text-slate-900">{t.merchant_name}</p>
                              <p className="text-xs text-slate-600">{t.subcategory}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">${t.amount.toFixed(2)}</p>
                              <p className="text-xs text-slate-600">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}


      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
