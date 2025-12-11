import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserSettings } from '@/lib/actions/user-settings'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { UserSettingsClient } from './user-settings-client'
import { PageContainer } from '@/components/page-container'
import { EmptyState } from '@/components/empty-state'
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
          <EmptyState
            icon={<User className="h-16 w-16" />}
            title="Unable to Load Settings"
            description="There was an error loading your settings. Please try again later."
          />
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
