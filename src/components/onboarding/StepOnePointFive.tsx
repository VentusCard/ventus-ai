import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LifestyleGoal } from "@/pages/OnboardingFlow";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StepOnePointFiveProps {
  selectedGoal: LifestyleGoal;
  selectedSubcategories: string[];
  onSelectSubcategories: (subcategories: string[]) => void;
}

interface SubcategoryData {
  goalId: LifestyleGoal;
  subcategories: string[];
}

interface MerchantDeal {
  subcategory: string;
  merchants: string[];
}

const subcategoriesData: SubcategoryData[] = [
  {
    goalId: "sports",
    subcategories: ["Golf", "Tennis/Racquet Sports", "Running/Track", "Basketball", "Football", "Soccer", "Outdoor"]
  },
  {
    goalId: "wellness",
    subcategories: ["Fitness and Recovery", "Mental Health and Mindfulness", "Nutrition and Supplements", "Beauty and Cosmetics", "Haircare and Skincare", "Sleep and Restfulness", "Women's Health", "Men's Health", "Retreats and Experiences"]
  },
  {
    goalId: "pets",
    subcategories: ["Dog and Cat Essentials", "Cat Essentials", "Grooming and Health", "Pet Food and Nutrition", "Pet Activities and Services"]
  },
  {
    goalId: "gamers",
    subcategories: ["PC Gaming", "Console Gaming", "Mobile Gaming", "Esports and Streaming", "Gaming Accessories"]
  },
  {
    goalId: "creatives",
    subcategories: ["Photography", "Music Production", "Art Supplies", "Writing Tools", "Online Creative Classes"]
  },
  {
    goalId: "homeowners",
    subcategories: ["Home Improvement", "Smart Home Tech", "Furniture and Decor", "Gardening and Outdoors", "Home Services"]
  }
];

