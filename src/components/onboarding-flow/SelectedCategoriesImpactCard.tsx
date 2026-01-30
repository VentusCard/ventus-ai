import { LifestyleGoal } from "@/pages/OnboardingFlow";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { mainCategoryScenarios, goalTitles } from "./CategoryDataConstants";
interface SelectedCategoriesImpactCardProps {
  selectedGoal: LifestyleGoal;
  selectedSubcategories: string[];
}
const SelectedCategoriesImpactCard = ({
  selectedGoal,
  selectedSubcategories
}: SelectedCategoriesImpactCardProps) => {
  // Get scenarios for the selected goal
  const scenarios = mainCategoryScenarios[selectedGoal] || [];

  // Map card names to their brand colors
  const getCardColor = (cardName: string) => {
    if (cardName.includes('Shopping Cashback')) return 'bg-red-500';
    if (cardName.includes('General Cashback')) return 'bg-gray-500';
    if (cardName.includes('Dining')) return 'bg-orange-500';
    if (cardName.includes('Grocery')) return 'bg-green-500';
    return 'bg-gray-500'; // fallback
  };
  return <Card className="premium-card bg-gradient-to-r from-blue-500/20 to-blue-600/10 border-0 md:border md:border-blue-400/30 mb-4 md:mb-6">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-blue-300 leading-tight">No more memorizing categories and juggling cards</h3>
        </div>
        
        <p className="text-white/80 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
          Traditional credit cards force you to juggle multiple cards for different purchase types. 
          <br />
          Ventus automatically gives you <strong className="text-white">5x rewards on ALL related purchases</strong> with one intelligent card:
        </p>

        <div className="space-y-3 md:space-y-4">
          {scenarios.map((scenario, index) => <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 md:p-3 bg-slate-800/50 rounded-lg border border-slate-600/50 gap-2 sm:gap-4">
              <span className="text-white font-medium text-sm md:text-base leading-relaxed">
                {scenario.subcategory}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`px-2 py-1 ${getCardColor(scenario.card)} text-white text-xs rounded opacity-60 line-through flex-shrink-0`}>
                  {scenario.multiplier} with {scenario.card}
                </div>
                <span className="text-xs text-blue-400 hidden sm:inline">→</span>
                <div className="px-2 md:px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded font-bold flex-shrink-0">
                  5X with Ventus Card
                </div>
              </div>
            </div>)}
        </div>

        <div className="mt-2 md:mt-3 text-center">
          
        </div>
      </CardContent>
    </Card>;
};
export default SelectedCategoriesImpactCard;