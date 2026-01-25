import { cn } from '@/lib/utils';
import { getSubcategoryIcon } from '@/lib/categoryIcons';

interface SubcategoryChipProps {
  label: string;
  emoji?: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export const SubcategoryChip = ({ 
  label, 
  emoji, 
  count, 
  isActive = false, 
  onClick,
}: SubcategoryChipProps) => {
  const icon = emoji || getSubcategoryIcon(label);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap",
        isActive 
          ? "border-primary bg-primary/10 text-foreground" 
          : "border-border bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
      )}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className={cn(
          "text-xs",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {count}
        </span>
      )}
    </button>
  );
};
