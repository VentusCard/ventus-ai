
export type LifestyleGoal = 
  | "sports" 
  | "wellness" 
  | "pets" 
  | "gamers" 
  | "creatives" 
  | "homeowners";

export interface LifestyleOption {
  id: LifestyleGoal;
  title: string;
  description: string;
  year: string;
  icon: string;
  subcategories: string[];
  merchants: string[];
}

export interface ExamplePurchase {
  category: string;
  cardType: string;
  cardColor: string;
}
