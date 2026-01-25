import { cn } from '@/lib/utils';
import { getDealCategoryIcon } from '@/lib/categoryIcons';

interface DealCategoryChipProps {
  label: string;
  emoji?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const DealCategoryChip = ({ 
  label, 
  emoji,
  isActive = false, 
  onClick 
}: DealCategoryChipProps) => {
  const icon = emoji || getDealCategoryIcon(label);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap",
        isActive 
          ? "bg-[#0064E0] text-white border-[#0064E0]" 
          : "bg-card border-border hover:border-[#0064E0]/50 text-foreground"
      )}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};
