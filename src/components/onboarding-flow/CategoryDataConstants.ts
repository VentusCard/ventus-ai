import { LifestyleGoal } from "@/pages/OnboardingFlow";

export const goalTitles: Record<LifestyleGoal, string> = {
  sports: "Sports Enthusiasts",
  wellness: "Wellness Focused", 
  pets: "Pet Owners",
  gamers: "Gamers",
  creatives: "Creatives",
  homeowners: "Homeowners"
};

// Main category scenarios for the impact card
export const mainCategoryScenarios: Record<LifestyleGoal, Array<{
  subcategory: string;
  card: string;
  multiplier: string;
}>> = {
  sports: [
    { subcategory: "All Sports Equipment & Gear", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Gym & Facilities Fees", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Apparel and Footwear", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Sports Events & Tickets", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Sports Dining & Concessions", card: "Dining Card", multiplier: "4x" },
    { subcategory: "All Training & Coaching", card: "General Cashback Card", multiplier: "2x" }
  ],
  wellness: [
    { subcategory: "All Fitness Gyms and Classes", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Health Supplements", card: "Grocery Card", multiplier: "4x" },
    { subcategory: "All Spa & Wellness Services", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Beauty & Cosmetics", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Wellness Apps & Subscriptions", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Health Retreats & Programs", card: "General Cashback Card", multiplier: "2x" }
  ],
  pets: [
    { subcategory: "All Pet Food & Nutrition", card: "Grocery Card", multiplier: "4x" },
    { subcategory: "All Veterinary Care & Health", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Pet Supplies & Accessories", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Pet Insurance & Services", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Pet Grooming & Care", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Pet Toys & Entertainment", card: "Shopping Cashback Card", multiplier: "3x" }
  ],
  gamers: [
    { subcategory: "All Gaming Hardware & Equipment", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Game Purchases & Downloads", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Gaming Subscriptions & Services", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Gaming Accessories & Peripherals", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Streaming & Entertainment", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Gaming Events & Tournaments", card: "General Cashback Card", multiplier: "2x" }
  ],
  creatives: [
    { subcategory: "All Art Supplies & Materials", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Creative Software & Tools", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Photography & Video Equipment", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Classes & Workshops", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Creative Hardware & Tools", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Art Events & Exhibitions", card: "General Cashback Card", multiplier: "2x" }
  ],
  homeowners: [
    { subcategory: "All Home Improvement & Repair", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Home Appliances & Electronics", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Home Services & Maintenance", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Garden & Landscaping", card: "Shopping Cashback Card", multiplier: "3x" },
    { subcategory: "All Home Security & Safety", card: "General Cashback Card", multiplier: "2x" },
    { subcategory: "All Furniture & Home Decor", card: "Shopping Cashback Card", multiplier: "3x" }
  ]
};

export const categoryData: Record<LifestyleGoal, Record<string, Array<{
  item: string;
  card: string;
  color: string;
}>>> = {
  sports: {
    "Skiing": [{
      item: "Gear & apparel",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Lift tickets & passes",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Rentals",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Lessons/coaching",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Resort food/drinks",
      card: "Dining Card",
      color: "bg-red-500"
    }],
    "Tennis/Racquet Sports": [{
      item: "Racquets, shoes",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Club fees",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Lessons/apps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Tickets",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Services/accessories",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }],
    "Golf": [{
      item: "Clubs & bags",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Green fees",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Coaching/fittings",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Apparel/accessories",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "On-course food",
      card: "Dining Card",
      color: "bg-red-500"
    }],
    "Running/Track": [{
      item: "Shoes, apparel",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Race fees",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Apps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Trackers",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Nutrition",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }],
    "Basketball": [{
      item: "Shoes & gear",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Court fees",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Training/coaching",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Game tickets",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Arena food/drinks",
      card: "Dining Card",
      color: "bg-red-500"
    }],
    "Football": [{
      item: "Equipment & gear",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "League registration",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Training camps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Game tickets",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Stadium concessions",
      card: "Dining Card",
      color: "bg-red-500"
    }],
    "Soccer": [{
      item: "Cleats & uniforms",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Field fees",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Coaching/camps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Match tickets",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Sports bar meals",
      card: "Dining Card",
      color: "bg-red-500"
    }],
    "Team Sports": [{
      item: "Equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "League registration",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Training",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Game tickets",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Post-game food",
      card: "Dining Card",
      color: "bg-red-500"
    }],
    "Outdoor Activities": [{
      item: "Gear & equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Park fees",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Guides/tours",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Trail food",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }],
    "Cycling/Biking": [{
      item: "Bikes & accessories",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Maintenance/repairs",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Cycling apparel",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Bike rentals",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Event registration",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Water Sports": [{
      item: "Swimwear & gear",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Pool memberships",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Swimming lessons",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Water equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Pool/beach snacks",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }],
    "Snow Sports": [{
      item: "Skis/snowboards",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Lift tickets",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Ski lessons",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Winter apparel",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Resort dining",
      card: "Dining Card",
      color: "bg-red-500"
    }],
    "Fitness/Gym": [{
      item: "Gym memberships and fitness gear",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Apparel",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Fitness apps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Protein & supplements",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }],
    "Yoga/Pilates": [{
      item: "Yoga mats & props",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Class packages",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Yoga apparel",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Retreat bookings",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Mindfulness apps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }]
  },
  wellness: {
    "Fitness and Recovery": [{
      item: "Gym memberships",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Fitness equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Workout apparel",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Recovery tools",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Sports massage",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Mental Health and Mindfulness": [{
      item: "Therapy sessions",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Meditation apps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Mindfulness workshops",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Wellness journals",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Mental health retreats",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Nutrition and Supplements": [{
      item: "Vitamins & minerals",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Protein supplements",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Meal replacement shakes",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Nutritionist consultations",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Organic health foods",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }],
    "Beauty and Cosmetics": [{
      item: "Makeup products",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Beauty tools",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Cosmetic treatments",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Beauty subscriptions",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Professional makeup services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Haircare and Skincare": [{
      item: "Skincare products",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Hair care products",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Salon services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Facial treatments",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Hair styling tools",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }],
    "Sleep and Restfulness": [{
      item: "Sleep aids & supplements",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Sleep tracking devices",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Bedding & pillows",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Sleep apps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Sleep clinic services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Women's Health": [{
      item: "Women's vitamins",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Prenatal care",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Feminine care products",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Women's health apps",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "OB/GYN services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Men's Health": [{
      item: "Men's vitamins",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Men's grooming products",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Performance supplements",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Men's health checkups",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Testosterone support",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }],
    "Retreats and Experiences": [{
      item: "Wellness retreats",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Spa weekends",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Yoga retreats",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Meditation workshops",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Health coaching programs",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }]
  },
  pets: {
    "Dog Essentials": [{
      item: "Food & treats",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Leashes & collars",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Dog beds & carriers",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Training gear",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Dog walking services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Cat Essentials": [{
      item: "Cat food & litter",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Litter boxes",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Cat trees & scratching posts",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Cat toys & accessories",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Cat sitting services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Small Pets (Birds, Fish, Reptiles)": [{
      item: "Specialized food",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Habitats & terrariums",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Habitat decorations",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Care equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Exotic vet care",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Pet Food and Nutrition": [{
      item: "Premium pet food",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Pet supplements",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Prescription diets",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Nutritional treats",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Pet nutritionist consultations",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Grooming and Health": [{
      item: "Grooming services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Veterinary care",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Pet medications",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Grooming supplies",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Dental care products",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }],
    "Pet Training and Behavior": [{
      item: "Training classes",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Behavioral consultations",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Training treats",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }, {
      item: "Training equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Puppy kindergarten",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Pet Toys and Entertainment": [{
      item: "Interactive toys",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Puzzle toys",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Pet subscription boxes",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Smart pet tech",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Agility equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }],
    "Pet Insurance and Emergency Care": [{
      item: "Pet insurance premiums",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Emergency vet services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Wellness plans",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Pet first aid supplies",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Specialist veterinary care",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Pet Travel and Boarding": [{
      item: "Pet carriers & travel gear",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Pet boarding services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Pet-friendly hotels",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Pet travel insurance",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Travel comfort items",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }]
  },
  gamers: {
    "PC Gaming": [{
      item: "Games",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Hardware",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Bundles",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Software",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Subscriptions",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Console Gaming": [{
      item: "Consoles/accessories",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Digital store purchases",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Game passes",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "In-game currencies",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Bundle deals",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }],
    "Mobile Gaming": [{
      item: "In-app purchases",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Game passes",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Accessories",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Cloud gaming",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "App Store credits",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Esports and Streaming": [{
      item: "Subscriptions",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Merch",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Event tickets",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Coaching",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Streaming equipment",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }],
    "Gaming Accessories": [{
      item: "Keyboards, mice, headsets",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Chairs, mounts",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "RGB lighting",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Desk setups",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Custom gear",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }]
  },
  creatives: {
    "Photography": [{
      item: "Cameras/lenses",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Software subscriptions",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Storage/media",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Studio gear",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Courses",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Music Production": [{
      item: "Software",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Instruments",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Plugins",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Audio gear",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Licensing",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Art Supplies": [{
      item: "Supplies/tools",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Digital tablets",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Art store purchases",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Subscription boxes",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Printing",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Writing Tools": [{
      item: "Writing software",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Journals/notebooks",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Writing courses",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Publishing tools",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Retreats",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Online Creative Classes": [{
      item: "Subscriptions",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Workshops",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Certifications",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Course bundles",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Platforms",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }]
  },
  homeowners: {
    "Home Improvement": [{
      item: "Tools/hardware",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Contractor services",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Paint/flooring",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "In-store purchases",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Permits/inspections",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }],
    "Smart Home Tech": [{
      item: "Devices",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Subscriptions",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Installations",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Sensors",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Bundles",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }],
    "Furniture and Decor": [{
      item: "Furniture",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Lighting/decor",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Mattresses",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Delivery/assembly",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Local decor",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }],
    "Gardening and Outdoors": [{
      item: "Tools/seeds",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Compost/irrigation",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Outdoor furniture",
      card: "Shopping Cashback Card",
      color: "bg-blue-500"
    }, {
      item: "Landscaping",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Seasonal plants",
      card: "4x with Grocery Card",
      color: "bg-green-500"
    }],
    "Home Services": [{
      item: "Cleaning",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "HVAC maintenance",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Pest control",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Handyman",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }, {
      item: "Warranties",
      card: "General Cashback Card",
      color: "bg-gray-500"
    }]
  }
};
