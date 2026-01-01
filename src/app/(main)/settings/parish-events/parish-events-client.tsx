'use client'

import { Calendar, FileStack } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SettingsSectionCard } from '../settings-section-card'

export function ParishEventsClient() {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SettingsSectionCard
        icon={Calendar}
        title={t('settings.events.title')}
        description={t('settings.events.description')}
        href="/settings/events"
        buttonText={t('settings.manageEvents')}
      />
      <SettingsSectionCard
        icon={FileStack}
        title={t('settings.eventPresets')}
        description={t('settings.eventPresetsDescription')}
        href="/settings/event-presets"
        buttonText={t('settings.manageEventPresets')}
      />
    </div>
  )
}
