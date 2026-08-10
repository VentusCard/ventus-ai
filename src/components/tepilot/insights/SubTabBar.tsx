import { cn } from "@/lib/utils";

export interface SubTabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SubTabBarProps {
  items: SubTabItem[];
  value: string;
  onChange: (value: string) => void;
}

export function SubTabBar({ items, value, onChange }: SubTabBarProps) {
  return (
    <div className="flex items-center gap-1 border border-slate-200 rounded-lg bg-slate-50/70 p-1 overflow-x-auto">
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/70 border border-transparent",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
