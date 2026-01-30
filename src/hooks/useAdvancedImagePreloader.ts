import { useEffect, useRef, useCallback, useState } from 'react';
import { optimizedGalleryImages, getOptimalImageSize } from '@/components/gallery/ImageAssets';

interface ImageLoadTask {
  src: string;
  priority: number;
  size: 'thumbnail' | 'medium' | 'full';
  onLoad?: () => void;
  onError?: () => void;
}

interface UseAdvancedImagePreloaderProps {
  currentIndex: number;
  viewportWidth: number;
  preloadRange?: number;
}

export const useAdvancedImagePreloader = ({
  currentIndex,
  viewportWidth,
  preloadRange = 2
}: UseAdvancedImagePreloaderProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const loadQueue = useRef<ImageLoadTask[]>([]);
  const loadingImages = useRef<Set<string>>(new Set());
  const maxConcurrentLoads = useRef(3);
  const currentlyLoading = useRef(0);

  // Process the load queue
  const processQueue = useCallback(() => {
    if (currentlyLoading.current >= maxConcurrentLoads.current || loadQueue.current.length === 0) {
      return;
    }

    // Sort by priority (higher number = higher priority)
    loadQueue.current.sort((a, b) => b.priority - a.priority);
    
    while (currentlyLoading.current < maxConcurrentLoads.current && loadQueue.current.length > 0) {
      const task = loadQueue.current.shift();
      if (!task || loadingImages.current.has(task.src) || loadedImages.has(task.src)) {
        continue;
      }

      currentlyLoading.current++;
      loadingImages.current.add(task.src);
      
      const img = new Image();
      
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(task.src));
        loadingImages.current.delete(task.src);
        currentlyLoading.current--;
        task.onLoad?.();
        processQueue(); // Continue processing
      };
      
      img.onerror = () => {
        setFailedImages(prev => new Set(prev).add(task.src));
        loadingImages.current.delete(task.src);
        currentlyLoading.current--;
        task.onError?.();
        processQueue(); // Continue processing
      };

      img.src = task.src;
    }
  }, [loadedImages]);

  // Add image to load queue
  const queueImageLoad = useCallback((src: string, priority: number, size: 'thumbnail' | 'medium' | 'full') => {
    if (loadedImages.has(src) || failedImages.has(src) || loadingImages.current.has(src)) {
      return;
    }

    loadQueue.current.push({ src, priority, size });
    processQueue();
  }, [loadedImages, failedImages, processQueue]);

  // Preload strategy based on current index
  useEffect(() => {
    const optimalSize = getOptimalImageSize(viewportWidth);
    
    // Clear low-priority tasks when current index changes
    loadQueue.current = loadQueue.current.filter(task => task.priority >= 80);

    // Priority loading strategy:
    // 1. Current image (priority 100)
    // 2. Adjacent images (priority 90)
    // 3. Nearby images within preload range (priority 70-80)
    // 4. Thumbnails for visible range (priority 60)

    const totalImages = optimizedGalleryImages.length;
    
    // Load current image with highest priority
    const currentImage = optimizedGalleryImages[currentIndex];
    if (currentImage) {
      queueImageLoad(currentImage[optimalSize].webp, 100, optimalSize);
      // Also load fallback
      queueImageLoad(currentImage[optimalSize].fallback, 95, optimalSize);
      // Load thumbnail for current
      queueImageLoad(currentImage.thumbnail.webp, 85, 'thumbnail');
    }

    // Load adjacent images
    [-1, 1].forEach(offset => {
      let index = currentIndex + offset;
      if (index < 0) index = totalImages + index;
      if (index >= totalImages) index = index - totalImages;
      
      const image = optimizedGalleryImages[index];
      if (image) {
        queueImageLoad(image[optimalSize].webp, 90, optimalSize);
        queueImageLoad(image.thumbnail.webp, 80, 'thumbnail');
      }
    });

    // Load nearby images within preload range
    for (let i = 2; i <= preloadRange; i++) {
      [-i, i].forEach(offset => {
        let index = currentIndex + offset;
        if (index < 0) index = totalImages + index;
        if (index >= totalImages) index = index - totalImages;
        
        const image = optimizedGalleryImages[index];
        if (image) {
          const priority = Math.max(60, 80 - (i - 2) * 5); // Decreasing priority
          queueImageLoad(image[optimalSize].webp, priority, optimalSize);
          queueImageLoad(image.thumbnail.webp, priority - 5, 'thumbnail');
        }
      });
    }

    // Load thumbnails for visible thumbnail range
    const visibleStart = Math.max(0, currentIndex - 3);
    const visibleEnd = Math.min(totalImages - 1, currentIndex + 3);
    
    for (let i = visibleStart; i <= visibleEnd; i++) {
      const image = optimizedGalleryImages[i];
      if (image && i !== currentIndex) {
        queueImageLoad(image.thumbnail.webp, 60, 'thumbnail');
      }
    }

  }, [currentIndex, viewportWidth, preloadRange, queueImageLoad]);

  // Cleanup old images from memory when they're far from current view
  useEffect(() => {
    const cleanup = () => {
      const imagesToRemove: string[] = [];
      
      loadedImages.forEach(src => {
        // Find which image this src belongs to
        const imageIndex = optimizedGalleryImages.findIndex(img => 
          src.includes(img.id) || 
          img.thumbnail.webp === src || 
          img.medium.webp === src || 
          img.full.webp === src
        );
        
        // Remove if it's far from current view (beyond preload range + 2)
        if (imageIndex !== -1 && Math.abs(imageIndex - currentIndex) > preloadRange + 2) {
          imagesToRemove.push(src);
        }
      });

      if (imagesToRemove.length > 0) {
        setLoadedImages(prev => {
          const newSet = new Set(prev);
          imagesToRemove.forEach(src => newSet.delete(src));
          return newSet;
        });
      }
    };

    const cleanupInterval = setInterval(cleanup, 10000); // Cleanup every 10 seconds
    return () => clearInterval(cleanupInterval);
  }, [currentIndex, preloadRange, loadedImages]);

  return {
    isImageLoaded: useCallback((src: string) => loadedImages.has(src), [loadedImages]),
    isImageFailed: useCallback((src: string) => failedImages.has(src), [failedImages]),
    isImageLoading: useCallback((src: string) => loadingImages.current.has(src), []),
    loadedCount: loadedImages.size,
    failedCount: failedImages.size,
    queueLength: loadQueue.current.length,
    forcePreload: queueImageLoad,
  };
};