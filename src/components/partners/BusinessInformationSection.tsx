import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
const businessCategories = [{
  value: "Sports",
  label: "Sports",
  available: true
}, {
  value: "Wellness",
  label: "Wellness",
  available: true
}, {
  value: "Pet Owners",
  label: "Pet Owners",
  available: true
}, {
  value: "Gamers",
  label: "Gamers",
  available: true
}, {
  value: "Creatives",
  label: "Creatives",
  available: true
}, {
  value: "Homeowners",
  label: "Homeowners",
  available: true
}];
const subcategories = {
  Sports: ["Golf", "Tennis", "Running", "Snowsports", "Fitness and Gym", "Basketball", "Football", "Soccer", "Hockey", "Apparel and Footwear", "Gears and Accessories", "Sports Facilities"],
  Wellness: ["Fitness and Recovery", "Mental Health and Mindfulness", "Nutrition and Supplements", "Beauty and Cosmetics", "Haircare and Skincare", "Sleep and Restfulness", "Women's Health", "Men's Health", "Retreats and Experiences", "Alternative Medicine", "Yoga and Pilates", "Personal Training"],
  "Pet Owners": ["Dog Essentials", "Cat Owners", "Grooming and Health", "Pet Food and Nutrition", "Vet Services", "Pet Activities and Services", "Pet Insurance", "Pet Training", "Pet Toys and Accessories", "Pet Travel and Boarding"],
  Gamers: ["PC Gaming", "Console Gaming", "Mobile Gaming", "Esports and Streaming", "Gaming Accessories", "Gaming Chairs and Furniture", "Virtual Reality", "Gaming Software", "Gaming Communities", "Retro Gaming"],
  Creatives: ["Photography", "Music Production", "Art Supplies", "Writing Tools", "Online Creative Classes", "Video Production", "Graphic Design", "3D Modeling and Animation", "Digital Marketing Tools", "Creative Software"],
  Homeowners: ["Home Improvement", "Smart Home Tech", "Furniture and Decor", "Gardening and Outdoors", "Home Services", "Home Security", "Kitchen and Appliances", "Cleaning and Organization", "Energy Efficiency", "Home Insurance"]
};
interface BusinessInformationSectionProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSubcategories: string[];
  setSelectedSubcategories: (subcategories: string[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
  isComplete: boolean;
}
const BusinessInformationSection = ({
  selectedCategory,
  setSelectedCategory,
  selectedSubcategories,
  setSelectedSubcategories,
  isExpanded,
  onToggle,
  isComplete
}: BusinessInformationSectionProps) => {
  const {
    isMobile
  } = useDeviceType();
  return <Card className="overflow-hidden border-0 shadow-premium bg-white/95 backdrop-blur-sm">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"></div>
      
      <CardHeader className="cursor-pointer p-4 md:p-6" onClick={onToggle}>
        <CardTitle className="flex items-center justify-between text-xl md:text-2xl font-bold">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative p-1.5 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/5 rounded-lg"></div>
              <div className="absolute inset-0.5 border border-white/40 rounded-md"></div>
              <Building2 size={16} className="text-white relative z-10 md:w-[18px] md:h-[18px]" strokeWidth={2} />
            </div>
            <span className="text-base md:text-2xl">Business Information</span>
            {isComplete && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </CardTitle>
        <p className="text-slate-600 mt-2 text-sm md:text-base">Tell us about your organization and which main categories it aligns with.</p>
      </CardHeader>

      {isExpanded && <CardContent className="px-4 md:px-8 pb-4 md:pb-6 space-y-4 md:space-y-6 animate-accordion-down">
          {/* Business Category - Mobile Grid */}
          <div>
            <label className="text-slate-700 font-medium mb-3 block text-sm md:text-base">Business Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {businessCategories.map(category => <div key={category.value} className={`relative ${!category.available ? 'opacity-50' : ''}`}>
                  <input type="radio" id={category.value} name="businessCategory" value={category.value} checked={selectedCategory === category.value} onChange={e => {
              if (category.available) {
                setSelectedCategory(e.target.value);
                setSelectedSubcategories([]);
              }
            }} disabled={!category.available} className="sr-only" />
                  <label htmlFor={category.value} className={`block p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-sm md:text-base ${selectedCategory === category.value && category.available ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'} ${!category.available ? 'cursor-not-allowed' : ''} ${isMobile ? 'min-h-[48px] flex items-center' : ''}`}>
                    {category.label}
                  </label>
                </div>)}
            </div>
          </div>

          {/* Subcategories - Mobile Optimized with reduced vertical padding */}
          {selectedCategory && subcategories[selectedCategory as keyof typeof subcategories] && <div>
              <label className="text-slate-700 font-medium mb-3 block text-sm md:text-base">
                Subcategories (select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {subcategories[selectedCategory as keyof typeof subcategories].map(subcat => <div key={subcat} className="flex items-center space-x-2 p-1.5 md:p-2 border rounded-lg hover:bg-slate-50">
                    <Checkbox id={subcat} checked={selectedSubcategories.includes(subcat)} onCheckedChange={checked => {
              if (checked) {
                setSelectedSubcategories([...selectedSubcategories, subcat]);
              } else {
                setSelectedSubcategories(selectedSubcategories.filter(s => s !== subcat));
              }
            }} className={isMobile ? "h-2.5 w-2.5" : "h-4 w-4"} />
                    <Label htmlFor={subcat} className="text-xs md:text-sm cursor-pointer flex-1">{subcat}</Label>
                  </div>)}
              </div>
            </div>}
        </CardContent>}
    </Card>;
};
export default BusinessInformationSection;