// Merchant deals data organized by subcategory
const merchantDealsData: Record<LifestyleGoal, MerchantDeal[]> = {
  "sports": [
    {
      subcategory: "Golf",
      merchants: ["PGA Tour Superstore", "Callaway", "TaylorMade", "Golf Galaxy", "GolfNow"]
    },
    {
      subcategory: "Tennis/Racquet Sports",
      merchants: ["Tennis Warehouse", "Wilson", "Head", "Babolat", "Tennis Channel Plus"]
    },
    {
      subcategory: "Running/Track",
      merchants: ["Brooks", "Hoka", "Strava Premium", "Fleet Feet", "Marathon Training Academy"]
    },
    {
      subcategory: "Basketball",
      merchants: ["NBA Store", "Spalding", "Nike Basketball", "Dick's Sporting Goods", "Basketball Reference"]
    },
    {
      subcategory: "Football",
      merchants: ["NFL Shop", "Wilson Football", "Under Armour Football", "Fanatics", "ESPN+"]
    },
    {
      subcategory: "Soccer",
      merchants: ["Soccer.com", "Adidas Soccer", "Nike Football", "MLS Store", "ESPN FC"]
    },
    {
      subcategory: "Outdoor",
      merchants: ["REI", "The North Face", "Patagonia", "All Trails Premium", "Yeti"]
    }
  ],
  "wellness": [
    {
      subcategory: "Fitness and Recovery",
      merchants: ["ClassPass", "Orangetheory", "Peloton", "Therabody", "Hyperice"]
    },
    {
      subcategory: "Mental Health and Mindfulness",
      merchants: ["BetterHelp", "Talkspace", "Calm", "Headspace", "Ten Percent Happier"]
    },
    {
      subcategory: "Nutrition and Supplements",
      merchants: ["Athletic Greens", "Thorne", "Huel", "Ritual", "Care/of"]
    },
    {
      subcategory: "Beauty and Cosmetics",
      merchants: ["Sephora", "Ulta Beauty", "Glossier", "Fenty Beauty", "Rare Beauty"]
    },
    {
      subcategory: "Haircare and Skincare",
      merchants: ["The Ordinary", "CeraVe", "Olaplex", "Drunk Elephant", "Paula's Choice"]
    },
    {
      subcategory: "Sleep and Restfulness",
      merchants: ["Sleep Number", "Casper", "Purple", "Oura Ring", "Calm Sleep Stories"]
    },
    {
      subcategory: "Women's Health",
      merchants: ["Ritual Women's", "HUM Nutrition", "Lola", "Thinx", "Maven Clinic"]
    },
    {
      subcategory: "Men's Health",
      merchants: ["Roman", "Hims", "Athletic Greens", "Ritual Men's", "Future Fit"]
    },
    {
      subcategory: "Retreats and Experiences",
      merchants: ["Retreat Guru", "BookRetreats", "Yoga Alliance", "Wanderlust", "Mindvalley"]
    }
  ],
  "pets": [
    {
      subcategory: "Dog and Cat Essentials",
      merchants: ["BarkBox", "Chewy", "Kong", "Petco", "Wild One"]
    },
    {
      subcategory: "Cat Essentials",
      merchants: ["Meowbox", "Chewy", "Litter Robot", "PetSafe", "Catit"]
    },
    {
      subcategory: "Grooming and Health",
      merchants: ["PetSmart Grooming", "Banfield Pet Hospital", "Vetster", "Chewy Pharmacy", "Petco Grooming"]
    },
    {
      subcategory: "Pet Food and Nutrition",
      merchants: ["The Farmer's Dog", "Blue Buffalo", "Royal Canin", "Hill's Science Diet", "Purina Pro Plan"]
    },
    {
      subcategory: "Pet Activities and Services",
      merchants: ["Rover", "Wag!", "PupPod", "Outward Hound", "Pet Qwerks"]
    }
  ],
  "gamers": [
    {
      subcategory: "PC Gaming",
      merchants: ["Steam", "Epic Games Store", "Newegg", "Razer", "Corsair"]
    },
    {
      subcategory: "Console Gaming",
      merchants: ["PlayStation Store", "Xbox Live", "Nintendo eShop", "GameStop", "Best Buy"]
    },
    {
      subcategory: "Mobile Gaming",
      merchants: ["Apple App Store", "Google Play Store", "Razer Kishi", "Backbone", "Xbox Game Pass Mobile"]
    },
    {
      subcategory: "Esports and Streaming",
      merchants: ["Twitch", "YouTube Gaming", "Discord Nitro", "OBS Tools", "Elgato"]
    },
    {
      subcategory: "Gaming Accessories",
      merchants: ["Logitech G", "SteelSeries", "HyperX", "Astro", "Scuf Gaming"]
    }
  ],
  "creatives": [
    {
      subcategory: "Photography",
      merchants: ["Adobe Creative Cloud", "B&H Photo", "Moment", "Peak Design", "Adorama"]
    },
    {
      subcategory: "Music Production",
      merchants: ["Splice", "Native Instruments", "Sweetwater", "Ableton", "Guitar Center"]
    },
    {
      subcategory: "Art Supplies",
      merchants: ["Blick Art Materials", "Michaels", "Procreate", "Wacom", "Copic"]
    },
    {
      subcategory: "Writing Tools",
      merchants: ["Scrivener", "Grammarly Premium", "Moleskine", "Rocketbook", "Hemingway Editor"]
    },
    {
      subcategory: "Online Creative Classes",
      merchants: ["Skillshare", "MasterClass", "CreativeLive", "Domestika", "Udemy"]
    }
  ],
  "homeowners": [
    {
      subcategory: "Home Improvement",
      merchants: ["Home Depot", "Lowe's", "Ace Hardware", "Sherwin-Williams", "IKEA"]
    },
    {
      subcategory: "Smart Home Tech",
      merchants: ["Nest", "Ring", "Philips Hue", "SimpliSafe", "Ecobee"]
    },
    {
      subcategory: "Furniture and Decor",
      merchants: ["Wayfair", "West Elm", "Pottery Barn", "Article", "Crate & Barrel"]
    },
    {
      subcategory: "Gardening and Outdoors",
      merchants: ["Burpee", "The Sill", "Terrain", "Gardener's Supply Co.", "Yardzen"]
    },
    {
      subcategory: "Home Services",
      merchants: ["TaskRabbit", "Handy", "Angi", "Thumbtack", "HomeAdvisor"]
    }
  ]
};

// Get the name of the goal based on the goalId
const getGoalName = (goalId: LifestyleGoal): string => {
  const nameMap: Record<LifestyleGoal, string> = {
    "sports": "Sports",
    "wellness": "Wellness",
    "pets": "Pet Owners",
    "gamers": "Gamers",
    "creatives": "Creatives",
    "homeowners": "Homeowners"
  };
  return nameMap[goalId];
};

