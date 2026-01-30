import { Button } from "@/components/ui/button";
import { CreditCard, Zap, Target } from "lucide-react";
import { LifestyleGoal } from "../types";
import { getExamplePurchases, cardTypes } from "../data";

interface ComparisonSectionProps {
  selectedGoal: LifestyleGoal;
  selectedSubcategories: string[];
}

const ComparisonSection = ({ selectedGoal, selectedSubcategories }: ComparisonSectionProps) => {
  return (
    <section id="comparison-section" className="py-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
            The Ventus Advantage
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            See what you'd previously need 3+ specialized cards to accomplish vs. what Ventus does in one
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* The Problem */}
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-8 h-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-red-200 mb-2">
                Without Ventus: Card Juggling Required
              </h3>
              <div className="text-4xl font-bold text-red-300 mb-2">1-3x</div>
              <p className="text-red-300">and miss out on savings</p>
            </div>
            
            <div className="space-y-6">
              {selectedSubcategories.map((subcategory) => {
                const examplePurchases = getExamplePurchases(selectedGoal, subcategory);
                return (
                  <div key={subcategory} className="bg-slate-800 rounded-lg p-6 border border-red-700">
                    <h4 className="font-bold text-lg text-white mb-4">{subcategory}</h4>
                    <div className="space-y-3">
                      {examplePurchases.map((purchase, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                          <span className="text-slate-200 text-sm">{purchase.category}</span>
                          <span className={`px-2 py-1 ${purchase.cardColor} text-white text-xs rounded-full`}>
                            {purchase.cardType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {cardTypes.map((card) => (
                  <div key={card.name} className={`${card.color} text-white px-2 py-1 rounded text-xs`}>
                    {card.name}
                  </div>
                ))}
              </div>
              <p className="text-red-300 font-medium">4+ Cards Required</p>
            </div>
          </div>

          {/* The Solution */}
          <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-600 rounded-xl p-8 h-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-green-200 mb-2">
                With Ventus: One Card Does It All
              </h3>
              <div className="text-4xl font-bold text-green-300 mb-2">5x</div>
              <p className="text-green-300">On All Your Lifestyle Spending</p>
            </div>
            
            <div className="space-y-6">
              {selectedSubcategories.map((subcategory) => {
                const examplePurchases = getExamplePurchases(selectedGoal, subcategory);
                return (
                  <div key={subcategory} className="bg-slate-800 rounded-lg p-6 border border-green-600">
                    <h4 className="font-bold text-lg text-white mb-4">{subcategory}</h4>
                    <div className="space-y-3">
                      {examplePurchases.map((purchase, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-green-900/40 rounded-lg border border-green-600">
                          <span className="text-slate-200 text-sm">{purchase.category}</span>
                          <span className="px-3 py-1 bg-green-600 text-white font-bold text-xs rounded-lg">
                            5x Points
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold mb-3">
                One Ventus Card
              </div>
              <p className="text-green-300 font-bold">1 Card. All Categories. 5x Rewards.</p>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 mb-8">
          <div className="text-center p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
            <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-6 w-6 text-blue-300" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">One Card Replaces Multiple</h3>
            <p className="text-slate-300">No more juggling 3+ specialized cards</p>
          </div>
          <div className="text-center p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
            <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-300" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">5x Points Automatically</h3>
            <p className="text-slate-300">No mental math or category tracking</p>
          </div>
          <div className="text-center p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
            <div className="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-purple-300" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">AI-Powered Personalization</h3>
            <p className="text-slate-300">Your preferences drive offers and multipliers</p>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            "Why choose between cards — when Ventus rewards everything you care about?"
          </h3>
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
            Join the Waitlist
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
