import { Badge } from "@/components/ui/badge"

interface ActiveInactiveBadgeProps {
  isActive: boolean
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
  language?: 'en' | 'es'
}

const ACTIVE_LABELS = {
  en: 'Active',
  es: 'Activo'
}

const INACTIVE_LABELS = {
  en: 'Inactive',
  es: 'Inactivo'
}

export function ActiveInactiveBadge({
  isActive,
  variant,
  className,
  language = 'en'
}: ActiveInactiveBadgeProps) {
  const badgeVariant = variant || (isActive ? 'default' : 'secondary')
  const label = isActive ? ACTIVE_LABELS[language] : INACTIVE_LABELS[language]

  return (
    <Badge variant={badgeVariant} className={className}>
      {label}
    </Badge>
  )
}
