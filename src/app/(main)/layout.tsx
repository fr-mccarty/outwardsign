import { MainSidebar } from "@/components/main-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";
import { DeveloperProvider } from "@/components/developer-context";
import { TestingBanner } from "@/components/testing-banner";
import { AppLanguageProvider } from "@/components/app-language-provider";
import { getActiveEventTypes } from "@/lib/actions/event-types";
import { checkIsDeveloper } from "@/lib/auth/developer";
import { checkAndSeedDemoParish } from "@/lib/demo-seeding/check-and-seed";
import type { EventType } from "@/lib/types";
import { DEFAULT_APP_LANGUAGE } from "@/i18n/config";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch event types, developer status, and trigger demo seeding in parallel
  const [eventTypesResult, developerResult] = await Promise.allSettled([
    getActiveEventTypes(),
    checkIsDeveloper(),
    checkAndSeedDemoParish(), // Auto-seeds demo parish on first access (no-op if already seeded)
  ])

  const eventTypes: EventType[] = eventTypesResult.status === 'fulfilled'
    ? eventTypesResult.value
    : []

  const { isDeveloper, email: developerEmail } = developerResult.status === 'fulfilled'
    ? developerResult.value
    : { isDeveloper: false, email: null }

  if (eventTypesResult.status === 'rejected') {
    console.error('Error fetching event types for sidebar:', eventTypesResult.reason)
  }

  // Load default messages for initial render
  const messages = (await import(`@/i18n/locales/${DEFAULT_APP_LANGUAGE}.json`)).default

  return (
    <AppLanguageProvider messages={messages}>
      <DeveloperProvider isDeveloper={isDeveloper} developerEmail={developerEmail}>
        <SidebarProvider>
          <BreadcrumbProvider>
            <MainSidebar eventTypes={eventTypes} />
            <div className="flex-1">
              <MainHeader />
              <TestingBanner />
              <main>
                {children}
              </main>
            </div>
          </BreadcrumbProvider>
        </SidebarProvider>
      </DeveloperProvider>
    </AppLanguageProvider>
  );
}