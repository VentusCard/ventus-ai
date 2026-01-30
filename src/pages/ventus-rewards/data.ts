import { LifestyleOption, LifestyleGoal, ExamplePurchase } from "./types";

export const lifestyleOptions: LifestyleOption[] = [
  {
    id: "sports",
    title: "Sports",
    description: "Golf, Tennis, Running, Skiing & Team Sports",
    year: "Available Now",
    icon: "⚽",
    subcategories: ["Golf", "Tennis", "Running", "Skiing", "Team Sports"],
    merchants: ["Nike", "Adidas", "Dick's Sporting Goods", "REI"]
  },
  {
    id: "wellness",
    title: "Wellness",
    description: "Fitness, Mental Health, Nutrition & Spa",
    year: "Year One",
    icon: "🧘‍♀️",
    subcategories: ["Fitness and Recovery", "Mental Health and Mindfulness", "Nutrition and Supplements", "Beauty and Cosmetics", "Haircare and Skincare", "Sleep and Restfulness", "Women's Health", "Men's Health", "Retreats and Experiences"],
    merchants: ["Peloton", "Calm", "Whole Foods", "SoulCycle"]
  },
  {
    id: "pets",
    title: "Pet Owners",
    description: "Comprehensive pet care from essentials to specialized services",
    year: "Year One",
    icon: "🐕",
    subcategories: ["Dog Essentials", "Cat Essentials", "Small Pets (Birds, Fish, Reptiles)", "Pet Food and Nutrition", "Grooming and Health", "Pet Training and Behavior", "Pet Toys and Entertainment", "Pet Insurance and Emergency Care", "Pet Travel and Boarding"],
    merchants: ["Petco", "Chewy", "VCA Animal Hospitals", "Rover", "PetSmart", "Banfield Pet Hospital"]
  },
  {
    id: "gamers",
    title: "Gamers",
    description: "PC, Console, Mobile & Esports",
    year: "Year Two",
    icon: "🎮",
    subcategories: ["PC", "Console", "Mobile", "Esports", "Accessories"],
    merchants: ["Steam", "PlayStation", "Best Buy", "Razer"]
  },
  {
    id: "creatives",
    title: "Creatives",
    description: "Photography, Music, Art & Writing",
    year: "Year Two",
    icon: "🎨",
    subcategories: ["Photography", "Music Production", "Art Supplies"],
    merchants: ["Adobe", "B&H Photo", "Guitar Center", "Blick Art"]
  },
  {
    id: "homeowners",
    title: "Homeowners",
    description: "Smart Tech, Improvement & Furniture",
    year: "Year Two",
    icon: "🏠",
    subcategories: ["Smart Tech", "Home Improvement", "Furniture", "Services"],
    merchants: ["Home Depot", "Lowe's", "Wayfair", "Best Buy"]
  }
];

