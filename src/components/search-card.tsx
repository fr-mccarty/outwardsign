import { ReactNode } from 'react'
import { ContentCard } from "@/components/content-card"
import { cn } from "@/lib/utils"

interface SearchCardProps {
  /** The title for the search card (e.g., "Search Weddings") */
  title: string
  /** Content to render inside the card */
  children: ReactNode
  /** Optional className to apply to the card */
  className?: string
}

/**
 * SearchCard - Compact card component for search/filter sections
 *
 * Uses ContentCard with a manual header for vertical compactness.
 * Uses py-5 px-6 for slightly tighter padding than default ContentCard (py-6).
 */
export function SearchCard({
  title,
  children,
  className
}: SearchCardProps) {
  return (
    <ContentCard className={cn("py-5 px-6", className)}>
      <div className="space-y-3">
        <h3 className="text-base font-medium">{title}</h3>
        {children}
      </div>
    </ContentCard>
  )
}
