import { MainSidebar } from "@/components/main-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <MainSidebar />
        <div className="flex-1">
          <MainHeader />
          <main>
            {children}
          </main>
        </div>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}