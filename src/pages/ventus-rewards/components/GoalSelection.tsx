
import { Check } from "lucide-react";
import { LifestyleGoal, LifestyleOption } from "../types";

interface GoalSelectionProps {
  lifestyleOptions: LifestyleOption[];
  selectedGoal: LifestyleGoal | null;
  onGoalSelect: (goal: LifestyleGoal) => void;
}

const GoalSelection = ({ lifestyleOptions, selectedGoal, onGoalSelect }: GoalSelectionProps) => {
  return (
    <section id="goal-selection" className="pt-0 pb-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
            Choose Your Main Lifestyle Goal
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Select the primary lifestyle area where you want to earn rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lifestyleOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => onGoalSelect(option.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedGoal === option.id
                  ? 'border-blue-500 bg-blue-900/30 shadow-lg scale-105'
                  : 'border-slate-700 bg-slate-800 hover:border-blue-400'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                <p className="text-slate-300 mb-3">{option.description}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  option.year === "Launching First" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {option.year}
                </span>
              </div>
              
              {selectedGoal === option.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {selectedGoal === option.id && (
                <div className="mt-6 pt-6 border-t border-blue-700">
                  <p className="text-sm font-medium text-blue-300 mb-2">Sample Merchants:</p>
                  <div className="flex flex-wrap gap-2">
                    {option.merchants.map((merchant) => (
                      <span
                        key={merchant}
                        className="px-2 py-1 bg-blue-800 text-blue-100 text-xs rounded-md"
                      >
                        {merchant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoalSelection;
