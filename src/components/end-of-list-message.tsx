"use client";

interface EndOfListMessageProps {
  show: boolean;
  className?: string;
}

/**
 * EndOfListMessage Component
 *
 * Displays an "end of list" message when infinite scroll has loaded all available items.
 * Should be rendered after the DataTable component in list views.
 *
 * @param show - Whether to display the message (typically !hasMore && data.length > 0)
 * @param className - Optional additional CSS classes
 *
 * @example
 * ```tsx
 * <DataTable ... />
 * <EndOfListMessage show={!hasMore && people.length > 0} />
 * ```
 */
export function EndOfListMessage({ show, className = "" }: EndOfListMessageProps) {
  if (!show) return null;

  return (
    <div
      className={`py-1 text-center text-sm text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
    >
      You&apos;ve reached the end of the list
    </div>
  );
}
