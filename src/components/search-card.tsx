import { ReactNode } from 'react'
import { FormSectionCard } from "@/components/form-section-card"

interface SearchCardProps {
  /** The plural module name for the title (e.g., "Weddings", "Funerals") */
  modulePlural: string
  /** The singular module name for the description (e.g., "Wedding", "Funeral") */
  moduleSingular: string
  /** Content to render inside the card */
  children: ReactNode
}

export function SearchCard({
  modulePlural,
  moduleSingular,
  children
}: SearchCardProps) {
  return (
    <FormSectionCard
      title={`Search ${modulePlural}`}
      description={`Search for a ${moduleSingular}`}
    >
      {children}
    </FormSectionCard>
  )
}
