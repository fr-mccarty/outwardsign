import { MainSidebar } from "@/components/main-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";
import { TestingBanner } from "@/components/testing-banner";
import { AppLanguageProvider } from "@/components/app-language-provider";
import { getActiveEventTypes } from "@/lib/actions/event-types";
import type { EventType } from "@/lib/types";
import { DEFAULT_APP_LANGUAGE } from "@/i18n/config";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch event types for sidebar navigation
  let eventTypes: EventType[] = []

  try {
    eventTypes = await getActiveEventTypes()
  } catch (error) {
    // If we can't get event types, just show empty array
    console.error('Error fetching event types for sidebar:', error)
  }

  // Load default messages for initial render
  const messages = (await import(`@/i18n/locales/${DEFAULT_APP_LANGUAGE}.json`)).default

  return (
    <AppLanguageProvider messages={messages}>
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
    </AppLanguageProvider>
  );
}