import { Apple, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const IOS_LINK = 'https://apps.apple.com/us/app/ventus-smart-rewards/id6754831937';
const ANDROID_LINK = 'https://play.google.com/store/apps/details?id=com.ventuscard.ventus';

interface AppStoreBadgesProps {
  compact?: boolean;
}

export const AppStoreBadges = ({ compact = false }: AppStoreBadgesProps) => {
  if (compact) {
    return (
      <div className="flex gap-2">
        <a
          href={IOS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
          aria-label="Download on App Store"
        >
          <Apple className="w-5 h-5" />
        </a>
        <a
          href={ANDROID_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
          aria-label="Get it on Google Play"
        >
          <PlayCircle className="w-5 h-5" />
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={IOS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
      >
        <Apple className="w-6 h-6" />
        <div className="text-left">
          <div className="text-[10px] leading-none">Download on the</div>
          <div className="text-sm font-semibold">App Store</div>
        </div>
      </a>
      <a
        href={ANDROID_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
      >
        <PlayCircle className="w-6 h-6" />
        <div className="text-left">
          <div className="text-[10px] leading-none">Get it on</div>
          <div className="text-sm font-semibold">Google Play</div>
        </div>
      </a>
    </div>
  );
};