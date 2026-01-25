import { useState, ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  previewContent?: ReactNode;
  className?: string;
}

export function CollapsibleCard({
  title,
  description,
  icon,
  headerRight,
  children,
  defaultExpanded = false,
  previewContent,
  className,
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn("overflow-hidden bg-white border-slate-200", className)}>
      <CardHeader
        className="cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              {icon}
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1 text-slate-500">{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {headerRight}
            <ChevronDown
              className={cn(
                "h-5 w-5 text-slate-500 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </div>
        
        {/* Preview content when collapsed */}
        {!isExpanded && previewContent && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            {previewContent}
          </div>
        )}
      </CardHeader>
      
      {isExpanded && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
