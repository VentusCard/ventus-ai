import { Sparkles, TrendingUp, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromptSuggestionsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  isLoading: boolean;
}

const icons = [Sparkles, TrendingUp, Tag];

export const PromptSuggestions = ({ prompts, onPromptClick, isLoading }: PromptSuggestionsProps) => {
  if (prompts.length === 0) return null;

  return (
    <div className="mb-4 animate-fade-in">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Suggested prompts:</p>
      <div className="flex flex-col gap-2">
        {prompts.map((prompt, index) => {
          const Icon = icons[index % icons.length];
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onPromptClick(prompt)}
              disabled={isLoading}
              className="justify-start text-left h-auto py-2.5 px-3 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 hover:scale-[1.02] group whitespace-normal"
            >
              <Icon className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-primary/70 group-hover:text-primary transition-colors mt-0.5" />
              <span className="text-xs leading-relaxed">{prompt}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
