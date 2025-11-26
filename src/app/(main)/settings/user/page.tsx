import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserSettings } from '@/lib/actions/user-settings'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { UserSettingsClient } from './user-settings-client'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UserSettingsPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Load user settings
  const userSettings = await getUserSettings()

  if (!userSettings) {
    return (
      <>
        <BreadcrumbSetter breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "User Preferences" }
        ]} />
        <PageContainer
          title="User Preferences"
          description="Customize your liturgical planning experience"
        >
          <ContentCard className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Unable to Load Settings</h3>
            <p className="text-muted-foreground">
              There was an error loading your settings. Please try again later.
            </p>
          </ContentCard>
        </PageContainer>
      </>
    )
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "User Preferences" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <UserSettingsClient
        user={user}
        userSettings={userSettings}
      />
    </>
  )
}
