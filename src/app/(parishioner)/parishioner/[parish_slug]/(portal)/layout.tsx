import { requireParishionerAuth } from '@/lib/parishioner-auth/middleware'
import { getUnreadNotificationCount } from './notifications/actions'
import { ParishionerNavigation } from './parishioner-navigation'
import { LanguageProvider } from './language-context'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ parish_slug: string }>
}

export default async function ParishionerPortalLayout({ children, params }: LayoutProps) {
  const { parish_slug } = await params

  // Validate auth and parish slug match
  const auth = await requireParishionerAuth(parish_slug)

  // Get unread notification count
  const unreadCount = await getUnreadNotificationCount(auth.personId)

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile: Bottom Tab Navigation */}
        {/* Desktop: Sidebar Navigation */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Desktop Sidebar - hidden on mobile */}
          <aside className="hidden md:flex md:w-64 border-r bg-card">
            <ParishionerNavigation
              variant="sidebar"
              unreadCount={unreadCount}
              parishSlug={parish_slug}
              parishName={auth.parishName}
            />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>

          {/* Mobile Bottom Tabs - hidden on desktop */}
          <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t bg-card">
            <ParishionerNavigation
              variant="bottom-tabs"
              unreadCount={unreadCount}
              parishSlug={parish_slug}
              parishName={auth.parishName}
            />
          </nav>
        </div>
      </div>
    </LanguageProvider>
  )
}
