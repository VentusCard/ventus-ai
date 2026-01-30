import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LifestyleGoal } from "@/pages/OnboardingFlow";

interface StepOneProps {
  selectedGoal: LifestyleGoal | null;
  onSelectGoal: (goal: LifestyleGoal) => void;
}

const StepOne: React.FC<StepOneProps> = ({ selectedGoal, onSelectGoal }) => {
  const [hoveredGoal, setHoveredGoal] = useState<LifestyleGoal | null>(null);

  const goals: {
    value: LifestyleGoal;
    label: string;
    description: string;
    image: string;
  }[] = [
    {
      value: "sports",
      label: "Sports & Outdoors",
      description: "For the active and adventurous",
      image: "/images/onboarding/sports.jpg"
    },
    {
      value: "wellness",
      label: "Health & Wellness",
      description: "Prioritizing your well-being",
      image: "/images/onboarding/wellness.jpg"
    },
    {
      value: "pets",
      label: "Pets & Animals",
      description: "Spoil your furry friends",
      image: "/images/onboarding/pets.jpg"
    },
    {
      value: "gamers",
      label: "Gaming & Entertainment",
      description: "Level up your leisure time",
      image: "/images/onboarding/gamers.jpg"
    },
    {
      value: "creatives",
      label: "Arts & Creatives",
      description: "Unleash your inner artist",
      image: "/images/onboarding/creatives.jpg"
    },
    {
      value: "homeowners",
      label: "Home & DIY",
      description: "Creating your dream space",
      image: "/images/onboarding/homeowners.jpg"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl md:text-3xl font-bold">Choose Your Main Lifestyle Goal</h2>
      <p className="text-lg text-slate-600">
        Select the category that best represents your primary spending habits and interests. This will help us personalize your rewards.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card 
            key={goal.value}
            className={`group relative overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              selectedGoal === goal.value ? 'border-blue-500 shadow-xl' : 'border-slate-200'
            } ${
              hoveredGoal === goal.value ? 'border-blue-300' : ''
            }`}
            onMouseEnter={() => setHoveredGoal(goal.value)}
            onMouseLeave={() => setHoveredGoal(null)}
            onClick={() => onSelectGoal(goal.value)}
          >
            <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>
            <CardContent className="relative p-4 flex items-end z-20">
              <img 
                src={goal.image} 
                alt={goal.label} 
                className="absolute inset-0 object-cover w-full h-full rounded-md" 
              />
              <div className="relative w-full">
                <CardHeader className="px-0 pb-0 pt-2">
                  <CardTitle className={`text-lg font-semibold text-white drop-shadow-md`}>{goal.label}</CardTitle>
                </CardHeader>
                <p className="text-sm text-blue-100 drop-shadow-md">{goal.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StepOne;
