"use client";

import { useState, useEffect } from "react";

/**
 * Hook to track scroll position and detect if scrolled past threshold
 *
 * @param threshold - Scroll position in pixels to trigger visibility (default 300)
 * @returns Object with current scrollY and boolean if above threshold
 *
 * @example
 * const { scrollY, isAboveThreshold } = useScrollPosition(300);
 * {isAboveThreshold && <ScrollToTopButton />}
 */
export function useScrollPosition(threshold = 300) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Set initial scroll position
    setScrollY(window.scrollY);

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return {
    scrollY,
    isAboveThreshold: scrollY > threshold,
  };
}
