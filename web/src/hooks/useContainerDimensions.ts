import { useLayoutEffect, useRef, useState } from "react";

export function useContainerDimensions<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    function updateSize(w: number, h: number) {
      if (w > 0 && h > 0) {
        setDimensions((prev) => {
          if (prev.width === Math.round(w) && prev.height === Math.round(h)) {
            return prev;
          }
          return { width: Math.round(w), height: Math.round(h) };
        });
      }
    }

    const rect = el.getBoundingClientRect();
    updateSize(rect.width, rect.height);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          updateSize(width, height);
        }
      });
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      const handleResize = () => {
        const r = el.getBoundingClientRect();
        updateSize(r.width, r.height);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return { ref, dimensions };
}
