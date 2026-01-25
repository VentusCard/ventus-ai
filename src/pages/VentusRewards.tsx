
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LifestyleGoal } from "./ventus-rewards/types";
import { lifestyleOptions } from "./ventus-rewards/data";
import HeroSection from "./ventus-rewards/components/HeroSection";
import GoalSelection from "./ventus-rewards/components/GoalSelection";
import SubcategorySelection from "./ventus-rewards/components/SubcategorySelection";
import ComparisonSection from "./ventus-rewards/components/ComparisonSection";

const VentusRewards = () => {
  const [selectedGoal, setSelectedGoal] = useState<LifestyleGoal | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const selectedOption = lifestyleOptions.find(option => option.id === selectedGoal);

  const handleGoalSelect = (goal: LifestyleGoal) => {
    setSelectedGoal(goal);
    setSelectedSubcategories([]);
    setCurrentStep(2);
    setTimeout(() => {
      document.getElementById('subcategories-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subcategory) 
        ? prev.filter(s => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  const proceedToComparison = () => {
    setCurrentStep(3);
    setTimeout(() => {
      document.getElementById('comparison-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <HeroSection />

      <GoalSelection 
        lifestyleOptions={lifestyleOptions}
        selectedGoal={selectedGoal}
        onGoalSelect={handleGoalSelect}
      />

      {selectedGoal && (
        <SubcategorySelection
          selectedOption={selectedOption}
          selectedSubcategories={selectedSubcategories}
          onSubcategoryToggle={handleSubcategoryToggle}
          onProceedToComparison={proceedToComparison}
        />
      )}

      {currentStep >= 3 && selectedGoal && (
        <ComparisonSection
          selectedGoal={selectedGoal}
          selectedSubcategories={selectedSubcategories}
        />
      )}

      <Footer />
    </div>
  );
};

export default VentusRewards;
