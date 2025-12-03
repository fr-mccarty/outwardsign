import { requireParishionerAuth } from '@/lib/parishioner-auth/middleware'
import { getParishionerSession } from '@/lib/parishioner-auth/actions'
import { getUnreadNotificationCount } from './notifications/actions'
import { ParishionerNavigation } from './parishioner-navigation'
import { LanguageProvider } from './language-context'

export default async function ParishionerPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireParishionerAuth()

  // Get session to retrieve person ID
  const session = await getParishionerSession()
  const personId = session?.personId || ''

  // Get unread notification count
  const unreadCount = personId ? await getUnreadNotificationCount(personId) : 0

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile: Bottom Tab Navigation */}
        {/* Desktop: Sidebar Navigation */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Desktop Sidebar - hidden on mobile */}
          <aside className="hidden md:flex md:w-64 border-r bg-card">
            <ParishionerNavigation variant="sidebar" unreadCount={unreadCount} />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>

          {/* Mobile Bottom Tabs - hidden on desktop */}
          <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t bg-card">
            <ParishionerNavigation variant="bottom-tabs" unreadCount={unreadCount} />
          </nav>
        </div>
      </div>
    </LanguageProvider>
  )
}
