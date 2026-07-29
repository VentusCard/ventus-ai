// Emoji mappings for subcategories and deal categories

export const getSubcategoryIcon = (subcategory: string): string => {
  const emojiMap: Record<string, string> = {
    // General
    General: "🌐",
    All: "🏆",

    // Sports
    Golf: "⛳",
    "Snow Sports": "⛷️",
    "Tennis/Racquet Sports": "🎾",
    Pickleball: "🏓",
    "Running/Track": "🏃",
    Basketball: "🏀",
    Football: "🏈",
    Soccer: "⚽",
    "Baseball/Softball": "⚾",
    Hockey: "🏒",
    Volleyball: "🏐",
    "Martial Arts": "🥋",
    "Outdoor Activities": "🏕️",
    "Cycling/Biking": "🚴",
    "Water Sports": "🏄",
    "Fitness/Gym": "💪",
    "Yoga/Pilates": "🧘",

    // Food & Dining
    "Coffee & Cafes": "☕",
    Coffee: "☕",
    Cafes: "☕",
    "Fast Casual": "🌯",
    "Casual Dining": "🍽️",
    "Fine Dining": "🥂",
    "Fast Food": "🍔",
    "Sports Bar": "🍺",
    Bars: "🍺",
    Bakery: "🥐",
    Desserts: "🍰",
    Delivery: "🚗",
    "Food Delivery": "🚗",
    Restaurants: "🍽️",
    Dining: "🍕",

    // Grocery & Essentials
    Grocery: "🛒",
    Groceries: "🛒",
    Supermarket: "🛒",
    "Gas & Fuel": "⛽",
    Gas: "⛽",
    Fuel: "⛽",
    Pharmacy: "💊",
    "Health & Pharmacy": "💊",

    // Shopping & Retail
    Shopping: "🛍️",
    "Online Shopping": "🛍️",
    Electronics: "📱",
    "Clothing & Apparel": "👕",
    Clothing: "👕",
    Apparel: "👕",
    "Home Improvement": "🏠",
    "Home & Garden": "🏠",
    Furniture: "🛋️",

    // Travel & Transportation
    Travel: "✈️",
    Flights: "✈️",
    Airlines: "✈️",
    Hotels: "🏨",
    Lodging: "🏨",
    "Hotels & Lodging": "🏨",
    Rideshare: "🚕",
    "Ride Share": "🚕",
    "Car Rental": "🚗",
    "Public Transit": "🚇",
    Parking: "🅿️",

    // Entertainment & Culture
    Entertainment: "🎭",
    Streaming: "📺",
    Music: "🎵",
    "Movies & Cinema": "🎬",
    Gaming: "🎮",
    Books: "📚",
    "Arts & Culture": "🎨",
    "Concerts & Events": "🎤",
    "Theme Parks": "🎢",

    // Health & Wellness
    "Gym & Fitness": "💪",
    Wellness: "🧘",
    Spa: "💆",
    "Mental Health": "🧠",

    // Beauty & Style
    Beauty: "💄",
    Salon: "💇",
    "Beauty & Salon": "💇",
    Cosmetics: "💄",

    // Pets
    Pet: "🐾",
    Pets: "🐾",
    "Pet Care": "🐾",
    Veterinary: "🐾",

    // Utilities & Services
    Utilities: "💡",
    Insurance: "🛡️",
    Subscriptions: "📦",
    "Digital Services": "💻",

    // Family & Education
    Education: "🎓",
    Childcare: "👶",
    "Kids Activities": "🧒",
  };

  return emojiMap[subcategory] || "🏷️";
};

export const getDealCategoryIcon = (dealCategory: string): string => {
  const emojiMap: Record<string, string> = {
    // All
    All: "🎯",
    
    // Apparel
    Apparel: "👕",

    // Equipment/Gear
    Equipment: "⚙️",
    Gear: "🎒",
    "Gear & Tech": "⚙️",
    "Camping Gear": "⛺",
    "Hiking Gear": "🎒",

    // Accessories/Essentials
    Accessories: "🎒",
    Essentials: "🎒",

    // Sport-specific equipment
    Clubs: "🏌️",
    Racquets: "🏸",
    Paddles: "🏓",

    // Balls
    Balls: "⚽",
    "Golf Balls": "⛳",
    "Tennis Balls": "🎾",
    "Pickle Balls": "🥒",

    // Nutrition/Supplements
    Consumables: "🍎",
    "Sports Nutrition": "🍎",
    "Supplements & Care": "💊",

    // Maintenance
    Maintenance: "🔧",

    // Courses/Courts/Fields
    Courses: "🏞️",
    Courts: "🏟️",
    Fields: "🏟️",

    // Races
    Races: "🏁",

    // Parks
    Parks: "🏕️",
    "Parks & Adventures": "🏕️",

    // Gyms
    Gyms: "🏋️",
    "Gyms & Events": "🥊",

    // Rinks
    "Rinks & Lessons": "⛸️",

    // Leagues
    "Leagues & Facilities": "🏟️",
    "Leagues & Camps": "🏕️",

    // Studios
    Studios: "🧘‍♀️",

    // Activities
    Activities: "🌊",

    // Local
    Local: "📍",

    // Tickets/Events
    Tickets: "🎟️",
    "Events & Merch": "🎫",

    // Travel
    Travel: "✈️",
  };

  return emojiMap[dealCategory] || "🎁";
};
