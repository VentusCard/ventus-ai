import { useState, useCallback, useEffect, useMemo } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { VirtualCarousel } from '@/components/gallery/VirtualCarousel';
import { VirtualThumbnailGrid } from '@/components/gallery/VirtualThumbnailGrid';
import { useAdvancedImagePreloader } from '@/hooks/useAdvancedImagePreloader';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { optimizedGalleryImages } from '@/components/gallery/ImageAssets';

// Using optimized gallery images from ImageAssets

const Gallery = () => {
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1200);

  // Performance monitoring
  const {
    metrics,
    startImageLoad,
    endImageLoad
  } = usePerformanceMonitor();

  // Advanced image preloading with priority queue
  const {
    isImageLoaded,
    isImageFailed,
    loadedCount,
    failedCount,
    queueLength
  } = useAdvancedImagePreloader({
    currentIndex,
    viewportWidth,
    preloadRange: 3
  });

  // Track viewport size
  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlay(!isAutoPlay);
  }, [isAutoPlay]);
  const handleImageLoad = useCallback((imageUrl: string) => {
    endImageLoad(imageUrl, true);
  }, [endImageLoad]);
  const handleImageError = useCallback((imageUrl: string) => {
    endImageLoad(imageUrl, false);
  }, [endImageLoad]);
  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
    startImageLoad(`image-${index}`);
    endImageLoad(`image-${index}`, true);
  }, [startImageLoad, endImageLoad]);
  const handleThumbnailClick = useCallback((index: number) => {
    handleIndexChange(index);
  }, [handleIndexChange]);
  // Global download protection
  useEffect(() => {
    const handleGlobalContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleGlobalDragStart = (e: Event) => {
      if ((e.target as HTMLElement)?.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    const handleGlobalSelectStart = (e: Event) => {
      if ((e.target as HTMLElement)?.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common save shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
      // Prevent F12 and other dev tools shortcuts
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleGlobalContextMenu);
    document.addEventListener('dragstart', handleGlobalDragStart);
    document.addEventListener('selectstart', handleGlobalSelectStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
      document.removeEventListener('dragstart', handleGlobalDragStart);
      document.removeEventListener('selectstart', handleGlobalSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <div className="min-h-screen bg-black flex flex-col select-none"
    style={{
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
      WebkitTouchCallout: 'none'
    }}>
      <Navbar />
      
      {/* Minimized Hero Section */}
      <div className="relative pt-16 md:pt-20 pb-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent mb-2">
            Gallery
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto">
            Curated visuals that inspire and elevate
          </p>
        </div>
      </div>

      {/* Main Gallery Content */}
      <main className="flex-1 px-4 md:px-8 pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Virtual Image Carousel */}
          <VirtualCarousel currentIndex={currentIndex} onIndexChange={handleIndexChange} autoPlay={isAutoPlay} className="mb-4" />

          {/* Enhanced Performance Metrics (Development Only) */}
          {process.env.NODE_ENV === 'development'}

          {/* Virtual Thumbnail Grid */}
          <VirtualThumbnailGrid currentIndex={currentIndex} onThumbnailClick={handleThumbnailClick} className="mt-4" />

          {/* Gallery Controls */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-700">
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm">
                {currentIndex + 1} / {optimizedGalleryImages.length}
              </span>
              
            </div>
            <Button variant="outline" size="sm" onClick={toggleAutoPlay} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              {isAutoPlay ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAutoPlay ? "Pause" : "Play"}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default Gallery;