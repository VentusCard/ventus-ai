// Emoji mappings for subcategories and deal categories

export const getSubcategoryIcon = (subcategory: string): string => {
  const emojiMap: Record<string, string> = {
    General: "🌐",
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
    All: "🏆",
  };

  return emojiMap[subcategory] || "🏆";
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
