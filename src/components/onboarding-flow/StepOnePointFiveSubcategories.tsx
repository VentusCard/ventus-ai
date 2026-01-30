
import { LifestyleGoal } from "@/pages/OnboardingFlow";

interface StepOnePointFiveSubcategoriesProps {
  selectedGoal: LifestyleGoal;
  selectedSubcategories: string[];
  onSelectSubcategories: (subcategories: string[]) => void;
}

const subcategoryData: Record<LifestyleGoal, string[]> = {
  sports: ["Golf", "Tennis/Racquet Sports", "Running/Track", "Basketball", "Football", "Soccer", "Outdoor Activities", "Cycling/Biking", "Water Sports", "Snow Sports", "Fitness/Gym", "Yoga/Pilates"],
  wellness: ["Fitness and Recovery", "Mental Health and Mindfulness", "Nutrition and Supplements", "Beauty and Cosmetics", "Haircare and Skincare", "Sleep and Restfulness", "Women's Health", "Men's Health", "Retreats and Experiences"],
  pets: ["Dog Owners", "Cat Owners", "Grooming and Health", "Pet Food and Nutrition", "Pet Activities and Services"],
  gamers: ["PC Gaming", "Console Gaming", "Mobile Gaming", "Esports and Streaming", "Gaming Accessories"],
  creatives: ["Photography", "Music Production", "Art Supplies", "Writing Tools", "Online Creative Classes"],
  homeowners: ["Home Improvement", "Smart Home Tech", "Furniture and Decor", "Gardening and Outdoors", "Home Services"]
};

const goalTitles: Record<LifestyleGoal, string> = {
  sports: "Sports",
  wellness: "Wellness",
  pets: "Pet Owners",
  gamers: "Gamers",
  creatives: "Creatives",
  homeowners: "Homeowners"
};

const StepOnePointFiveSubcategories = ({
  selectedGoal,
  selectedSubcategories,
  onSelectSubcategories
}: StepOnePointFiveSubcategoriesProps) => {
  const subcategories = subcategoryData[selectedGoal] || [];

  const toggleSubcategory = (subcategory: string) => {
    const updated = selectedSubcategories.includes(subcategory) 
      ? selectedSubcategories.filter(s => s !== subcategory) 
      : [...selectedSubcategories, subcategory];
    onSelectSubcategories(updated);
  };

  return (
    <div 
      className="touch-manipulation"
      style={{
        touchAction: 'manipulation',
        pointerEvents: 'auto',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <h2 className="font-display text-xl md:text-2xl font-bold mb-3">
        Choose Your Subcategories
      </h2>
      <p className="text-base text-slate-600 mb-6">
        Select the subcategories that reflect your interests. You may choose more than one. 
        Each will unlock a curated set of reward opportunities and merchant deals.
      </p>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-display text-lg font-bold mb-2">
          Selected Goal: {goalTitles[selectedGoal]}
        </h3>
        <p className="text-slate-600 text-sm">
          Now customize your experience by selecting specific areas within {goalTitles[selectedGoal]} {' '}
          where you want to earn enhanced rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {subcategories.map(subcategory => (
          <button
            key={subcategory}
            onClick={() => toggleSubcategory(subcategory)}
            className={`p-3 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 touch-manipulation min-h-[48px] ${
              selectedSubcategories.includes(subcategory)
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 shadow-md'
            }`}
            style={{
              touchAction: 'manipulation',
              pointerEvents: 'auto',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <div className="font-medium text-sm">{subcategory}</div>
          </button>
        ))}
      </div>

      {selectedSubcategories.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-display text-lg font-bold mb-3">
            Selected Subcategories ({selectedSubcategories.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSubcategories.map(sub => (
              <span key={sub} className="px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-[#033bbc]">
                {sub}
              </span>
            ))}
          </div>
          <p className="text-slate-600 mt-3 text-sm">
            Perfect! You'll see how Ventus simplifies earning rewards across all these categories in the next steps.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepOnePointFiveSubcategories;
