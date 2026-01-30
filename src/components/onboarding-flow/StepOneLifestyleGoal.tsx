
import { Card, CardContent } from "@/components/ui/card";
import { LifestyleGoal } from "@/pages/OnboardingFlow";
import { Check } from "lucide-react";

interface StepOneLifestyleGoalProps {
  selectedGoal: LifestyleGoal | null;
  onSelectGoal: (goal: LifestyleGoal) => void;
}

interface GoalOption {
  id: LifestyleGoal;
  title: string;
  description: string;
  availability: string;
  year: "Available First" | "Available Soon" | "Year One";
  icon: string;
  merchants: {
    category: string;
    brands: string[];
  }[];
}

const goalOptions: GoalOption[] = [{
  id: "sports",
  title: "Sports",
  description: "Maximize rewards on sports equipment, apparel, subscriptions, and event tickets.",
  availability: "Available First",
  year: "Available First",
  icon: "🏃‍♂️",
  merchants: [{
    category: "Apparel and Gear",
    brands: ["Nike", "Adidas"]
  }, {
    category: "Equipment and Subscriptions",
    brands: ["Peloton", "WHOOP"]
  }, {
    category: "Online Subscriptions",
    brands: ["ESPN+", "NFL+"]
  }, {
    category: "Retail Stores",
    brands: ["Dick's Sporting Goods", "Foot Locker"]
  }, {
    category: "Supplements and Nutrition",
    brands: ["Huel", "AG1"]
  }, {
    category: "Event Tickets and Experiences",
    brands: ["Ticketmaster", "SeatGeek"]
  }]
}, {
  id: "wellness",
  title: "Wellness",
  description: "Earn more on fitness programs, mental health services, and wellness products.",
  availability: "Available Soon",
  year: "Available Soon",
  icon: "💚",
  merchants: [{
    category: "Fitness Programs",
    brands: ["ClassPass", "Orangetheory"]
  }, {
    category: "Mental Health Services",
    brands: ["BetterHelp", "Talkspace"]
  }, {
    category: "Nutrition and Supplements",
    brands: ["Athletic Greens", "Thorne"]
  }, {
    category: "Wellness Retailers",
    brands: ["Lululemon", "Alo Yoga"]
  }, {
    category: "Recovery and Devices",
    brands: ["Therabody", "Hyperice"]
  }, {
    category: "Meditation and Mindfulness Apps",
    brands: ["Headspace", "Calm"]
  }]
}, {
  id: "pets",
  title: "Pet Owners",
  description: "Get rewarded on pet supplies, veterinary services, and grooming expenses.",
  availability: "Available Soon",
  year: "Available Soon",
  icon: "🐕",
  merchants: [{
    category: "Pet Supply Retailers",
    brands: ["Chewy", "Petco"]
  }, {
    category: "Subscription Boxes",
    brands: ["BarkBox", "Meowbox"]
  }, {
    category: "Veterinary Services",
    brands: ["Banfield", "Local Vet Clinics"]
  }, {
    category: "Pet Care Services",
    brands: ["Rover", "Wag"]
  }, {
    category: "Pet Food Brands",
    brands: ["The Farmer's Dog", "Blue Buffalo"]
  }, {
    category: "Grooming and Accessories",
    brands: ["PetSmart", "Local Groomers"]
  }]
}, {
  id: "gamers",
  title: "Gamers",
  description: "Level up your rewards on gaming platforms, hardware, and subscriptions.",
  availability: "Year One",
  year: "Year One",
  icon: "🎮",
  merchants: [{
    category: "Gaming Marketplaces",
    brands: ["Steam", "Epic Games Store"]
  }, {
    category: "Console Platforms",
    brands: ["PlayStation Store", "Xbox Live"]
  }, {
    category: "Hardware & Accessories",
    brands: ["Razer", "Logitech"]
  }, {
    category: "Streaming & Content",
    brands: ["Twitch", "YouTube Gaming"]
  }, {
    category: "Retailers & Bundles",
    brands: ["GameStop", "Best Buy"]
  }, {
    category: "Game Subscriptions",
    brands: ["Xbox Game Pass", "PlayStation Plus"]
  }]
}, {
  id: "creatives",
  title: "Creatives",
  description: "Boost rewards on creative software, supplies, and hardware.",
  availability: "Year One",
  year: "Year One",
  icon: "🎨",
  merchants: [{
    category: "Design Software",
    brands: ["Adobe", "Canva"]
  }, {
    category: "Learning Platforms",
    brands: ["Skillshare", "MasterClass"]
  }, {
    category: "Art Supplies",
    brands: ["Blick", "Michaels"]
  }, {
    category: "Creative Hardware",
    brands: ["Wacom", "ReMarkable"]
  }, {
    category: "Productivity Tools",
    brands: ["Notion", "Moleskine"]
  }, {
    category: "Photography & Editing Tools",
    brands: ["Lightroom", "VSCO"]
  }]
}, {
  id: "homeowners",
  title: "Homeowners",
  description: "Earn more on home improvement, furniture, and home services.",
  availability: "Year One",
  year: "Year One",
  icon: "🏠",
  merchants: [{
    category: "Home Improvement Stores",
    brands: ["Home Depot", "Lowe's"]
  }, {
    category: "Smart Home Devices",
    brands: ["Nest", "Ring"]
  }, {
    category: "Furniture Retailers",
    brands: ["Wayfair", "West Elm"]
  }, {
    category: "Home Services Platforms",
    brands: ["TaskRabbit", "Handy"]
  }, {
    category: "Gardening & Outdoors",
    brands: ["Burpee", "Local Nurseries"]
  }, {
    category: "Appliances & Home Essentials",
    brands: ["Best Buy", "Target"]
  }]
}];

const StepOneLifestyleGoal = ({
  selectedGoal,
  onSelectGoal
}: StepOneLifestyleGoalProps) => {
  return (
    <div>
      <h2 className="font-display text-xl md:text-2xl font-bold mb-3">What would like to be rewarded on?</h2>
      <p className="text-base text-slate-600 mb-6">
        What's the primary lifestyle goal you want Ventus to support? Select one category that best represents 
        where you'd like to earn enhanced rewards.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {goalOptions.map(option => (
          <Card 
            key={option.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedGoal === option.id ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
            }`} 
            onClick={() => onSelectGoal(option.id)}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl mb-3">{option.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 mb-3 text-sm">{option.description}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  option.year === "Available First" 
                    ? "bg-green-100 text-green-700" 
                    : option.year === "Available Soon" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-orange-100 text-orange-700"
                }`}>
                  {option.availability}
                </span>
              </div>
              
              {selectedGoal === option.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGoal && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-display text-lg font-bold mb-2">
            {goalOptions.find(g => g.id === selectedGoal)?.title} Selected
          </h3>
          <p className="text-slate-600 text-sm">
            Great choice! In the next step, you'll be able to select specific subcategories within 
            {' '}{goalOptions.find(g => g.id === selectedGoal)?.title} to further personalize your rewards experience.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepOneLifestyleGoal;
