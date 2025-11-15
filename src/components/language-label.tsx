import { Badge } from "@/components/ui/badge"
import { LANGUAGE_LABELS } from "@/lib/constants"

interface LanguageLabelProps {
  language: string
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost"
  className?: string
}

// Get display label for a language
const getLanguageLabel = (language: string): string => {
  return LANGUAGE_LABELS[language]?.en || language
}

export function LanguageLabel({ language, variant = "ghost", className }: LanguageLabelProps) {
  return (
    <Badge variant={variant} className={className}>
      {getLanguageLabel(language)}
    </Badge>
  )
}
