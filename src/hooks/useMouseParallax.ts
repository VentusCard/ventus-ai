import { useState, useEffect, useCallback, useRef } from "react";

interface ParallaxValues {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
}

export const useMouseParallax = (sensitivity: number = 0.02) => {
  const [parallax, setParallax] = useState<ParallaxValues>({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  });
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<ParallaxValues>({ x: 0, y: 0, rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calculate normalized position (-1 to 1)
      const normalizedX = (clientX / innerWidth - 0.5) * 2;
      const normalizedY = (clientY / innerHeight - 0.5) * 2;

      // Set target values
      targetRef.current = {
        x: normalizedX * 30 * sensitivity,
        y: normalizedY * 30 * sensitivity,
        rotateX: normalizedY * 5 * sensitivity,
        rotateY: -normalizedX * 5 * sensitivity,
      };
    },
    [sensitivity]
  );

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      setParallax((prev) => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.08,
        y: prev.y + (targetRef.current.y - prev.y) * 0.08,
        rotateX: prev.rotateX + (targetRef.current.rotateX - prev.rotateX) * 0.08,
        rotateY: prev.rotateY + (targetRef.current.rotateY - prev.rotateY) * 0.08,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return parallax;
};
