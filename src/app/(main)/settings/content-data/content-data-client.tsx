'use client'

import { FileText, List, HandHeart, Tag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SettingsSectionCard } from '../settings-section-card'

export function ContentDataClient() {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SettingsSectionCard
        icon={FileText}
        title={t('settings.contentLibrary')}
        description={t('settings.contentLibraryDescription')}
        href="/settings/content-library"
        buttonText={t('settings.manageContentLibrary')}
      />
      <SettingsSectionCard
        icon={List}
        title={t('settings.customLists')}
        description={t('settings.customListsDescription')}
        href="/settings/custom-lists"
        buttonText={t('settings.manageCustomLists')}
      />
      <SettingsSectionCard
        icon={HandHeart}
        title={t('settings.petitionSettings')}
        description={t('settings.petitionSettingsDescription')}
        href="/settings/petitions"
        buttonText={t('settings.managePetitions')}
      />
      <SettingsSectionCard
        icon={Tag}
        title={t('settings.categoryTags')}
        description={t('settings.categoryTagsDescription')}
        href="/settings/category-tags"
        buttonText={t('settings.manageCategoryTags')}
      />
    </div>
  )
}
