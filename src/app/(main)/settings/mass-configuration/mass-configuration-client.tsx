'use client'

import { BookOpen, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SettingsSectionCard } from '../settings-section-card'

export function MassConfigurationClient() {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SettingsSectionCard
        icon={BookOpen}
        title={t('settings.massTypes.title')}
        description={t('settings.massTypes.description')}
        href="/settings/mass-liturgies"
        buttonText={t('settings.massTypes.button')}
        badge={t('settings.massTypes.stepBadge')}
      />
      <SettingsSectionCard
        icon={Clock}
        title={t('settings.massSchedulesCard')}
        description={t('settings.massSchedulesCardDescription')}
        href="/settings/mass-schedules"
        buttonText={t('settings.manageMassSchedules')}
        badge={t('settings.massSchedules.stepBadge')}
      />
    </div>
  )
}
