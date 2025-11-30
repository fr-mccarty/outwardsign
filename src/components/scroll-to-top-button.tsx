"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { cn } from "@/lib/utils";
import { SCROLL_TO_TOP_THRESHOLD } from "@/lib/constants";

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

/**
 * Floating button that appears after scrolling down and scrolls to top on click
 *
 * @param threshold - Scroll position in pixels to show button (default from constants)
 * @param className - Additional CSS classes
 *
 * @example
 * <ScrollToTopButton threshold={400} />
 */
export function ScrollToTopButton({
  threshold = SCROLL_TO_TOP_THRESHOLD,
  className,
}: ScrollToTopButtonProps) {
  const { isAboveThreshold } = useScrollPosition(threshold);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isAboveThreshold) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg",
        "animate-in fade-in duration-200",
        className
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
