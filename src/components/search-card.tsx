import { ReactNode } from 'react'
import { FormSectionCard } from "@/components/form-section-card"

interface SearchCardProps {
  /** The title for the search card (e.g., "Search Weddings") */
  title: string
  /** Content to render inside the card */
  children: ReactNode
  /** Optional className to apply to the card */
  className?: string
}

export function SearchCard({
  title,
  children,
  className
}: SearchCardProps) {
  return (
    <FormSectionCard
      title={title}
      className={className}
    >
      {children}
    </FormSectionCard>
  )
}
