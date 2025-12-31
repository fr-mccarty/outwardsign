'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { User, FileText, ChevronRight, Church, Calendar, Tag, FileStack, BookOpen, Wrench } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function SettingsHubClient() {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            {t('settings.userPreferences')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.userPreferencesDescription')}
          </p>
          <Button asChild className="w-full justify-between">
            <Link href="/settings/user">
              {t('settings.configurePreferences')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            {t('settings.events.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.events.description')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/events">
              {t('settings.manageEvents')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-primary" />
            {t('settings.specialLiturgies.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.specialLiturgies.description')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/special-liturgies">
              {t('settings.manageSpecialLiturgies')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            {t('settings.customLists')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.customListsDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/custom-lists">
              {t('settings.manageCustomLists')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            {t('settings.petitionSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.petitionSettingsDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/petitions">
              {t('settings.managePetitions')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Church className="h-5 w-5 text-primary" />
            {t('settings.parishSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.parishSettingsDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/parish">
              {t('settings.manageParish')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('settings.massConfiguration')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.massConfigurationDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/mass-liturgies">
              {t('settings.manageMassConfiguration')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            {t('settings.contentLibrary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.contentLibraryDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/content-library">
              {t('settings.manageContentLibrary')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-primary" />
            {t('settings.categoryTags')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.categoryTagsDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/category-tags">
              {t('settings.manageCategoryTags')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileStack className="h-5 w-5 text-primary" />
            {t('settings.eventPresets')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.eventPresetsDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/event-presets">
              {t('settings.manageEventPresets')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-primary" />
            {t('settings.developerTools.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.developerTools.description')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/developer-tools">
              {t('settings.developerTools.manageDeveloperTools')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
