'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface ModuleCancelButtonProps {
  href: string
  disabled?: boolean
}

/**
 * ModuleCancelButton
 *
 * Standardized cancel button for all module forms.
 * Displays "Cancel" without module name.
 *
 * Usage:
 * <ModuleCancelButton href="/weddings" disabled={isLoading} />
 */
export function ModuleCancelButton({ href, disabled }: ModuleCancelButtonProps) {
  const t = useTranslations('components.buttons')

  return (
    <Button variant="outline" asChild disabled={disabled}>
      <Link href={href}>{t('cancel')}</Link>
    </Button>
  )
}
