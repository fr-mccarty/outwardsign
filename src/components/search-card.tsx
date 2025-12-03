import { ReactNode } from 'react'
import { ContentCard } from "@/components/content-card"

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
 * Uses ContentCard with a manual header for vertical compactness
 */
export function SearchCard({
  title,
  children,
  className
}: SearchCardProps) {
  return (
    <ContentCard className={`!pt-5 !px-6 !pb-5 ${className || ''}`}>
      <div className="space-y-3">
        <h3 className="text-base font-medium">{title}</h3>
        {children}
      </div>
    </ContentCard>
  )
}