const StepOnePointFive = ({ 
  selectedGoal, 
  selectedSubcategories,
  onSelectSubcategories
}: StepOnePointFiveProps) => {
  const goalSubcategories = subcategoriesData.find(item => item.goalId === selectedGoal)?.subcategories || [];
  const [openSubcategories, setOpenSubcategories] = useState<string[]>([]);
  const [lastClickedSubcategory, setLastClickedSubcategory] = useState<string | null>(
    selectedSubcategories.length > 0 ? selectedSubcategories[0] : null
  );

  const toggleSubcategory = (subcategory: string) => {
    setLastClickedSubcategory(subcategory);
    
    if (selectedSubcategories.includes(subcategory)) {
      // Remove from selected subcategories
      onSelectSubcategories(selectedSubcategories.filter(s => s !== subcategory));
      
      // Also remove from open subcategories list if it's open
      if (openSubcategories.includes(subcategory)) {
        setOpenSubcategories(openSubcategories.filter(s => s !== subcategory));
      }
    } else {
      // Add to selected subcategories
      onSelectSubcategories([...selectedSubcategories, subcategory]);
      
      // Also auto-open this subcategory to show merchant deals
      if (!openSubcategories.includes(subcategory)) {
        setOpenSubcategories([...openSubcategories, subcategory]);
      }
    }
  };

  const toggleSubcategoryOpen = (subcategory: string) => {
    setLastClickedSubcategory(subcategory);
    if (openSubcategories.includes(subcategory)) {
      setOpenSubcategories(openSubcategories.filter(s => s !== subcategory));
    } else {
      setOpenSubcategories([...openSubcategories, subcategory]);
    }
  };

  // Get the merchant deals for a subcategory
  const getMerchantDealsForSubcategory = (subcategory: string) => {
    return merchantDealsData[selectedGoal]?.find(deal => deal.subcategory === subcategory)?.merchants || [];
  };

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">Select Your Interests</h2>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <div className="h-8 w-8 text-blue-500 flex items-center justify-center font-bold">
              {getGoalName(selectedGoal).charAt(0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-700">Your Selected Lifestyle Goal</div>
            <h3 className="font-display text-xl font-bold">{getGoalName(selectedGoal)}</h3>
          </div>
        </div>
      </div>
      
      <p className="text-lg text-slate-600 mb-8">
        Select the subcategories that reflect your interests. You may choose more than one. 
        Each will unlock a curated set of reward opportunities and merchant deals.
      </p>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{getGoalName(selectedGoal)} Subcategories</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {goalSubcategories.map((subcategory) => (
                <Collapsible 
                  key={subcategory} 
                  open={openSubcategories.includes(subcategory) && selectedSubcategories.includes(subcategory)}
                  className="border border-slate-200 rounded-lg overflow-hidden"
                >
                  <div 
                    className={`flex items-center justify-between p-4 cursor-pointer ${
                      selectedSubcategories.includes(subcategory) ? 'bg-blue-50 border-b border-blue-100' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id={`subcategory-${subcategory}`}
                        checked={selectedSubcategories.includes(subcategory)} 
                        onCheckedChange={() => toggleSubcategory(subcategory)}
                      />
                      <Label 
                        htmlFor={`subcategory-${subcategory}`} 
                        className="text-base font-medium cursor-pointer"
                      >
                        {subcategory}
                      </Label>
                    </div>
                    
                    {selectedSubcategories.includes(subcategory) && (
                      <CollapsibleTrigger
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubcategoryOpen(subcategory);
                        }}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        {openSubcategories.includes(subcategory) ? (
                          <>Hide Deals <ChevronUp className="ml-1 h-4 w-4" /></>
                        ) : (
                          <>Show Deals <ChevronDown className="ml-1 h-4 w-4" /></>
                        )}
                      </CollapsibleTrigger>
                    )}
                  </div>
                  
                  <CollapsibleContent>
                    {selectedSubcategories.includes(subcategory) && (
                      <div className="bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-3 text-blue-700">
                          <ShoppingBag className="h-4 w-4" />
                          <h4 className="font-medium">Example Merchant Deals</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {getMerchantDealsForSubcategory(subcategory).map((merchant, index) => (
                            <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                              <span className="font-medium">{merchant}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {selectedSubcategories.length > 0 && (
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-display text-xl font-bold mb-4">Selected Interests</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSubcategories.map((subcategory) => (
              <span 
                key={subcategory}
                className="bg-white border border-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                {subcategory}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepOnePointFive;
