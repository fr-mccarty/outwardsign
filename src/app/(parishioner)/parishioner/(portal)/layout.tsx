import { requireParishionerAuth } from '@/lib/parishioner-auth/middleware'
import { ParishionerNavigation } from './parishioner-navigation'

export default async function ParishionerPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireParishionerAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile: Bottom Tab Navigation */}
      {/* Desktop: Sidebar Navigation */}
      <div className="flex flex-col md:flex-row h-screen">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden md:flex md:w-64 border-r bg-card">
          <ParishionerNavigation variant="sidebar" />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Tabs - hidden on desktop */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t bg-card">
          <ParishionerNavigation variant="bottom-tabs" />
        </nav>
      </div>
    </div>
  )
}
