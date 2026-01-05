'use client'

import { LinkButton } from '@/components/link-button'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ModuleCreateButtonProps {
  moduleName: string
  href: string
}

/**
 * ModuleCreateButton
 *
 * Standardized create button for all module list pages.
 * Displays "Create [ModuleName]" with a plus icon.
 *
 * Usage:
 * <ModuleCreateButton moduleName="Wedding" href="/weddings/create" />
 */
export function ModuleCreateButton({ moduleName, href }: ModuleCreateButtonProps) {
  const t = useTranslations('common')

  return (
    <LinkButton href={href}>
      <Plus className="h-4 w-4 mr-2" />
      {t('create')} {moduleName}
    </LinkButton>
  )
}
