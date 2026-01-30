
import { LifestyleGoal } from "@/pages/OnboardingFlow";
import SelectedCategoriesImpactCard from "./SelectedCategoriesImpactCard";
import TraditionalVsVentusComparison from "./TraditionalVsVentusComparison";
import VentusSimplificationSection from "./VentusSimplificationSection";

interface StepTwoValueComparisonAndSimplificationProps {
  selectedGoal: LifestyleGoal;
  selectedSubcategories: string[];
}

const StepTwoValueComparisonAndSimplification = ({
  selectedGoal,
  selectedSubcategories
}: StepTwoValueComparisonAndSimplificationProps) => {
  return (
    <div>
      {/* Selected Categories Impact - Moved to top */}
      <SelectedCategoriesImpactCard 
        selectedGoal={selectedGoal} 
        selectedSubcategories={selectedSubcategories} 
      />

      <TraditionalVsVentusComparison />

      <VentusSimplificationSection />
    </div>
  );
};

export default StepTwoValueComparisonAndSimplification;
