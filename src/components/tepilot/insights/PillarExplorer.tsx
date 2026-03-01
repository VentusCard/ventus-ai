import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EnrichedTransaction } from "@/types/transaction";
import { aggregateByPillar, getSubcategoriesForPillar } from "@/lib/aggregations";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { useState, useCallback, useEffect, useMemo } from "react";
import { SubcategoryTransactionsModal } from "./SubcategoryTransactionsModal";
import { TransactionDetailModal } from "../TransactionDetailModal";
import { hashString, getBudgetStatus } from "@/lib/budgetUtils";
import { groupTransactionsByTrip, TripSection } from "./TravelTimeline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Map, Plane } from "lucide-react";

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

  // Reset travel view mode when pillar changes
  useEffect(() => {
    setTravelViewMode("categories");
  }, [selectedPillar]);
  
  const pillars = aggregateByPillar(transactions);
  const totalSpend = pillars.reduce((sum, p) => sum + p.totalSpend, 0);

  const trips = useMemo(() => groupTransactionsByTrip(transactions), [transactions]);
  const totalTripSpend = useMemo(() => trips.reduce((sum, t) => sum + t.transactions.reduce((s, tx) => s + tx.amount, 0), 0), [trips]);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {pillars.map((pillar) => {
          const color = PILLAR_COLORS[pillar.pillar] || "#64748b";
          const percentage = (pillar.totalSpend / totalSpend) * 100;
          const isSelected = selectedPillar === pillar.pillar;
          const budget = budgets[pillar.pillar] || 0;
          const budgetInfo = getBudgetStatus(pillar.totalSpend, budget);
          
          return (
            <Card
              key={pillar.pillar}
              className={`cursor-pointer transition-all hover:scale-105 hover:shadow-xl bg-white border-slate-200 relative ${
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
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div 
                    className="w-full h-1 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <p className="font-semibold text-sm mb-1 line-clamp-2 text-slate-900">{pillar.pillar}</p>
                    <p className="text-2xl font-bold" style={{ color }}>${pillar.totalSpend.toFixed(0)}</p>
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
                  {/* Mini sparkline */}
                  <div className="flex items-end gap-0.5 h-6">
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
            <h3 className="text-xl font-semibold text-slate-900">{selectedPillar} - Detailed Breakdown</h3>
            
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
                  Trips ({groupTransactionsByTrip(transactions).length})
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
              const subcategories = getSubcategoriesForPillar(selectedPillar, transactions);
              const pillarTransactions = transactions.filter(t => t.pillar === selectedPillar);
              const pillarTotal = subcategories.reduce((sum, s) => sum + s.totalSpend, 0);
              
              return (
                <div className="space-y-6">
                  {/* Categories view (default, or always for non-travel pillars) */}
                  {(selectedPillar !== "Travel & Exploration" || travelViewMode === "categories") && (
                    <div>
                      <h4 className="text-sm font-medium mb-4 text-slate-900">Subcategories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subcategories.slice(0, 6).map((subcat) => {
                          const percentage = (subcat.totalSpend / pillarTotal) * 100;
                          const subcatBudget = budgetMode ? getSubcategoryBudget(selectedPillar, subcat.subcategory, subcat.totalSpend) : 0;
                          const subcatBudgetInfo = budgetMode ? getBudgetStatus(subcat.totalSpend, subcatBudget) : null;
                          const budgetKey = `${selectedPillar}::${subcat.subcategory}`;
                          
                          return (
                            <div
                              key={subcat.subcategory}
                              className="p-4 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubcategory({
                                  subcategory: subcat.subcategory,
                                  pillar: selectedPillar
                                });
                              }}
                            >
                              <p className="font-medium text-sm mb-2 text-slate-900">{subcat.subcategory}</p>
                              <p className="text-xl font-bold mb-1 text-slate-900">${subcat.totalSpend.toFixed(2)}</p>
                              {budgetMode && subcatBudgetInfo && (
                                <div className="flex items-center gap-2 mb-1">
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
                              <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>{subcat.transactionCount} transactions</span>
                                <span>{percentage.toFixed(1)}% of pillar</span>
                              </div>
                              <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
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
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Trips view (Travel & Exploration only) */}
                  {selectedPillar === "Travel & Exploration" && travelViewMode === "trips" && (() => {
                    const trips = groupTransactionsByTrip(transactions);
                    if (trips.length === 0) return (
                      <p className="text-sm text-slate-500 italic">No trips detected in transaction data.</p>
                    );
                    return (
                      <div>
                        <h4 className="text-sm font-medium mb-4 text-slate-900">
                          Detected Trips ({trips.length})
                        </h4>
                        <div className="space-y-3">
                          {trips.map((trip, idx) => (
                            <TripSection
                              key={`${trip.destination}-${trip.startDate}`}
                              trip={trip}
                              defaultOpen={idx === 0}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}


                  <div>
                    <h4 className="text-sm font-medium mb-4 text-slate-900">Recent Transactions</h4>
                    <div className="space-y-2">
                      {pillarTransactions.slice(0, 5).map((t, idx) => (
                         <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200"
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
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Subcategory Transactions Modal */}
      {selectedSubcategory && (
        <SubcategoryTransactionsModal
          isOpen={!!selectedSubcategory}
          onClose={() => setSelectedSubcategory(null)}
          subcategory={selectedSubcategory.subcategory}
          pillar={selectedSubcategory.pillar}
          transactions={transactions.filter(
            t => t.pillar === selectedSubcategory.pillar && 
                 t.subcategory === selectedSubcategory.subcategory
          )}
          onTransactionClick={(transaction) => {
            setSelectedTransaction(transaction);
          }}
        />
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
