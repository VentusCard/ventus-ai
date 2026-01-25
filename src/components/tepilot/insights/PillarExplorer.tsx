import { Card, CardContent } from "@/components/ui/card";
import { EnrichedTransaction } from "@/types/transaction";
import { aggregateByPillar, getSubcategoriesForPillar } from "@/lib/aggregations";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { SubcategoryTransactionsModal } from "./SubcategoryTransactionsModal";
import { TransactionDetailModal } from "../TransactionDetailModal";

interface PillarExplorerProps {
  transactions: EnrichedTransaction[];
}

export function PillarExplorer({ transactions }: PillarExplorerProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    subcategory: string;
    pillar: string;
  } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<EnrichedTransaction | null>(null);
  
  const pillars = aggregateByPillar(transactions);
  const totalSpend = pillars.reduce((sum, p) => sum + p.totalSpend, 0);

  return (
    <div className="space-y-6">
      {/* Pillar Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {pillars.map((pillar) => {
          const color = PILLAR_COLORS[pillar.pillar] || "#64748b";
          const percentage = (pillar.totalSpend / totalSpend) * 100;
          const isSelected = selectedPillar === pillar.pillar;
          
          return (
            <Card
              key={pillar.pillar}
              className={`cursor-pointer transition-all hover:scale-105 hover:shadow-xl bg-white border-slate-200 ${
                isSelected ? 'ring-2 shadow-xl' : ''
              }`}
              style={{
                borderColor: isSelected ? color : undefined,
                boxShadow: isSelected ? `0 10px 30px -10px ${color}40` : undefined
              }}
              onClick={() => setSelectedPillar(isSelected ? null : pillar.pillar)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div 
                    className="w-full h-1 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <p className="font-semibold text-sm mb-1 line-clamp-2 text-slate-900">{pillar.pillar}</p>
                    <p className="text-2xl font-bold" style={{ color }}>${pillar.totalSpend.toFixed(0)}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
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
          <div className="p-6 flex items-center gap-3 border-b border-slate-200">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: PILLAR_COLORS[selectedPillar] || "#64748b" }}
            />
            <h3 className="text-xl font-semibold text-slate-900">{selectedPillar} - Detailed Breakdown</h3>
          </div>
          
          <CardContent className="pt-6">
            {(() => {
              const subcategories = getSubcategoriesForPillar(selectedPillar, transactions);
              const pillarTransactions = transactions.filter(t => t.pillar === selectedPillar);
              const pillarTotal = subcategories.reduce((sum, s) => sum + s.totalSpend, 0);
              
              return (
                <div className="space-y-6">
                  {/* Subcategories */}
                  <div>
                    <h4 className="text-sm font-medium mb-4 text-slate-900">Subcategories</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subcategories.slice(0, 6).map((subcat) => {
                        const percentage = (subcat.totalSpend / pillarTotal) * 100;
                        
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
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{subcat.transactionCount} transactions</span>
                              <span>{percentage.toFixed(1)}% of pillar</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: PILLAR_COLORS[selectedPillar] || "#64748b"
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Recent Transactions */}
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
                            <p className="text-xs text-slate-500">{t.subcategory}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">${t.amount.toFixed(2)}</p>
                            <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
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
