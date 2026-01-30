import { User, Dumbbell, Heart, Dog, Gamepad2, Palette, Home, Snowflake, Flag, Circle, Zap, Bike, Waves } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type LifestyleGoal = "sports" | "wellness" | "pets" | "gamers" | "creatives" | "homeowners";

interface Profile {
  full_name: string | null;
  lifestyle_goal: string | null;
  selected_categories: string[] | null;
}

interface UserProfileBarProps {
  profile: Profile;
}

const goalIcons: Record<string, LucideIcon> = {
  sports: Dumbbell,
  wellness: Heart,
  pets: Dog,
  gamers: Gamepad2,
  creatives: Palette,
  homeowners: Home,
};

const goalTitles: Record<string, string> = {
  sports: "Sports Enthusiast",
  wellness: "Wellness Focused",
  pets: "Pet Owner",
  gamers: "Gamer",
  creatives: "Creative",
  homeowners: "Homeowner",
};

const categoryIcons: Record<string, LucideIcon> = {
  "Snow Sports": Snowflake,
  "Golf": Flag,
  "Tennis/Racquet Sports": Circle,
  "Running/Track": Zap,
  "Basketball": Circle,
  "Football": Circle,
  "Soccer": Circle,
  "Cycling/Biking": Bike,
  "Water Sports": Waves,
  "Fitness/Gym": Dumbbell,
  "Yoga/Pilates": Heart,
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const UserProfileBar = ({ profile }: UserProfileBarProps) => {
  const goal = profile.lifestyle_goal || "sports";
  const GoalIcon = goalIcons[goal] || Dumbbell;
  const goalTitle = goalTitles[goal] || goal;
  const categories = profile.selected_categories || [];

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm border-b border-border shadow-sm animate-slideDown">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          
          {/* User Section */}
          <div className="flex items-center gap-3 min-w-fit">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm ring-2 ring-primary/20 backdrop-blur-sm">
              {profile.full_name ? (
                <span className="text-primary">{getInitials(profile.full_name)}</span>
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {profile.full_name || "Guest User"}
              </p>
              <p className="text-xs text-muted-foreground">Member</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-8 w-px bg-border" />

          {/* Goal Section */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all duration-200">
            <GoalIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {goalTitle}
            </span>
          </div>

          {/* Categories Section */}
          <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-hide">
            {categories.slice(0, 5).map((cat, idx) => {
              const CategoryIcon = categoryIcons[cat] || Circle;
              return (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-accent transition-all duration-200 animate-slideInLeft"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <CategoryIcon className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs whitespace-nowrap">{cat}</span>
                </Badge>
              );
            })}
            {categories.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{categories.length - 5}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
