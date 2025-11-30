"use client";

import { useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  threshold?: number;
}

/**
 * Hook to handle infinite scroll logic for loading more results
 *
 * @param onLoadMore - Callback to fetch next page
 * @param hasMore - Whether more results exist
 * @param threshold - Distance from bottom to trigger load (default 100px)
 * @returns sentinelRef to attach to bottom element and loading state
 *
 * @example
 * const { sentinelRef, isLoading } = useInfiniteScroll({
 *   onLoadMore: fetchNextPage,
 *   hasMore: hasNextPage
 * });
 *
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={sentinelRef} />
 *     {isLoading && <Spinner />}
 *   </>
 * );
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          try {
            await onLoadMore();
          } catch (error) {
            console.error("Failed to load more:", error);
          } finally {
            setIsLoading(false);
          }
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return {
    sentinelRef,
    isLoading,
  };
}
