import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FormSectionCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

/**
 * FormSectionCard - Reusable card component for form sections
 *
 * Usage:
 * <FormSectionCard title="Section Title" description="Optional description">
 *   <FormField ... />
 *   <FormField ... />
 * </FormSectionCard>
 *
 * Features:
 * - Consistent card styling across all forms
 * - Optional description below title
 * - CardContent with space-y-4 for vertical spacing of form fields
 */
export function FormSectionCard({
  title,
  description,
  children,
  className,
  contentClassName
}: FormSectionCardProps) {
  return (
    <Card className={cn("bg-card text-card-foreground border", className)}>
      <CardHeader>
        <CardTitle className={!description ? "mb-2" : ""}>{title}</CardTitle>
        {description && <CardDescription className="mb-2">{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
