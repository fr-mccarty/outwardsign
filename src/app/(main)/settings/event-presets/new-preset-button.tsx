'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InfoDialog } from '@/components/info-dialog'
import { Plus, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function NewPresetButton() {
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        {t('settings.newPreset')}
      </Button>

      <InfoDialog
        open={open}
        onOpenChange={setOpen}
        title={t('settings.createPresetTitle')}
        description={t('settings.createPresetDescription')}
        primaryAction={{
          label: t('settings.goToEvents'),
          href: '/events',
          icon: <ExternalLink className="h-4 w-4 ml-2" />,
        }}
      >
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>{t('settings.createPresetStep1')}</li>
          <li>{t('settings.createPresetStep2')}</li>
          <li>{t('settings.createPresetStep3')}</li>
        </ol>
      </InfoDialog>
    </>
  )
}
