import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye } from 'lucide-react'

interface ModuleViewButtonProps {
  moduleName: string  // The module name (e.g., "Wedding", "Location")
  href: string        // View page URL (e.g., "/weddings/123")
}

/**
 * Standardized view button for module edit pages.
 * Shows "View [ModuleName]" with Eye icon.
 * Only displayed in edit mode (when entity exists).
 */
export function ModuleViewButton({ moduleName, href }: ModuleViewButtonProps) {
  return (
    <Button variant="outline" asChild>
      <Link href={href}>
        <Eye className="h-4 w-4 mr-2" />
        View {moduleName}
      </Link>
    </Button>
  )
}
