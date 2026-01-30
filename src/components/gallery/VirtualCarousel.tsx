import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { optimizedGalleryImages, getOptimalImageSize, type ImageAsset } from './ImageAssets';

interface VirtualCarouselProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
  autoPlay?: boolean;
  className?: string;
}

// Only render 3 slides: previous, current, next
const VISIBLE_SLIDES = 3;
const BUFFER_SIZE = 1; // How many slides to keep in memory on each side

export const VirtualCarousel: React.FC<VirtualCarouselProps> = ({
  currentIndex,
  onIndexChange,
  autoPlay = false,
  className,
}) => {
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Track viewport size for optimal image selection
  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  // Get optimal image size based on viewport
  const imageSize = useMemo(() => getOptimalImageSize(viewportWidth), [viewportWidth]);

  // Calculate which slides to render
  const visibleSlides = useMemo(() => {
    const slides = [];
    const totalImages = optimizedGalleryImages.length;
    
    // Calculate indices for visible slides
    for (let i = -BUFFER_SIZE; i <= BUFFER_SIZE; i++) {
      let index = currentIndex + i;
      // Handle circular navigation
      if (index < 0) index = totalImages + index;
      if (index >= totalImages) index = index - totalImages;
      
      const image = optimizedGalleryImages[index];
      slides.push({
        ...image,
        relativePosition: i,
        actualIndex: index,
        isActive: i === 0,
        shouldLoad: Math.abs(i) <= 1, // Only load adjacent and current
      });
    }
    
    return slides;
  }, [currentIndex]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const nextIndex = (currentIndex + 1) % optimizedGalleryImages.length;
    onIndexChange(nextIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, onIndexChange, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const prevIndex = currentIndex === 0 ? optimizedGalleryImages.length - 1 : currentIndex - 1;
    onIndexChange(prevIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, onIndexChange, isTransitioning]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [autoPlay, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Touch/swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrevious();
  };

  return (
    <div 
      className={cn('relative w-full overflow-hidden', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Virtual slide container */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] flex items-center justify-center">
        {visibleSlides.map((slide) => {
          const isVisible = Math.abs(slide.relativePosition) <= 1;
          
          if (!isVisible) return null;

          return (
            <div
              key={`${slide.id}-${slide.relativePosition}`}
              className={cn(
                'absolute inset-0 transition-all duration-500 ease-in-out',
                slide.isActive ? 'z-20 opacity-100 scale-100' : 'z-10 opacity-40 scale-95',
                slide.relativePosition < 0 && 'transform -translate-x-full',
                slide.relativePosition > 0 && 'transform translate-x-full',
                isTransitioning && 'transition-transform duration-300'
              )}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900/50 flex items-center justify-center">
                {slide.shouldLoad ? (
                  <OptimizedImage
                    src={slide[imageSize].webp}
                    alt={slide.alt}
                    priority={slide.isActive}
                    sizes={
                      imageSize === 'thumbnail' ? '120px' :
                      imageSize === 'medium' ? '(max-width: 768px) 100vw, 800px' :
                      '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px'
                    }
                    className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                    onLoad={() => console.log(`Loaded: ${slide.alt}`)}
                    enableDownloadProtection={true}
                  />
                ) : (
                  // Placeholder for non-loaded images
                  <img
                    src={slide.placeholder}
                    alt={slide.alt}
                    className="w-full h-full object-contain opacity-50"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <Button
        variant="outline"
        size="icon"
        onClick={goToPrevious}
        disabled={isTransitioning}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNext}
        disabled={isTransitioning}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="flex space-x-2">
          {optimizedGalleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};