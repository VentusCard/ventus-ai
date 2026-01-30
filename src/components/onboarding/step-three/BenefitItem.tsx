
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BenefitItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ title, description, icon: IconComponent }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex gap-3">
        <div className="bg-white/20 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
          <IconComponent className="h-5 w-5 text-white" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-white text-base leading-tight">{title}</p>
          <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default BenefitItem;
