import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonaCardProps {
  icon: LucideIcon;
  title: string;
  valueProposition: string;
  description: string;
  keyFeatures: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline" | "ai";
  badge?: string;
  onClick: () => void;
  disabled?: boolean;
  requiresUnlock?: boolean;
}

export function PersonaCard({
  icon: Icon,
  title,
  valueProposition,
  description,
  keyFeatures,
  buttonText,
  buttonVariant = "default",
  badge,
  onClick,
  disabled = false,
  requiresUnlock = false,
}: PersonaCardProps) {
  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 hover:shadow-md border-slate-200 bg-white min-h-[450px] flex flex-col",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:border-primary/20"
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 group-hover:from-slate-50 group-hover:to-slate-100 transition-all">
              <Icon className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <CardTitle className="text-xl leading-tight">{title}</CardTitle>
            </div>
          </div>
          {badge && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 flex flex-col flex-grow p-8 pt-0">
        {/* Value Proposition */}
        <div className="text-lg font-medium text-primary leading-tight">
          {valueProposition}
        </div>

        {/* Description */}
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>

        {/* Key Features */}
        <div className="space-y-2.5 flex-grow">
          {keyFeatures.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600 leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>

        {/* Button */}
        <Button
          variant={buttonVariant}
          className="w-full group-hover:shadow-sm transition-shadow mt-auto"
          onClick={onClick}
          disabled={disabled}
        >
          {requiresUnlock && <Lock className="w-4 h-4 mr-2" />}
          {buttonText}
          {!requiresUnlock && !disabled && (
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
