import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Heart, Wallet, Target } from "lucide-react";

interface UserPersona {
  summary: string;
  lifestyle_traits: string[];
  spending_behaviors: string[];
  interests: string[];
}

interface UserPersonaCardProps {
  persona: UserPersona;
}

export function UserPersonaCard({ persona }: UserPersonaCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <User className="h-5 w-5 text-primary" />
          Customer Persona
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <p className="text-sm leading-relaxed italic text-slate-700">"{persona.summary}"</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Lifestyle Traits */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <h4 className="font-medium text-sm">Lifestyle Traits</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {persona.lifestyle_traits.map((trait, idx) => (
                <Badge key={idx} variant="outline" className="bg-rose-500/10 border-rose-500/20">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          {/* Spending Behaviors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-500" />
              <h4 className="font-medium text-sm">Spending Behaviors</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {persona.spending_behaviors.map((behavior, idx) => (
                <Badge key={idx} variant="outline" className="bg-emerald-500/10 border-emerald-500/20">
                  {behavior}
                </Badge>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium text-sm">Interests & Priorities</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {persona.interests.map((interest, idx) => (
                <Badge key={idx} variant="outline" className="bg-blue-500/10 border-blue-500/20">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
