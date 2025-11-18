import { MainSidebar } from "@/components/main-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";
import { TestingBanner } from "@/components/testing-banner";
import { createClient } from "@/lib/supabase/server";
import { getUserParishRole, type UserParishRole } from "@/lib/auth/permissions";
import { getSelectedParishId } from "@/lib/auth/parish";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user permissions for sidebar filtering
  let userParish: UserParishRole | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const parishId = await getSelectedParishId()
      if (parishId) {
        userParish = await getUserParishRole(user.id, parishId)
      }
    }
  } catch (error) {
    // If we can't get permissions, just show default sidebar (will redirect on route access)
    console.error('Error fetching user permissions for sidebar:', error)
  }

  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <MainSidebar userParish={userParish} />
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