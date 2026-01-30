import { useEffect, useRef } from 'react';

interface UseImagePreloaderProps {
  images: string[];
  currentIndex: number;
  preloadRange?: number;
}

export const useImagePreloader = ({ 
  images, 
  currentIndex, 
  preloadRange = 2 
}: UseImagePreloaderProps) => {
  const preloadedImages = useRef<Set<string>>(new Set());
  const loadingImages = useRef<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (preloadedImages.current.has(src) || loadingImages.current.has(src)) {
          resolve();
          return;
        }

        loadingImages.current.add(src);
        
        const img = new Image();
        
        img.onload = () => {
          preloadedImages.current.add(src);
          loadingImages.current.delete(src);
          resolve();
        };
        
        img.onerror = () => {
          loadingImages.current.delete(src);
          reject(new Error(`Failed to preload image: ${src}`));
        };

        // Optimize image URL for preloading
        if (src.startsWith('http')) {
          const baseUrl = src.split('?')[0];
          img.src = `${baseUrl}?auto=format&fit=crop&w=800&q=80&fm=webp`;
        } else {
          img.src = src;
        }
      });
    };

    const preloadNearbyImages = async () => {
      const imagesToPreload: string[] = [];
      
      // Add current image (highest priority)
      if (images[currentIndex]) {
        imagesToPreload.push(images[currentIndex]);
      }
      
      // Add nearby images within preload range
      for (let i = 1; i <= preloadRange; i++) {
        const nextIndex = currentIndex + i;
        const prevIndex = currentIndex - i;
        
        if (nextIndex < images.length && images[nextIndex]) {
          imagesToPreload.push(images[nextIndex]);
        }
        
        if (prevIndex >= 0 && images[prevIndex]) {
          imagesToPreload.push(images[prevIndex]);
        }
      }

      // Preload images with priority (current first, then nearby)
      try {
        await Promise.allSettled(imagesToPreload.map(preloadImage));
      } catch (error) {
        console.warn('Some images failed to preload:', error);
      }
    };

    preloadNearbyImages();
  }, [currentIndex, images, preloadRange]);

  return {
    isImagePreloaded: (src: string) => preloadedImages.current.has(src),
    preloadedCount: preloadedImages.current.size,
  };
};