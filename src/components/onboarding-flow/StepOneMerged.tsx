import { Card, CardContent } from "@/components/ui/card";
import { LifestyleGoal } from "@/pages/OnboardingFlow";
import { Check } from "lucide-react";
import { useRef, useEffect } from "react";
interface StepOneMergedProps {
  selectedGoal: LifestyleGoal | null;
  selectedSubcategories: string[];
  onSelectGoal: (goal: LifestyleGoal) => void;
  onSelectSubcategories: (subcategories: string[]) => void;
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
  description: "For the sports enthusiast: complete rewards on equipment, apparel, fees, tickets, and more.",
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
  description: "For the wellness seeker: holistic rewards on spa , classes, wellness apps, supplements, and more.",
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
  description: "For the pet lover: comprehensive rewards on food, supplies, vet visits, grooming, and more.",
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
  description: "For the gamer: immersive rewards on consoles, accessories, in-game purchases, streaming, and more.",
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
  description: "For the creative: inspiring rewards on tools, software, courses, studio gear, and more.",
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
  description: "For the home owner: rewarding upgrades on furniture, appliances, décor, repairs, and more.",
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
const subcategoryData: Record<LifestyleGoal, string[]> = {
  sports: ["Golf", "Snow Sports", "Tennis/Racquet Sports", "Running/Track", "Basketball", "Football", "Soccer", "Outdoor Activities", "Cycling/Biking", "Water Sports", "Fitness/Gym", "Yoga/Pilates"],
  wellness: ["Fitness and Recovery", "Mental Health and Mindfulness", "Nutrition and Supplements", "Beauty and Cosmetics", "Haircare and Skincare", "Sleep and Restfulness", "Women's Health", "Men's Health", "Retreats and Experiences"],
  pets: ["Dog Essentials", "Cat Essentials", "Small Pets (Birds, Fish, Reptiles)", "Pet Food and Nutrition", "Grooming and Health", "Pet Training and Behavior", "Pet Toys and Entertainment", "Pet Insurance and Emergency Care", "Pet Travel and Boarding"],
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
const StepOneMerged = ({
  selectedGoal,
  selectedSubcategories,
  onSelectGoal,
  onSelectSubcategories
}: StepOneMergedProps) => {
  // Define disabled goal categories
  const disabledGoals: LifestyleGoal[] = ["gamers", "creatives", "homeowners"];
  const subcategorySectionRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef<LifestyleGoal | null>(null);

  // Custom slow scroll function
  const slowScrollTo = (element: HTMLElement) => {
    const startPosition = window.pageYOffset;
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 20; // 20px offset from top
    const distance = targetPosition - startPosition;
    const duration = 1200; // 1.2 seconds for slower scroll
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function for smoother animation
      const ease = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
      
      window.scrollTo(0, startPosition + (distance * ease));
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  // Auto-scroll to subcategory section when goal is selected (only once per goal)
  useEffect(() => {
    if (selectedGoal && !disabledGoals.includes(selectedGoal) && subcategorySectionRef.current) {
      // Only scroll if this is a new goal selection or first time selecting this goal
      if (hasScrolledRef.current !== selectedGoal) {
        hasScrolledRef.current = selectedGoal;
        setTimeout(() => {
          slowScrollTo(subcategorySectionRef.current!);
        }, 150);
      }
    }
  }, [selectedGoal, disabledGoals]);
  const subcategories = selectedGoal && !disabledGoals.includes(selectedGoal) ? subcategoryData[selectedGoal] || [] : [];
  const toggleSubcategory = (subcategory: string) => {
    if (selectedSubcategories.includes(subcategory)) {
      // Remove subcategory if already selected
      const updated = selectedSubcategories.filter(s => s !== subcategory);
      onSelectSubcategories(updated);
    } else {
      // Add subcategory only if under the limit of 3
      if (selectedSubcategories.length < 3) {
        const updated = [...selectedSubcategories, subcategory];
        onSelectSubcategories(updated);
      }
      // If at limit, do nothing (no selection will occur)
    }
  };
  return <div>
      <h2 className="font-display text-lg md:text-2xl font-bold mb-3">What would you like your Ventus Card to reward you on?</h2>
      <p className="text-base text-slate-600 mb-6">Select one category to earn personalized smart rewards from Ventus. </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-stretch">
        {goalOptions.map(option => {
        const isDisabled = disabledGoals.includes(option.id);
        const getCardStyles = () => {
          if (isDisabled) {
            return 'bg-slate-600/30 border border-slate-500/50 opacity-50 cursor-not-allowed grayscale';
          }

          // Dark blue gradients for Sports, Wellness, and Pet Owners
          if (option.id === 'sports') {
            // Available First - Very dark blue gradient
            const baseStyles = 'bg-gradient-to-br from-blue-950/85 to-slate-900/90 border border-blue-700/80';
            const hoverStyles = 'hover:from-blue-900/90 hover:to-slate-800/95 hover:border-blue-600/85';
            const selectedStyles = selectedGoal === option.id ? 'ring-2 ring-blue-400 scale-105 shadow-blue-500/30 shadow-2xl' : 'shadow-lg';
            return `${baseStyles} ${hoverStyles} ${selectedStyles} cursor-pointer hover:scale-110 hover:shadow-2xl`;
          }
          if (option.id === 'wellness' || option.id === 'pets') {
            // Available Soon - Dark blue-tinted gradient (distinct from grey disabled cards)
            const baseStyles = 'bg-gradient-to-br from-blue-950/85 to-blue-900/90 border border-blue-800/70';
            const hoverStyles = 'hover:from-blue-900/90 hover:to-blue-800/95 hover:border-blue-700/80';
            const selectedStyles = selectedGoal === option.id ? 'ring-2 ring-blue-500 scale-105 shadow-blue-400/20 shadow-2xl' : 'shadow-lg';
            return `${baseStyles} ${hoverStyles} ${selectedStyles} cursor-pointer hover:scale-110 hover:shadow-2xl`;
          }

          // Default styling for other categories
          const baseStyles = 'bg-slate-600/30 border border-slate-500/50';
          const hoverStyles = 'hover:bg-slate-500/40 hover:brightness-110';
          const selectedStyles = selectedGoal === option.id ? 'ring-2 ring-blue-400 bg-slate-500/50 scale-105 shadow-blue-500/20 shadow-2xl' : 'shadow-lg';
          return `${baseStyles} ${hoverStyles} ${selectedStyles} cursor-pointer hover:scale-110 hover:shadow-2xl`;
        };
        return <Card key={option.id} className={`backdrop-blur-sm transition-all duration-300 min-h-[280px] h-full ${getCardStyles()}`} onClick={() => !isDisabled && onSelectGoal(option.id)}>
              <CardContent className={`p-5 h-full flex flex-col bg-gradient-to-br rounded-lg ${
                option.id === 'sports' 
                  ? 'from-blue-500/60 to-blue-600/60' 
                  : (option.id === 'wellness' || option.id === 'pets')
                  ? 'from-slate-700/40 to-slate-800/30'
                  : 'from-blue-500/30 to-blue-600/20'
              }`}>
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-4xl md:text-5xl mb-4 mt-2 transform transition-transform duration-300" style={{textShadow: 'none', WebkitTextStroke: '0', WebkitFontSmoothing: 'antialiased', fontVariantEmoji: 'normal'}}>{option.icon}</div>
                     <h3 className={`font-display text-base md:text-xl font-bold mb-3 ${isDisabled ? 'text-slate-500' : 'text-white'}`}>
                        {option.title}
                      </h3>
                      <p className={`mb-4 text-xs md:text-base ${isDisabled ? 'text-slate-600' : 'text-white/70'}`}>
                        {option.description}
                      </p>
                  </div>
                  <div className="mt-auto">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isDisabled ? "bg-slate-700 text-slate-500" : option.year === "Available First" ? "bg-green-500/20 text-green-400" : option.year === "Available Soon" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}`}>
                      {isDisabled ? "Coming Later" : option.availability}
                    </span>
                  </div>
                </div>
                
                {selectedGoal === option.id && !isDisabled && <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-400/50">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>}
              </CardContent>
            </Card>;
      })}
      </div>

      {selectedGoal && !disabledGoals.includes(selectedGoal) && <>
          <div ref={subcategorySectionRef} className="touch-manipulation" style={{
        touchAction: 'manipulation',
        pointerEvents: 'auto',
        WebkitTapHighlightColor: 'transparent'
      }}>
            <h3 className="font-display text-lg md:text-2xl font-bold mb-4 text-white">
              Pick up to 3 areas you're interested in receiving deals and offers.
            </h3>
            <p className="text-base md:text-xl text-white/80 mb-6">
              No pressure, you can add more when Ventus launches!
            </p>

            {selectedSubcategories.length >= 3}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {subcategories.map(subcategory => <button key={subcategory} onClick={() => toggleSubcategory(subcategory)} className={`p-3 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 touch-manipulation min-h-[48px] ${selectedSubcategories.includes(subcategory) ? 'border-blue-400 bg-gradient-to-br from-blue-500/60 to-blue-600/60 text-white shadow-lg ring-2 ring-blue-500/40' : 'border-slate-500/50 bg-gradient-to-br from-slate-600/20 to-slate-700/20 text-slate-300 hover:border-slate-400 hover:from-slate-500/30 hover:to-slate-600/30 shadow-md'}`} style={{
            touchAction: 'manipulation',
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent'
          }}>
                <div className="font-medium text-sm md:text-base">{subcategory}</div>
              </button>)}
            </div>

            {selectedSubcategories.length > 0 && <div className="text-center mt-8">
                <h4 className="font-display text-lg md:text-2xl font-bold text-white mb-2">
                  Ready to See Your Smart Rewards Profile?
                </h4>
                
              </div>}
          </div>
        </>}
    </div>;
};
export default StepOneMerged;