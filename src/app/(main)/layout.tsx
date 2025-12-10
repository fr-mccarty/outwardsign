import { MainSidebar } from "@/components/main-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";
import { TestingBanner } from "@/components/testing-banner";
import { getActiveEventTypes } from "@/lib/actions/event-types";
import type { DynamicEventType } from "@/lib/types";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch event types for sidebar navigation
  let eventTypes: DynamicEventType[] = []

  try {
    eventTypes = await getActiveEventTypes()
  } catch (error) {
    // If we can't get event types, just show empty array
    console.error('Error fetching event types for sidebar:', error)
  }

  return (
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
  );
}