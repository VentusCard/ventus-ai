
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LifestyleOption } from "../types";

interface SubcategorySelectionProps {
  selectedOption: LifestyleOption | undefined;
  selectedSubcategories: string[];
  onSubcategoryToggle: (subcategory: string) => void;
  onProceedToComparison: () => void;
}

const SubcategorySelection = ({ 
  selectedOption, 
  selectedSubcategories, 
  onSubcategoryToggle, 
  onProceedToComparison 
}: SubcategorySelectionProps) => {
  if (!selectedOption) return null;

  return (
    <section id="subcategories-section" className="py-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Choose Your Subcategories
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
            Customize your {selectedOption.title} goal by selecting your interests
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {selectedOption.subcategories.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => onSubcategoryToggle(subcategory)}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-300 backdrop-blur-sm transform hover:scale-105 ${
                selectedSubcategories.includes(subcategory)
                  ? 'border-blue-500 bg-gradient-to-br from-blue-900/50 to-blue-800/50 text-blue-200 shadow-premium'
                  : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-blue-400 hover:bg-slate-700 shadow-metallic hover:shadow-premium'
              }`}
            >
              <div className="font-medium">{subcategory}</div>
            </button>
          ))}
        </div>

        {selectedSubcategories.length > 0 && (
          <div className="text-center">
            <Button
              onClick={onProceedToComparison}
              variant="premium"
              size="lg"
              className="px-8 py-3 font-semibold flex items-center gap-2 mx-auto"
            >
              See How Ventus Simplifies This <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SubcategorySelection;
