export interface AvailableDeal {
  id: string;
  merchantName: string;
  category: string;
  subcategory: string;
  dealTitle: string;
  dealDescription: string;
  rewardType: 'cashback' | 'points' | 'discount';
  rewardValue: string;
  minPurchase?: number;
  validFrom: string;
  validUntil: string;
  popularity: 'trending' | 'popular' | 'new' | 'featured';
  activationCount: number;
  averageRedemption: number;
}

export const DEAL_CATEGORIES = {
  'Food & Dining': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🍕' },
  'Travel & Exploration': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✈️' },
  'Style & Beauty': { color: 'bg-pink-100 text-pink-700 border-pink-200', icon: '👗' },
  'Home & Living': { color: 'bg-teal-100 text-teal-700 border-teal-200', icon: '🏠' },
  'Entertainment & Culture': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🎬' },
  'Health & Wellness': { color: 'bg-green-100 text-green-700 border-green-200', icon: '💪' },
  'Sports & Active Living': { color: 'bg-red-100 text-red-700 border-red-200', icon: '⚽' },
  'Technology & Digital Life': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '💻' },
  'Family & Community': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '👨‍👩‍👧' },
  'Pets': { color: 'bg-lime-100 text-lime-700 border-lime-200', icon: '🐕' },
  'Financial & Aspirational': { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '💰' },
  'Automotive': { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '🚗' },
} as const;

export type DealCategory = keyof typeof DEAL_CATEGORIES;

