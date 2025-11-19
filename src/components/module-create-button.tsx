import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface ModuleCreateButtonProps {
  moduleName: string
  href: string
}

/**
 * ModuleCreateButton
 *
 * Standardized create button for all module list pages.
 * Displays "New [ModuleName]" with a plus icon.
 *
 * Usage:
 * <ModuleCreateButton moduleName="Wedding" href="/weddings/create" />
 */
export function ModuleCreateButton({ moduleName, href }: ModuleCreateButtonProps) {
  return (
    <Button asChild>
      <Link href={href}>
        <Plus className="h-4 w-4 mr-2" />
        New {moduleName}
      </Link>
    </Button>
  )
}
