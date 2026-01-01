'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { LinkButton } from '@/components/link-button'
import { User, BookOpen, Tag, Calendar, Church, FileText, Wrench, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SettingsSectionLinkProps {
  icon: React.ElementType
  title: string
  description: string
  href: string
}

function SettingsSectionLink({ icon: Icon, title, description, href }: SettingsSectionLinkProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-base">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        <LinkButton href={href} className="w-full justify-between">
          {title}
          <ChevronRight className="h-4 w-4" />
        </LinkButton>
      </CardContent>
    </Card>
  )
}

export function SettingsHubClient() {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SettingsSectionLink
        icon={User}
        title={t('settings.sections.personal')}
        description={t('settings.userPreferencesDescription')}
        href="/settings/user"
      />
      <SettingsSectionLink
        icon={BookOpen}
        title={t('settings.sections.massConfiguration')}
        description={t('settings.sections.massConfigurationDescription')}
        href="/settings/mass-configuration"
      />
      <SettingsSectionLink
        icon={Tag}
        title={t('nav.specialLiturgies')}
        description={t('settings.specialLiturgies.description')}
        href="/settings/special-liturgies"
      />
      <SettingsSectionLink
        icon={Calendar}
        title={t('settings.sections.parishEvents')}
        description={t('settings.sections.parishEventsDescription')}
        href="/settings/parish-events"
      />
      <SettingsSectionLink
        icon={Church}
        title={t('settings.sections.parish')}
        description={t('settings.parishSettingsDescription')}
        href="/settings/parish"
      />
      <SettingsSectionLink
        icon={FileText}
        title={t('settings.sections.contentData')}
        description={t('settings.sections.contentDataDescription')}
        href="/settings/content-data"
      />
      <SettingsSectionLink
        icon={Wrench}
        title={t('settings.sections.developer')}
        description={t('settings.developerTools.description')}
        href="/settings/developer-tools"
      />
    </div>
  )
}
