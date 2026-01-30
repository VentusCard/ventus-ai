import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';

interface ThumbnailGridProps {
  images: Array<{ url: string; thumbnail: string; alt: string }>;
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  className?: string;
}

export const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({
  images,
  currentIndex,
  onThumbnailClick,
  className,
}) => {
  // Generate optimized thumbnail URLs
  const optimizedThumbnails = useMemo(() => {
    return images.map((image, index) => ({
      ...image,
      optimizedThumbnail: image.url.startsWith('http')
        ? `${image.url.split('?')[0]}?auto=format&fit=crop&w=120&h=80&q=70&fm=webp`
        : image.thumbnail,
      isActive: index === currentIndex,
      shouldPreload: Math.abs(index - currentIndex) <= 2, // Preload nearby thumbnails
    }));
  }, [images, currentIndex]);

  return (
    <div className={cn('flex justify-center space-x-2 overflow-x-auto pb-4', className)}>
      {optimizedThumbnails.map((image, index) => (
        <button
          key={index}
          onClick={() => onThumbnailClick(index)}
          className={cn(
            'flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-300 hover:scale-105',
            'w-20 h-14 md:w-24 md:h-16',
            image.isActive
              ? 'ring-2 ring-blue-400 shadow-lg scale-105'
              : 'ring-1 ring-slate-600/50 hover:ring-slate-500'
          )}
          aria-label={`View image ${index + 1}: ${image.alt}`}
        >
          <OptimizedImage
            src={image.optimizedThumbnail}
            alt={image.alt}
            priority={image.shouldPreload}
            sizes="120px"
            className="w-full h-full"
          />
          
          {/* Active indicator */}
          {image.isActive && (
            <div className="absolute inset-0 bg-blue-400/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};