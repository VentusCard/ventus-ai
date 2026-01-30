

import { 
  CreditCard, 
  Trophy, 
  Gift, 
  MapPin, 
  Package, 
  Dumbbell, 
  Brain, 
  Pill, 
  Sparkles, 
  Heart, 
  Dog, 
  Cat, 
  Scissors, 
  ShoppingCart, 
  Calendar, 
  Gamepad2, 
  Monitor, 
  Smartphone, 
  Mic, 
  Headphones, 
  Camera, 
  Music, 
  Palette, 
  PenTool, 
  BookOpen, 
  Hammer, 
  Home, 
  Sofa, 
  Sprout, 
  Wrench,
  Smile,
  Moon,
  User,
  UserCheck,
  Mountain
} from "lucide-react";

export const dealIcons = {
  // Sports icons - updated to match standardized names
  "Golf": Trophy,
  "Tennis/Racquet Sports": Trophy,
  "Running/Track": Dumbbell,
  "Basketball": Trophy,
  "Football": Trophy,
  "Soccer": Trophy,
  "Outdoor Activities": MapPin,
  "Cycling/Biking": Dumbbell,
  "Water Sports": Heart,
  "Snow Sports": Trophy,
  "Fitness/Gym": Dumbbell,
  "Yoga/Pilates": Heart,
  // Wellness icons
  "Fitness and Recovery": Dumbbell,
  "Mental Health and Mindfulness": Brain,
  "Nutrition and Supplements": Pill,
  "Beauty and Cosmetics": Sparkles,
  "Haircare and Skincare": Smile,
  "Sleep and Restfulness": Moon,
  "Women's Health": User,
  "Men's Health": UserCheck,
  "Retreats and Experiences": Mountain,
  // Pet icons - updated to match standardized names
  "Dog Owners": Dog,
  "Cat Owners": Cat,
  "Grooming and Health": Scissors,
  "Pet Food and Nutrition": ShoppingCart,
  "Pet Activities and Services": Calendar,
  // Gaming icons
  "PC Gaming": Monitor,
  "Console Gaming": Gamepad2,
  "Mobile Gaming": Smartphone,
  "Esports and Streaming": Mic,
  "Gaming Accessories": Headphones,
  // Creative icons
  "Photography": Camera,
  "Music Production": Music,
  "Art Supplies": Palette,
  "Writing Tools": PenTool,
  "Online Creative Classes": BookOpen,
  // Homeowner icons
  "Home Improvement": Hammer,
  "Smart Home Tech": Home,
  "Furniture and Decor": Sofa,
  "Gardening and Outdoors": Sprout,
  "Home Services": Wrench
};

export const dealTypeIcons = {
  cashback: CreditCard,
  points: Trophy,
  gift: Gift,
  local: MapPin,
  bundle: Package
};

export const getDealIcon = (deal: string) => {
  if (deal.includes("Extra cashback")) return dealTypeIcons.cashback;
  if (deal.includes("Extra points")) return dealTypeIcons.points;
  if (deal.includes("Free")) return dealTypeIcons.gift;
  if (deal.includes("Local")) return dealTypeIcons.local;
  if (deal.includes("Bundle")) return dealTypeIcons.bundle;
  return dealTypeIcons.cashback;
};