export const getExamplePurchases = (goal: LifestyleGoal, subcategory: string): ExamplePurchase[] => {
  const purchaseMap: Record<string, Record<string, ExamplePurchase[]>> = {
    sports: {
      "Golf": [
        { category: "Golf Clubs & Equipment", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Golf Course Fees", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Clubhouse Dining", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Sports Nutrition", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Tennis": [
        { category: "Rackets & Equipment", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Court Rentals", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Post-Game Meals", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Sports Drinks", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Running": [
        { category: "Running Shoes & Gear", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Race Registration", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Recovery Meals", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Energy Supplements", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Skiing": [
        { category: "Ski Equipment", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Lift Tickets", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Lodge Dining", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Trail Snacks", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Team Sports": [
        { category: "Team Gear & Uniforms", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "League Fees", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Team Dinners", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Recovery Foods", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ]
    },
    wellness: {
      "Fitness": [
        { category: "Workout Equipment", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Gym Memberships", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Healthy Dining", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Protein & Supplements", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Mental Health": [
        { category: "Wellness Apps", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Therapy Sessions", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Comfort Food", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Calming Teas", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Nutrition": [
        { category: "Nutrition Trackers", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Dietitian Consultations", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Health-Conscious Restaurants", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Organic Foods", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Spa": [
        { category: "Spa Products", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Spa Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Healthy Meals", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Wellness Supplements", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Meditation": [
        { category: "Meditation Gear", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Meditation Classes", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Mindful Dining", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Herbal Teas", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ]
    },
    pets: {
      "Dog Essentials": [
        { category: "Dog Toys & Accessories", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Dog Walking Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Pet-Friendly Restaurants", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Dog Food & Treats", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Cat Essentials": [
        { category: "Cat Trees & Scratching Posts", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Cat Sitting Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Cat Café Visits", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Cat Food & Litter", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Small Pets (Birds, Fish, Reptiles)": [
        { category: "Habitats & Terrariums", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Exotic Pet Veterinary Care", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Pet Store Workshops", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Specialized Pet Food", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Pet Food and Nutrition": [
        { category: "Pet Food Bowls & Feeders", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Pet Nutrition Consultation", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Pet Bakery Treats", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Premium Pet Food & Supplements", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Grooming and Health": [
        { category: "Grooming Supplies & Tools", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Professional Grooming & Vet Care", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Post-Grooming Celebration", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Pet Shampoos & Medications", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Pet Training and Behavior": [
        { category: "Training Equipment & Clickers", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Training Classes & Consultations", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Training Success Celebrations", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Training Treats & Rewards", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Pet Toys and Entertainment": [
        { category: "Interactive & Puzzle Toys", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Pet Entertainment Subscriptions", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Pet Playdate Gatherings", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Enrichment Treats & Toys", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Pet Insurance and Emergency Care": [
        { category: "Pet Health Monitors & First Aid", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Pet Insurance & Emergency Vet", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Recovery & Comfort Meals", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Emergency Pet Supplies", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Pet Travel and Boarding": [
        { category: "Pet Carriers & Travel Gear", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Pet Boarding & Travel Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Pet-Friendly Dining", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Travel Comfort Supplies", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ]
    },
    gamers: {
      "PC": [
        { category: "PC Components", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Gaming Software", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Gaming Cafés", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Energy Drinks", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Console": [
        { category: "Console Games", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Gaming Subscriptions", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Gaming Lounges", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Gaming Snacks", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Mobile": [
        { category: "Mobile Accessories", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Mobile Game Purchases", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Mobile Gaming Events", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Portable Snacks", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Esports": [
        { category: "Gaming Peripherals", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Tournament Fees", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Competition Dining", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Performance Foods", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Accessories": [
        { category: "Gaming Chairs & Desks", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Setup Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Setup Celebration", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Gaming Fuel", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ]
    },
    creatives: {
      "Photography": [
        { category: "Camera Equipment", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Photo Editing Software", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Client Meetings", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Photography Supplies", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Music Production": [
        { category: "Audio Equipment", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Music Software", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Creative Meetings", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Studio Snacks", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Art Supplies": [
        { category: "Painting & Drawing Supplies", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Art Classes", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Gallery Openings", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Creative Fuel", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ]
    },
    homeowners: {
      "Smart Tech": [
        { category: "Smart Home Devices", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Installation Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Tech Setup Meals", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Tech Cleaning Supplies", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Home Improvement": [
        { category: "Tools & Materials", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Contractor Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Project Meals", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Home Maintenance", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Furniture": [
        { category: "Home Furniture", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Delivery Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Housewarming Dinners", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Home Essentials", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ],
      "Services": [
        { category: "Home Service Tools", cardType: "Shopping Card", cardColor: "bg-blue-500" },
        { category: "Professional Services", cardType: "General Card", cardColor: "bg-gray-500" },
        { category: "Service Provider Meals", cardType: "Dining Card", cardColor: "bg-red-500" },
        { category: "Service Supplies", cardType: "Grocery Card", cardColor: "bg-green-500" }
      ]
    }
  };

  return purchaseMap[goal]?.[subcategory] || [
    { category: "Equipment & Gear", cardType: "Shopping Card", cardColor: "bg-blue-500" },
    { category: "Services & Memberships", cardType: "General Card", cardColor: "bg-gray-500" },
    { category: "Food & Dining", cardType: "Dining Card", cardColor: "bg-red-500" },
    { category: "Nutrition & Supplements", cardType: "Grocery Card", cardColor: "bg-green-500" }
  ];
};

export const cardTypes = [
  { name: "Shopping Cashback Card", color: "bg-blue-500" },
  { name: "General Cashback Card", color: "bg-gray-500" },
  { name: "Dining Card", color: "bg-red-500" },
  { name: "Grocery Card", color: "bg-green-500" }
];
