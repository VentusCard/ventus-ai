import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';
import { optimizedGalleryImages } from './ImageAssets';

interface VirtualThumbnailGridProps {
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  className?: string;
}

const THUMBNAIL_WIDTH = 96; // w-24
const THUMBNAIL_GAP = 8; // space-x-2
const VISIBLE_THUMBNAILS = 7; // Show 7 thumbnails at once
const BUFFER_SIZE = 2; // Keep 2 extra thumbnails on each side

export const VirtualThumbnailGrid: React.FC<VirtualThumbnailGridProps> = ({
  currentIndex,
  onThumbnailClick,
  className,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // Calculate visible thumbnail range
  const visibleRange = useMemo(() => {
    const totalWidth = VISIBLE_THUMBNAILS * (THUMBNAIL_WIDTH + THUMBNAIL_GAP);
    const centerIndex = currentIndex;
    const halfVisible = Math.floor(VISIBLE_THUMBNAILS / 2);
    
    let startIndex = Math.max(0, centerIndex - halfVisible);
    let endIndex = Math.min(optimizedGalleryImages.length - 1, centerIndex + halfVisible);
    
    // Adjust if we're near the boundaries
    if (endIndex - startIndex < VISIBLE_THUMBNAILS - 1) {
      if (startIndex === 0) {
        endIndex = Math.min(optimizedGalleryImages.length - 1, VISIBLE_THUMBNAILS - 1);
      } else {
        startIndex = Math.max(0, optimizedGalleryImages.length - VISIBLE_THUMBNAILS);
      }
    }
    
    return { startIndex, endIndex, totalWidth };
  }, [currentIndex]);

  // Virtual thumbnails to render (only visible + buffer)
  const virtualThumbnails = useMemo(() => {
    const thumbnails = [];
    const { startIndex, endIndex } = visibleRange;
    
    for (let i = Math.max(0, startIndex - BUFFER_SIZE); i <= Math.min(optimizedGalleryImages.length - 1, endIndex + BUFFER_SIZE); i++) {
      const image = optimizedGalleryImages[i];
      thumbnails.push({
        ...image,
        index: i,
        isActive: i === currentIndex,
        isVisible: i >= startIndex && i <= endIndex,
        shouldLoad: Math.abs(i - currentIndex) <= 3, // Load nearby thumbnails
      });
    }
    
    return thumbnails;
  }, [visibleRange, currentIndex]);

  // Auto-scroll to keep current thumbnail centered
  useEffect(() => {
    const { startIndex } = visibleRange;
    const centerPosition = (currentIndex - startIndex) * (THUMBNAIL_WIDTH + THUMBNAIL_GAP);
    const containerCenter = containerWidth / 2;
    const newScrollOffset = centerPosition - containerCenter + (THUMBNAIL_WIDTH / 2);
    
    setScrollOffset(Math.max(0, newScrollOffset));
  }, [currentIndex, visibleRange, containerWidth]);

  // Handle container resize
  useEffect(() => {
    const updateContainerWidth = () => {
      const container = document.getElementById('thumbnail-container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    onThumbnailClick(index);
  }, [onThumbnailClick]);

  return (
    <div className={cn('relative', className)}>
      <div 
        id="thumbnail-container"
        className="overflow-hidden"
      >
        <div 
          className="flex transition-transform duration-300 ease-out space-x-2"
          style={{
            transform: `translateX(-${scrollOffset}px)`,
            width: optimizedGalleryImages.length * (THUMBNAIL_WIDTH + THUMBNAIL_GAP),
          }}
        >
          {virtualThumbnails.map((thumbnail) => (
            <button
              key={thumbnail.id}
              onClick={() => handleThumbnailClick(thumbnail.index)}
              className={cn(
                'flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-300',
                'w-24 h-16 hover:scale-105',
                thumbnail.isActive
                  ? 'ring-2 ring-blue-400 shadow-lg scale-105'
                  : 'ring-1 ring-slate-600/50 hover:ring-slate-500',
                !thumbnail.isVisible && 'opacity-50'
              )}
              aria-label={`View image ${thumbnail.index + 1}: ${thumbnail.alt}`}
            >
              {thumbnail.shouldLoad ? (
                <picture className="w-full h-full">
                  <source
                    srcSet={thumbnail.thumbnail.webp}
                    type="image/webp"
                  />
                  <OptimizedImage
                    src={thumbnail.thumbnail.fallback}
                    alt={thumbnail.alt}
                    className="w-full h-full object-cover"
                    priority={false}
                    sizes="120px"
                    enableDownloadProtection={true}
                  />
                </picture>
              ) : (
                // Show placeholder for non-loaded thumbnails
                <img
                  src={thumbnail.placeholder}
                  alt={thumbnail.alt}
                  className="w-full h-full object-cover opacity-50"
                />
              )}
              
              {/* Active indicator */}
              {thumbnail.isActive && (
                <div className="absolute inset-0 bg-blue-400/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Scroll indicators */}
      <div className="flex justify-center mt-2 space-x-1">
        {Array.from({ length: Math.ceil(optimizedGalleryImages.length / VISIBLE_THUMBNAILS) }).map((_, pageIndex) => (
          <div
            key={pageIndex}
            className={cn(
              'w-1 h-1 rounded-full transition-colors duration-200',
              Math.floor(currentIndex / VISIBLE_THUMBNAILS) === pageIndex
                ? 'bg-white'
                : 'bg-white/30'
            )}
          />
        ))}
      </div>
    </div>
  );
};
