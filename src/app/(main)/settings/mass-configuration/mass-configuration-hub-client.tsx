'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { ChevronRight, CalendarDays, LayoutTemplate, UserCog, Users } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function MassConfigurationHubClient() {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t('nav.recurringMassSchedule')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.massConfigurationHub.recurringScheduleDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/mass-configuration/recurring-schedule">
              {t('settings.massConfigurationHub.manageSchedule')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            {t('nav.roleAssignmentPatterns')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.massConfigurationHub.rolePatternsDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/mass-configuration/role-patterns">
              {t('settings.massConfigurationHub.managePatterns')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <UserCog className="h-5 w-5 text-primary" />
            {t('nav.roleDefinitions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.massConfigurationHub.roleDefinitionsDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/mass-configuration/role-definitions">
              {t('settings.massConfigurationHub.manageRoles')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            {t('nav.ministryVolunteers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('settings.massConfigurationHub.volunteersDescription')}
          </p>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/settings/mass-configuration/ministry-volunteers">
              {t('settings.massConfigurationHub.manageVolunteers')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
