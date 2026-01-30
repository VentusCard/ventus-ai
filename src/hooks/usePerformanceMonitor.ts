import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  imageLoadTime: number;
  totalImages: number;
  failedImages: number;
  averageLoadTime: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    imageLoadTime: 0,
    totalImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
  });

  const loadTimes = useRef<number[]>([]);
  const startTimes = useRef<Map<string, number>>(new Map());

  const startImageLoad = (imageId: string) => {
    startTimes.current.set(imageId, performance.now());
  };

  const endImageLoad = (imageId: string, success: boolean = true) => {
    const startTime = startTimes.current.get(imageId);
    if (!startTime) return;

    const loadTime = performance.now() - startTime;
    loadTimes.current.push(loadTime);
    startTimes.current.delete(imageId);

    setMetrics(prev => {
      const newTotalImages = prev.totalImages + 1;
      const newFailedImages = success ? prev.failedImages : prev.failedImages + 1;
      const newAverageLoadTime = loadTimes.current.reduce((sum, time) => sum + time, 0) / loadTimes.current.length;

      return {
        imageLoadTime: loadTime,
        totalImages: newTotalImages,
        failedImages: newFailedImages,
        averageLoadTime: newAverageLoadTime,
        memoryUsage: getMemoryUsage(),
      };
    });
  };

  const getMemoryUsage = (): number | undefined => {
    if ('memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  };

  // Monitor performance periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: getMemoryUsage(),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Log performance metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && metrics.totalImages > 0) {
      console.group('Gallery Performance Metrics');
      console.log(`Total Images Loaded: ${metrics.totalImages}`);
      console.log(`Failed Images: ${metrics.failedImages}`);
      console.log(`Average Load Time: ${metrics.averageLoadTime.toFixed(2)}ms`);
      console.log(`Last Load Time: ${metrics.imageLoadTime.toFixed(2)}ms`);
      if (metrics.memoryUsage) {
        console.log(`Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB`);
      }
      console.groupEnd();
    }
  }, [metrics]);

  return {
    metrics,
    startImageLoad,
    endImageLoad,
  };
};