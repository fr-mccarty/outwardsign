import { Badge } from "@/components/ui/badge"
import { READING_CATEGORY_LABELS } from "@/lib/constants"

interface ReadingCategoryLabelProps {
  category: string
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
}

// Normalize category for display (handle both uppercase and lowercase with suffixes)
const normalizeCategory = (category: string): string => {
  // Remove numeric suffixes and convert to uppercase (baptism-1 → BAPTISM)
  return category.replace(/-\d+$/, '').toUpperCase()
}

// Get display label for a category
const getCategoryLabel = (category: string): string => {
  const normalized = normalizeCategory(category)
  return READING_CATEGORY_LABELS[normalized]?.en || category
}

export function ReadingCategoryLabel({ category, variant = "secondary", className }: ReadingCategoryLabelProps) {
  return (
    <Badge variant={variant} className={className}>
      {getCategoryLabel(category)}
    </Badge>
  )
}