const merchantsByCategory: Record<DealCategory, { name: string; subcategory: string; deals: { title: string; description: string; rewardType: 'cashback' | 'points' | 'discount'; rewardValue: string; minPurchase?: number }[] }[]> = {
  'Food & Dining': [
    { name: 'Starbucks', subcategory: 'Coffee & Cafes', deals: [{ title: '5x Points on All Drinks', description: 'Earn bonus points on every coffee, tea, or refresher purchase', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Chipotle', subcategory: 'Fast Casual', deals: [{ title: '10% Cashback', description: 'Get cashback on all bowl, burrito, and taco orders', rewardType: 'cashback', rewardValue: '10% Cashback' }] },
    { name: 'DoorDash', subcategory: 'Delivery', deals: [{ title: '$5 Off $25+ Orders', description: 'Save on your next food delivery order', rewardType: 'discount', rewardValue: '$5 Off', minPurchase: 25 }] },
    { name: 'Uber Eats', subcategory: 'Delivery', deals: [{ title: '8% Cashback', description: 'Earn cashback on all delivery and pickup orders', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: "McDonald's", subcategory: 'Fast Food', deals: [{ title: '3x Points on Mobile Orders', description: 'Order through the app and earn triple points', rewardType: 'points', rewardValue: '3x Points' }] },
    { name: 'Panera Bread', subcategory: 'Fast Casual', deals: [{ title: '7% Cashback', description: 'Cashback on all bakery, soup, and sandwich orders', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'Chick-fil-A', subcategory: 'Fast Food', deals: [{ title: '4x Points', description: 'Earn bonus points on chicken sandwiches and meals', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: "Dunkin'", subcategory: 'Coffee & Cafes', deals: [{ title: '6% Cashback on Coffee', description: 'Get rewarded for your daily coffee run', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Subway', subcategory: 'Fast Food', deals: [{ title: '$3 Off $15+ Orders', description: 'Save on your sub and meal combo', rewardType: 'discount', rewardValue: '$3 Off', minPurchase: 15 }] },
    { name: 'Grubhub', subcategory: 'Delivery', deals: [{ title: '5% Cashback', description: 'Earn on every delivery order', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Olive Garden', subcategory: 'Casual Dining', deals: [{ title: '8% Cashback', description: 'Enjoy Italian favorites and earn rewards', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Applebees', subcategory: 'Casual Dining', deals: [{ title: '5x Points', description: 'Earn extra points on all menu items', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Buffalo Wild Wings', subcategory: 'Sports Bar', deals: [{ title: '10% Cashback on Wings', description: 'Game day just got more rewarding', rewardType: 'cashback', rewardValue: '10% Cashback' }] },
    { name: 'Taco Bell', subcategory: 'Fast Food', deals: [{ title: '4x Points', description: 'Earn bonus points on all orders', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: "Wendy's", subcategory: 'Fast Food', deals: [{ title: '5% Cashback', description: 'Fresh beef burgers with cashback rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Dominos', subcategory: 'Pizza', deals: [{ title: '$4 Off $20+ Orders', description: 'Pizza night savings', rewardType: 'discount', rewardValue: '$4 Off', minPurchase: 20 }] },
    { name: 'Pizza Hut', subcategory: 'Pizza', deals: [{ title: '6x Points', description: 'Earn extra on pizza and wings', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'Sweetgreen', subcategory: 'Healthy Fast Casual', deals: [{ title: '8% Cashback', description: 'Earn rewards on healthy bowls and salads', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Shake Shack', subcategory: 'Fast Casual', deals: [{ title: '5x Points', description: 'Burgers and shakes with bonus points', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Noodles & Company', subcategory: 'Fast Casual', deals: [{ title: '7% Cashback', description: 'World flavors with cashback rewards', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'Five Guys', subcategory: 'Fast Casual', deals: [{ title: '4x Points', description: 'Earn on burgers, fries, and shakes', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Instacart', subcategory: 'Grocery Delivery', deals: [{ title: '3% Cashback', description: 'Grocery delivery rewards', rewardType: 'cashback', rewardValue: '3% Cashback' }] },
    { name: 'Whole Foods', subcategory: 'Grocery', deals: [{ title: '5% Cashback', description: 'Premium groceries with rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Trader Joes', subcategory: 'Grocery', deals: [{ title: '4x Points', description: 'Unique finds with bonus points', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'HelloFresh', subcategory: 'Meal Kits', deals: [{ title: '$10 Off First 3 Boxes', description: 'Start cooking with savings', rewardType: 'discount', rewardValue: '$10 Off' }] },
  ],
  'Travel & Exploration': [
    { name: 'Delta Airlines', subcategory: 'Airlines', deals: [{ title: '5x Miles on Flights', description: 'Earn bonus miles on every Delta purchase', rewardType: 'points', rewardValue: '5x Miles' }] },
    { name: 'United Airlines', subcategory: 'Airlines', deals: [{ title: '4x Miles', description: 'Stack miles on all United flights', rewardType: 'points', rewardValue: '4x Miles' }] },
    { name: 'American Airlines', subcategory: 'Airlines', deals: [{ title: '5x Miles', description: 'Fly American and earn more miles', rewardType: 'points', rewardValue: '5x Miles' }] },
    { name: 'Southwest Airlines', subcategory: 'Airlines', deals: [{ title: '3x Points', description: 'Low fares with bonus points', rewardType: 'points', rewardValue: '3x Points' }] },
    { name: 'Marriott', subcategory: 'Hotels', deals: [{ title: '6x Points on Stays', description: 'Premium hotel stays with extra rewards', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'Hilton', subcategory: 'Hotels', deals: [{ title: '5x Points', description: 'Earn Hilton Honors points faster', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Hyatt', subcategory: 'Hotels', deals: [{ title: '4x Points', description: 'Luxury stays with bonus rewards', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Airbnb', subcategory: 'Vacation Rentals', deals: [{ title: '8% Cashback', description: 'Unique stays with cashback rewards', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'VRBO', subcategory: 'Vacation Rentals', deals: [{ title: '6% Cashback', description: 'Family vacation rentals with rewards', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Hertz', subcategory: 'Car Rental', deals: [{ title: '10% Off + 3x Points', description: 'Rent with savings and rewards', rewardType: 'discount', rewardValue: '10% Off' }] },
    { name: 'Enterprise', subcategory: 'Car Rental', deals: [{ title: '5% Cashback', description: 'Reliable rentals with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Expedia', subcategory: 'Travel Booking', deals: [{ title: '5x Points on Hotels', description: 'Book travel and earn rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Booking.com', subcategory: 'Travel Booking', deals: [{ title: '7% Cashback', description: 'Worldwide hotels with cashback', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'Kayak', subcategory: 'Travel Booking', deals: [{ title: '4% Cashback', description: 'Find deals and earn rewards', rewardType: 'cashback', rewardValue: '4% Cashback' }] },
    { name: 'Uber', subcategory: 'Rideshare', deals: [{ title: '4x Points on Rides', description: 'Earn points on every Uber ride', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Lyft', subcategory: 'Rideshare', deals: [{ title: '5% Cashback', description: 'Ride rewards on every trip', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Carnival Cruise', subcategory: 'Cruises', deals: [{ title: '$100 Onboard Credit', description: 'Cruise with extra spending money', rewardType: 'discount', rewardValue: '$100 Credit' }] },
    { name: 'Royal Caribbean', subcategory: 'Cruises', deals: [{ title: '5x Points', description: 'Sail and earn bonus rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'TSA PreCheck', subcategory: 'Travel Services', deals: [{ title: '$20 Off Application', description: 'Skip the lines with savings', rewardType: 'discount', rewardValue: '$20 Off' }] },
    { name: 'Global Entry', subcategory: 'Travel Services', deals: [{ title: 'Fee Credit', description: 'Get your application fee credited', rewardType: 'discount', rewardValue: 'Full Credit' }] },
  ],
  'Style & Beauty': [
    { name: 'Sephora', subcategory: 'Beauty', deals: [{ title: '8% Cashback', description: 'Beauty favorites with rewards', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'ULTA', subcategory: 'Beauty', deals: [{ title: '6x Points', description: 'Earn on makeup, skincare, and more', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'Nordstrom', subcategory: 'Department Store', deals: [{ title: '5x Points', description: 'Luxury fashion with bonus rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Nike', subcategory: 'Athletic Wear', deals: [{ title: '7% Cashback', description: 'Just do it and earn cashback', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'Lululemon', subcategory: 'Athletic Wear', deals: [{ title: '5% Cashback', description: 'Premium activewear with rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'H&M', subcategory: 'Fast Fashion', deals: [{ title: '10% Off + 3x Points', description: 'Affordable fashion with savings', rewardType: 'discount', rewardValue: '10% Off' }] },
    { name: 'Zara', subcategory: 'Fast Fashion', deals: [{ title: '4x Points', description: 'Trend-forward styles with rewards', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Foot Locker', subcategory: 'Footwear', deals: [{ title: '8% Cashback', description: 'Sneakers and shoes with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Adidas', subcategory: 'Athletic Wear', deals: [{ title: '6% Cashback', description: 'Performance gear with rewards', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Gap', subcategory: 'Casual Wear', deals: [{ title: '5x Points', description: 'Classic American style with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Old Navy', subcategory: 'Family Fashion', deals: [{ title: '$10 Off $50+', description: 'Family fashion savings', rewardType: 'discount', rewardValue: '$10 Off', minPurchase: 50 }] },
    { name: 'Macys', subcategory: 'Department Store', deals: [{ title: '4x Points', description: 'Department store shopping with rewards', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Bloomingdales', subcategory: 'Department Store', deals: [{ title: '5% Cashback', description: 'Designer brands with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Anthropologie', subcategory: 'Lifestyle', deals: [{ title: '6x Points', description: 'Unique finds with bonus points', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'Urban Outfitters', subcategory: 'Lifestyle', deals: [{ title: '5% Cashback', description: 'Trendy styles with rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Glossier', subcategory: 'Beauty', deals: [{ title: '8% Cashback', description: 'Skincare and makeup rewards', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Warby Parker', subcategory: 'Eyewear', deals: [{ title: '$25 Off Glasses', description: 'Prescription eyewear savings', rewardType: 'discount', rewardValue: '$25 Off' }] },
    { name: 'Ray-Ban', subcategory: 'Eyewear', deals: [{ title: '10% Cashback', description: 'Iconic sunglasses with rewards', rewardType: 'cashback', rewardValue: '10% Cashback' }] },
  ],
  'Home & Living': [
    { name: 'Home Depot', subcategory: 'Home Improvement', deals: [{ title: '5% Cashback', description: 'DIY projects with cashback rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Lowes', subcategory: 'Home Improvement', deals: [{ title: '4x Points', description: 'Home improvement with bonus points', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Wayfair', subcategory: 'Furniture', deals: [{ title: '8% Cashback', description: 'Furniture and decor with rewards', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'IKEA', subcategory: 'Furniture', deals: [{ title: '5% Cashback', description: 'Swedish design with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Bed Bath & Beyond', subcategory: 'Home Goods', deals: [{ title: '6x Points', description: 'Home essentials with rewards', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'Williams-Sonoma', subcategory: 'Kitchen', deals: [{ title: '7% Cashback', description: 'Premium cookware with cashback', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'Crate & Barrel', subcategory: 'Furniture', deals: [{ title: '5x Points', description: 'Modern home with bonus rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'West Elm', subcategory: 'Furniture', deals: [{ title: '6% Cashback', description: 'Contemporary style with cashback', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Pottery Barn', subcategory: 'Furniture', deals: [{ title: '5% Cashback', description: 'Classic home furnishings rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Restoration Hardware', subcategory: 'Luxury Home', deals: [{ title: '4x Points', description: 'Luxury furnishings with points', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Overstock', subcategory: 'Home Goods', deals: [{ title: '7% Cashback', description: 'Deals on home with cashback', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'Ace Hardware', subcategory: 'Hardware', deals: [{ title: '5x Points', description: 'Local hardware with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Sherwin-Williams', subcategory: 'Paint', deals: [{ title: '10% Off + 3x Points', description: 'Paint projects with savings', rewardType: 'discount', rewardValue: '10% Off' }] },
    { name: 'Casper', subcategory: 'Mattress', deals: [{ title: '$100 Off Mattresses', description: 'Better sleep with savings', rewardType: 'discount', rewardValue: '$100 Off' }] },
    { name: 'Purple', subcategory: 'Mattress', deals: [{ title: '5% Cashback', description: 'Comfort technology with rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Dyson', subcategory: 'Home Appliances', deals: [{ title: '6% Cashback', description: 'Premium appliances with cashback', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
  ],
  'Entertainment & Culture': [
    { name: 'Spotify', subcategory: 'Music Streaming', deals: [{ title: '3 Months Free Premium', description: 'Stream unlimited music free', rewardType: 'discount', rewardValue: '3 Mo Free' }] },
    { name: 'Netflix', subcategory: 'Video Streaming', deals: [{ title: '$15 Statement Credit', description: 'Monthly streaming credit', rewardType: 'discount', rewardValue: '$15 Credit' }] },
    { name: 'Disney+', subcategory: 'Video Streaming', deals: [{ title: '5x Points', description: 'Disney magic with bonus points', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Hulu', subcategory: 'Video Streaming', deals: [{ title: '$10 Statement Credit', description: 'Stream with savings', rewardType: 'discount', rewardValue: '$10 Credit' }] },
    { name: 'HBO Max', subcategory: 'Video Streaming', deals: [{ title: '6x Points', description: 'Premium content with rewards', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'AMC Theatres', subcategory: 'Movie Theaters', deals: [{ title: '8% Cashback', description: 'Movie nights with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Regal Cinemas', subcategory: 'Movie Theaters', deals: [{ title: '5x Points', description: 'Cinema rewards on every visit', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Ticketmaster', subcategory: 'Events', deals: [{ title: '6% Cashback', description: 'Live events with cashback rewards', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'StubHub', subcategory: 'Events', deals: [{ title: '5% Cashback', description: 'Get tickets and earn rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Audible', subcategory: 'Audiobooks', deals: [{ title: '4x Points', description: 'Listen and earn rewards', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Apple Music', subcategory: 'Music Streaming', deals: [{ title: '$10 Credit', description: 'Music streaming with credits', rewardType: 'discount', rewardValue: '$10 Credit' }] },
    { name: 'YouTube Premium', subcategory: 'Video Streaming', deals: [{ title: '5x Points', description: 'Ad-free viewing with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Barnes & Noble', subcategory: 'Books', deals: [{ title: '6% Cashback', description: 'Books and gifts with cashback', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'GameStop', subcategory: 'Gaming', deals: [{ title: '8x Points', description: 'Gaming gear with bonus points', rewardType: 'points', rewardValue: '8x Points' }] },
    { name: 'PlayStation Store', subcategory: 'Gaming', deals: [{ title: '5% Cashback', description: 'Digital games with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Xbox Store', subcategory: 'Gaming', deals: [{ title: '5% Cashback', description: 'Games and content with rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
  ],
  'Health & Wellness': [
    { name: 'Equinox', subcategory: 'Gym', deals: [{ title: '$50 Off Membership', description: 'Premium fitness with savings', rewardType: 'discount', rewardValue: '$50 Off' }] },
    { name: 'Planet Fitness', subcategory: 'Gym', deals: [{ title: '3x Points', description: 'Affordable fitness with rewards', rewardType: 'points', rewardValue: '3x Points' }] },
    { name: 'CVS', subcategory: 'Pharmacy', deals: [{ title: '5% Cashback', description: 'Pharmacy and health rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Walgreens', subcategory: 'Pharmacy', deals: [{ title: '4x Points', description: 'Health essentials with points', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Peloton', subcategory: 'Fitness Equipment', deals: [{ title: '8% Cashback', description: 'Connected fitness with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'GNC', subcategory: 'Supplements', deals: [{ title: '6x Points', description: 'Supplements and vitamins rewards', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'Vitamin Shoppe', subcategory: 'Supplements', deals: [{ title: '7% Cashback', description: 'Health supplements with cashback', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'Orangetheory', subcategory: 'Fitness Classes', deals: [{ title: 'Free First Class', description: 'Try a class on us', rewardType: 'discount', rewardValue: 'Free Class' }] },
    { name: 'SoulCycle', subcategory: 'Fitness Classes', deals: [{ title: '5x Points', description: 'Spin classes with bonus points', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Calm', subcategory: 'Mental Wellness', deals: [{ title: '50% Off Annual', description: 'Meditation app savings', rewardType: 'discount', rewardValue: '50% Off' }] },
    { name: 'Headspace', subcategory: 'Mental Wellness', deals: [{ title: '4x Points', description: 'Mindfulness with rewards', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Massage Envy', subcategory: 'Spa', deals: [{ title: '10% Cashback', description: 'Spa services with cashback', rewardType: 'cashback', rewardValue: '10% Cashback' }] },
    { name: 'Rite Aid', subcategory: 'Pharmacy', deals: [{ title: '3x Points', description: 'Pharmacy rewards on purchases', rewardType: 'points', rewardValue: '3x Points' }] },
    { name: '1-800 Contacts', subcategory: 'Vision', deals: [{ title: '$20 Off First Order', description: 'Contact lenses with savings', rewardType: 'discount', rewardValue: '$20 Off' }] },
    { name: 'Noom', subcategory: 'Weight Loss', deals: [{ title: '5% Cashback', description: 'Weight loss program rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'ClassPass', subcategory: 'Fitness Classes', deals: [{ title: '6% Cashback', description: 'Fitness variety with rewards', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Fitbit', subcategory: 'Wearables', deals: [{ title: '8% Cashback', description: 'Fitness trackers with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Whoop', subcategory: 'Wearables', deals: [{ title: 'Free Month', description: 'Try Whoop free for 30 days', rewardType: 'discount', rewardValue: '1 Mo Free' }] },
  ],
  'Sports & Active Living': [
    { name: "Dick's Sporting Goods", subcategory: 'Sporting Goods', deals: [{ title: '6% Cashback', description: 'Sports gear with cashback rewards', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'REI', subcategory: 'Outdoor Gear', deals: [{ title: '5x Points', description: 'Outdoor adventures with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Golf Galaxy', subcategory: 'Golf', deals: [{ title: '8% Cashback', description: 'Golf equipment with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Callaway Golf', subcategory: 'Golf', deals: [{ title: '10% Off Clubs', description: 'Premium golf clubs with savings', rewardType: 'discount', rewardValue: '10% Off' }] },
    { name: 'TaylorMade', subcategory: 'Golf', deals: [{ title: '5x Points', description: 'Golf gear with bonus points', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Academy Sports', subcategory: 'Sporting Goods', deals: [{ title: '5% Cashback', description: 'Sports and outdoors rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Fanatics', subcategory: 'Sports Apparel', deals: [{ title: '7% Cashback', description: 'Team gear with cashback', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'NFL Shop', subcategory: 'Sports Apparel', deals: [{ title: '6x Points', description: 'Official NFL gear with rewards', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'NBA Store', subcategory: 'Sports Apparel', deals: [{ title: '5% Cashback', description: 'Basketball gear with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'MLB Shop', subcategory: 'Sports Apparel', deals: [{ title: '5x Points', description: 'Baseball merchandise rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Patagonia', subcategory: 'Outdoor Apparel', deals: [{ title: '5% Cashback', description: 'Sustainable outdoor gear rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'The North Face', subcategory: 'Outdoor Apparel', deals: [{ title: '6x Points', description: 'Outdoor exploration rewards', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'Columbia Sportswear', subcategory: 'Outdoor Apparel', deals: [{ title: '5% Cashback', description: 'Active lifestyle with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Under Armour', subcategory: 'Athletic Wear', deals: [{ title: '7% Cashback', description: 'Performance gear rewards', rewardType: 'cashback', rewardValue: '7% Cashback' }] },
    { name: 'Yeti', subcategory: 'Outdoor Gear', deals: [{ title: '5x Points', description: 'Premium coolers and drinkware', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Backcountry', subcategory: 'Outdoor Gear', deals: [{ title: '8% Cashback', description: 'Outdoor gear with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Scheels', subcategory: 'Sporting Goods', deals: [{ title: '4x Points', description: 'All sports with bonus points', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Bass Pro Shops', subcategory: 'Outdoor Gear', deals: [{ title: '5% Cashback', description: 'Hunting and fishing rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
  ],
  'Technology & Digital Life': [
    { name: 'Apple', subcategory: 'Electronics', deals: [{ title: '3% Daily Cash', description: 'Apple products with daily cash', rewardType: 'cashback', rewardValue: '3% Cashback' }] },
    { name: 'Best Buy', subcategory: 'Electronics', deals: [{ title: '5x Points', description: 'Tech and appliances with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Amazon', subcategory: 'E-commerce', deals: [{ title: '5% Cashback', description: 'Everything store with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Samsung', subcategory: 'Electronics', deals: [{ title: '6% Cashback', description: 'Samsung devices with rewards', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Microsoft', subcategory: 'Software', deals: [{ title: '4x Points', description: 'Microsoft products with points', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Dell', subcategory: 'Computers', deals: [{ title: '5% Cashback', description: 'PCs and monitors with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'HP', subcategory: 'Computers', deals: [{ title: '4x Points', description: 'Laptops and printers with rewards', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Bose', subcategory: 'Audio', deals: [{ title: '6% Cashback', description: 'Premium audio with cashback', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Sonos', subcategory: 'Audio', deals: [{ title: '5x Points', description: 'Smart speakers with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Sony', subcategory: 'Electronics', deals: [{ title: '5% Cashback', description: 'Electronics and entertainment', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Logitech', subcategory: 'Accessories', deals: [{ title: '6x Points', description: 'Peripherals with bonus points', rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'B&H Photo', subcategory: 'Photography', deals: [{ title: '4% Cashback', description: 'Photo and video gear rewards', rewardType: 'cashback', rewardValue: '4% Cashback' }] },
    { name: 'Newegg', subcategory: 'Computer Parts', deals: [{ title: '5x Points', description: 'PC components with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Adobe', subcategory: 'Software', deals: [{ title: '20% Off Creative Cloud', description: 'Creative software savings', rewardType: 'discount', rewardValue: '20% Off' }] },
    { name: 'Dropbox', subcategory: 'Cloud Storage', deals: [{ title: '3x Points', description: 'Cloud storage with rewards', rewardType: 'points', rewardValue: '3x Points' }] },
    { name: 'AT&T', subcategory: 'Telecom', deals: [{ title: '5% Cashback', description: 'Wireless and internet rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Verizon', subcategory: 'Telecom', deals: [{ title: '4x Points', description: 'Wireless service with points', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'T-Mobile', subcategory: 'Telecom', deals: [{ title: '4% Cashback', description: 'Mobile service with cashback', rewardType: 'cashback', rewardValue: '4% Cashback' }] },
  ],
  'Family & Community': [
    { name: 'Target', subcategory: 'Department Store', deals: [{ title: '5% Cashback', description: 'Everything for family with rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Walmart', subcategory: 'Department Store', deals: [{ title: '3% Cashback', description: 'Everyday low prices plus cashback', rewardType: 'cashback', rewardValue: '3% Cashback' }] },
    { name: 'Costco', subcategory: 'Warehouse', deals: [{ title: '2% Executive Rewards', description: 'Bulk buying with extra rewards', rewardType: 'cashback', rewardValue: '2% Cashback' }] },
    { name: "Sam's Club", subcategory: 'Warehouse', deals: [{ title: '3x Points', description: 'Membership shopping with rewards', rewardType: 'points', rewardValue: '3x Points' }] },
    { name: 'BuyBuy Baby', subcategory: 'Baby', deals: [{ title: '8% Cashback', description: 'Baby essentials with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: "Carter's", subcategory: 'Kids Clothing', deals: [{ title: '6x Points', description: "Kids' clothes with rewards", rewardType: 'points', rewardValue: '6x Points' }] },
    { name: 'Gap Kids', subcategory: 'Kids Clothing', deals: [{ title: '5% Cashback', description: 'Kids fashion with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'The Childrens Place', subcategory: 'Kids Clothing', deals: [{ title: '$10 Off $40+', description: 'Kids clothing savings', rewardType: 'discount', rewardValue: '$10 Off', minPurchase: 40 }] },
    { name: 'LEGO', subcategory: 'Toys', deals: [{ title: '5x Points', description: 'Build and earn rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Disney Store', subcategory: 'Entertainment', deals: [{ title: '6% Cashback', description: 'Disney magic with cashback', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Build-A-Bear', subcategory: 'Toys', deals: [{ title: '$5 Off', description: 'Create memories with savings', rewardType: 'discount', rewardValue: '$5 Off' }] },
    { name: 'Pottery Barn Kids', subcategory: 'Kids Home', deals: [{ title: '5% Cashback', description: 'Kids rooms with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'American Girl', subcategory: 'Toys', deals: [{ title: '4x Points', description: 'Dolls and accessories rewards', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'Party City', subcategory: 'Party Supplies', deals: [{ title: '10% Cashback', description: 'Celebrations with rewards', rewardType: 'cashback', rewardValue: '10% Cashback' }] },
    { name: 'Hallmark', subcategory: 'Cards & Gifts', deals: [{ title: '5x Points', description: 'Cards and gifts with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: '1-800-Flowers', subcategory: 'Flowers', deals: [{ title: '15% Off + 4x Points', description: 'Flowers and gifts with savings', rewardType: 'discount', rewardValue: '15% Off' }] },
  ],
  'Pets': [
    { name: 'Chewy', subcategory: 'Pet Supplies', deals: [{ title: '6% Cashback', description: 'Pet food and supplies with cashback', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'PetSmart', subcategory: 'Pet Supplies', deals: [{ title: '5x Points', description: 'Everything for pets with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Petco', subcategory: 'Pet Supplies', deals: [{ title: '5% Cashback', description: 'Pet essentials with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'BarkBox', subcategory: 'Pet Subscription', deals: [{ title: 'Free Extra Toy', description: 'Monthly box with bonus toy', rewardType: 'discount', rewardValue: 'Free Toy' }] },
    { name: 'Rover', subcategory: 'Pet Services', deals: [{ title: '8% Cashback', description: 'Pet sitting with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Wag', subcategory: 'Pet Services', deals: [{ title: '5x Points', description: 'Dog walking with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Wisdom Panel', subcategory: 'Pet Health', deals: [{ title: '$20 Off DNA Kit', description: 'Pet DNA testing savings', rewardType: 'discount', rewardValue: '$20 Off' }] },
    { name: 'Embark', subcategory: 'Pet Health', deals: [{ title: '10% Cashback', description: 'Dog DNA with cashback', rewardType: 'cashback', rewardValue: '10% Cashback' }] },
    { name: 'Furbo', subcategory: 'Pet Tech', deals: [{ title: '5x Points', description: 'Pet cameras with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Fi Collar', subcategory: 'Pet Tech', deals: [{ title: '15% Off', description: 'Smart collar savings', rewardType: 'discount', rewardValue: '15% Off' }] },
    { name: 'Nom Nom', subcategory: 'Pet Food', deals: [{ title: '50% Off First Order', description: 'Fresh pet food savings', rewardType: 'discount', rewardValue: '50% Off' }] },
    { name: "The Farmer's Dog", subcategory: 'Pet Food', deals: [{ title: '6% Cashback', description: 'Fresh dog food with cashback', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: 'Petplan', subcategory: 'Pet Insurance', deals: [{ title: '10% Off Annual', description: 'Pet insurance savings', rewardType: 'discount', rewardValue: '10% Off' }] },
    { name: 'Healthy Paws', subcategory: 'Pet Insurance', deals: [{ title: '5% Cashback', description: 'Pet insurance with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Wild One', subcategory: 'Pet Accessories', deals: [{ title: '8x Points', description: 'Modern pet gear with rewards', rewardType: 'points', rewardValue: '8x Points' }] },
  ],
  'Financial & Aspirational': [
    { name: 'TurboTax', subcategory: 'Tax Services', deals: [{ title: '10% Off', description: 'Tax filing with savings', rewardType: 'discount', rewardValue: '10% Off' }] },
    { name: 'H&R Block', subcategory: 'Tax Services', deals: [{ title: '$25 Off', description: 'Tax preparation savings', rewardType: 'discount', rewardValue: '$25 Off' }] },
    { name: 'Credit Karma', subcategory: 'Credit Services', deals: [{ title: '5x Points', description: 'Credit monitoring with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Personal Capital', subcategory: 'Wealth Management', deals: [{ title: 'Free Consultation', description: 'Financial planning session', rewardType: 'discount', rewardValue: 'Free' }] },
    { name: 'Mint', subcategory: 'Budgeting', deals: [{ title: '3x Points', description: 'Budget tracking with rewards', rewardType: 'points', rewardValue: '3x Points' }] },
    { name: 'Acorns', subcategory: 'Investing', deals: [{ title: '$10 Bonus', description: 'Start investing with bonus', rewardType: 'discount', rewardValue: '$10 Bonus' }] },
    { name: 'Robinhood', subcategory: 'Investing', deals: [{ title: 'Free Stock', description: 'Free stock when you sign up', rewardType: 'discount', rewardValue: 'Free Stock' }] },
    { name: 'Wealthfront', subcategory: 'Investing', deals: [{ title: '4x Points', description: 'Automated investing with rewards', rewardType: 'points', rewardValue: '4x Points' }] },
    { name: 'LegalZoom', subcategory: 'Legal Services', deals: [{ title: '15% Off', description: 'Legal documents with savings', rewardType: 'discount', rewardValue: '15% Off' }] },
    { name: 'LifeLock', subcategory: 'Identity Protection', deals: [{ title: '25% Off First Year', description: 'Identity protection savings', rewardType: 'discount', rewardValue: '25% Off' }] },
  ],
  'Automotive': [
    { name: 'Shell', subcategory: 'Gas Stations', deals: [{ title: '5% Cashback on Gas', description: 'Fuel up with cashback rewards', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Exxon Mobil', subcategory: 'Gas Stations', deals: [{ title: '3x Points', description: 'Gas and convenience with rewards', rewardType: 'points', rewardValue: '3x Points' }] },
    { name: 'BP', subcategory: 'Gas Stations', deals: [{ title: '4% Cashback', description: 'Fuel savings with cashback', rewardType: 'cashback', rewardValue: '4% Cashback' }] },
    { name: 'Chevron', subcategory: 'Gas Stations', deals: [{ title: '5x Points', description: 'Premium fuel with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'AutoZone', subcategory: 'Auto Parts', deals: [{ title: '6% Cashback', description: 'Auto parts with cashback', rewardType: 'cashback', rewardValue: '6% Cashback' }] },
    { name: "O'Reilly Auto Parts", subcategory: 'Auto Parts', deals: [{ title: '5x Points', description: 'Parts and tools with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
    { name: 'Advance Auto Parts', subcategory: 'Auto Parts', deals: [{ title: '5% Cashback', description: 'DIY auto with cashback', rewardType: 'cashback', rewardValue: '5% Cashback' }] },
    { name: 'Jiffy Lube', subcategory: 'Auto Service', deals: [{ title: '$10 Off Oil Change', description: 'Quick service with savings', rewardType: 'discount', rewardValue: '$10 Off' }] },
    { name: 'Firestone', subcategory: 'Tires', deals: [{ title: '8% Cashback', description: 'Tires and service with cashback', rewardType: 'cashback', rewardValue: '8% Cashback' }] },
    { name: 'Discount Tire', subcategory: 'Tires', deals: [{ title: '5x Points', description: 'Tire purchases with rewards', rewardType: 'points', rewardValue: '5x Points' }] },
  ],
};

const popularityOptions: AvailableDeal['popularity'][] = ['trending', 'popular', 'new', 'featured'];

function generateDeals(): AvailableDeal[] {
  const deals: AvailableDeal[] = [];
  let id = 1;

  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  for (const [category, merchants] of Object.entries(merchantsByCategory)) {
    for (const merchant of merchants) {
      for (const deal of merchant.deals) {
        const validFrom = new Date(oneMonthAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        const validUntil = new Date(threeMonthsFromNow.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
        
        deals.push({
          id: `deal-${id++}`,
          merchantName: merchant.name,
          category,
          subcategory: merchant.subcategory,
          dealTitle: deal.title,
          dealDescription: deal.description,
          rewardType: deal.rewardType,
          rewardValue: deal.rewardValue,
          minPurchase: deal.minPurchase,
          validFrom: validFrom.toISOString().split('T')[0],
          validUntil: validUntil.toISOString().split('T')[0],
          popularity: popularityOptions[Math.floor(Math.random() * popularityOptions.length)],
          activationCount: Math.floor(Math.random() * 50000) + 1000,
          averageRedemption: Math.floor(Math.random() * 40) + 50,
        });
      }
    }
  }

  return deals;
}

export const availableDeals = generateDeals();

export function getAvailableDeals(filters?: {
  category?: string;
  search?: string;
  sortBy?: 'popularity' | 'reward' | 'activations' | 'newest';
}): AvailableDeal[] {
  let filtered = [...availableDeals];

  if (filters?.category && filters.category !== 'All') {
    filtered = filtered.filter(deal => deal.category === filters.category);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(deal =>
      deal.merchantName.toLowerCase().includes(searchLower) ||
      deal.dealTitle.toLowerCase().includes(searchLower) ||
      deal.dealDescription.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'popularity':
        const popularityOrder = { trending: 0, featured: 1, popular: 2, new: 3 };
        filtered.sort((a, b) => popularityOrder[a.popularity] - popularityOrder[b.popularity]);
        break;
      case 'activations':
        filtered.sort((a, b) => b.activationCount - a.activationCount);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime());
        break;
    }
  }

  return filtered;
}

export function getDealCategories(): string[] {
  return ['All', ...Object.keys(DEAL_CATEGORIES)];
}
