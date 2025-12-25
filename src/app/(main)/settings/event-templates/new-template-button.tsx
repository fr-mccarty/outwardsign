'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InfoDialog } from '@/components/info-dialog'
import { Plus, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function NewTemplateButton() {
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        {t('settings.newTemplate')}
      </Button>

      <InfoDialog
        open={open}
        onOpenChange={setOpen}
        title={t('settings.createTemplateTitle')}
        description={t('settings.createTemplateDescription')}
        primaryAction={{
          label: t('settings.goToEvents'),
          href: '/events',
          icon: <ExternalLink className="h-4 w-4 ml-2" />,
        }}
      >
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>{t('settings.createTemplateStep1')}</li>
          <li>{t('settings.createTemplateStep2')}</li>
          <li>{t('settings.createTemplateStep3')}</li>
        </ol>
      </InfoDialog>
    </>
  )
}
