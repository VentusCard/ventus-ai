import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { SubcategoryTransactionsModal } from "@/components/tepilot/insights/SubcategoryTransactionsModal";
import { TransactionDetailModal } from "@/components/tepilot/TransactionDetailModal";
import { EnrichedTransaction } from "@/types/transaction";

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any>(null);
  const [enrichedTransactions, setEnrichedTransactions] = useState<EnrichedTransaction[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    subcategory: string;
    pillar: string;
  } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<EnrichedTransaction | null>(null);

  useEffect(() => {
    // Load recommendations from sessionStorage
    const stored = sessionStorage.getItem("tepilot_recommendations");
    if (stored) {
      try {
        setRecommendations(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse recommendations:", error);
      }
    }

    // Load enriched transactions from sessionStorage
    const storedTransactions = sessionStorage.getItem("tepilot_enriched_transactions");
    if (storedTransactions) {
      try {
        setEnrichedTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error("Failed to parse enriched transactions:", error);
      }
    }
  }, []);

  const filteredTransactions = selectedSubcategory
    ? enrichedTransactions.filter(t => t.subcategory === selectedSubcategory.subcategory)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/tepilot")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to TePilot
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Revenue Recommendations</h1>
            <p className="text-muted-foreground">
              AI-generated opportunities for banking partners
            </p>
          </div>
        </div>

        {/* Content */}
        {recommendations ? (
          <>
            {/* Top 5 Subcategories Card */}
            {recommendations.topSubcategories && (
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Spending Subcategories</CardTitle>
                  <CardDescription>
                    Most significant subcategory spending patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {recommendations.topSubcategories.map((subcat: any, index: number) => {
                      const color = PILLAR_COLORS[subcat.pillar] || "#64748b";
                      return (
                        <Card
                          key={subcat.subcategory}
                          className="relative overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => setSelectedSubcategory({
                            subcategory: subcat.subcategory,
                            pillar: subcat.pillar
                          })}
                        >
                          <div 
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ backgroundColor: color }}
                          />
                          <CardContent className="pt-6 p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div 
                                  className="flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm"
                                  style={{ 
                                    backgroundColor: `${color}20`, 
                                    color: color 
                                  }}
                                >
                                  {index + 1}
                                </div>
                              </div>
                              
                              <div>
                                <div className="font-medium text-sm mb-1 line-clamp-2">
                                  {subcat.subcategory}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {subcat.pillar}
                                </div>
                              </div>
                              
                              <div>
                                <div 
                                  className="text-xl font-bold"
                                  style={{ color }}
                                >
                                  ${subcat.totalSpend.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {subcat.visits} transactions
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Personalized Recommendations Info */}
            <Card className="bg-violet-50/50 border-violet-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  <CardTitle>Personalized Deal Messaging</CardTitle>
                </div>
                <CardDescription>
                  View personalized deals in the Reward Personalization Experience section on TePilot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/tepilot")} variant="outline" className="border-violet-300">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Go to TePilot
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Recommendations Available</CardTitle>
              <CardDescription>
                Generate recommendations from the TePilot Analytics tab first
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please return to the TePilot page and generate recommendations before accessing this page.
                </AlertDescription>
              </Alert>
              <Button
                className="mt-4"
                onClick={() => navigate("/tepilot")}
              >
                Go to TePilot
              </Button>
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
            transactions={filteredTransactions}
            onTransactionClick={(t) => setSelectedTransaction(t)}
          />
        )}

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <TransactionDetailModal
            isOpen={!!selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            transaction={selectedTransaction}
          />
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
