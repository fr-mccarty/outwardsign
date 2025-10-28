"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Home,
  FileText,
  BookOpen,
  UserCheck,
  ClipboardList,
  Calendar,
  Settings,
  Sparkles,
  Users,
  User,
  Church,
  Megaphone,
  Heart
} from "lucide-react"
import Link from "next/link"
import { ParishUserMenu } from "@/components/parish-user-menu"
import { CollapsibleNavSection } from "@/components/collapsible-nav-section"
import {APP_NAME} from "@/lib/constants";

export function MainSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" onClick={handleLinkClick}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Church className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                  <span className="truncate text-xs">Liturgical Tools</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem key="Dashboard">
                <SidebarMenuButton asChild>
                  <Link href="/dashboard" onClick={handleLinkClick}>
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <CollapsibleNavSection
                name="Readings"
                icon={BookOpen}
                items={[
                  {
                    title: "Our Readings",
                    url: "/readings",
                    icon: BookOpen,
                  },
                  {
                    title: "Create Reading",
                    url: "/readings/create",
                    icon: Sparkles,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Liturgical Readings"
                icon={BookOpen}
                items={[
                  {
                    title: "Our Liturgical Readings",
                    url: "/liturgical-readings",
                    icon: BookOpen,
                  },
                  {
                    title: "Create Liturgical Reading",
                    url: "/liturgical-readings/create",
                    icon: Sparkles,
                  },
                  {
                    title: "Calendar View",
                    url: "/liturgical-readings/calendar",
                    icon: Calendar,
                  },
                ]}
                defaultOpen={false}
              />

              {/* <CollapsibleNavSection
                name="Liturgy"
                icon={ClipboardList}
                items={[
                  {
                    title: "Liturgy Planning",
                    url: "/liturgy-planning",
                    icon: ClipboardList,
                  },
                  {
                    title: "Create Liturgy",
                    url: "/liturgy/wizard",
                    icon: Sparkles,
                  },
                  {
                    title: "Liturgical Calendar",
                    url: "/calendar",
                    icon: Calendar,
                  },
                ]}
                defaultOpen={false}
              /> */}

              {/* <CollapsibleNavSection
                name="Ministry"
                icon={UserCheck}
                items={[
                  {
                    title: "Ministers Directory",
                    url: "/ministers",
                    icon: UserCheck,
                  },
                  {
                    title: "People",
                    url: "/people",
                    icon: User,
                  },
                  {
                    title: "Groups",
                    url: "/groups",
                    icon: Users,
                  },
                  {
                    title: "Ministries",
                    url: "/ministries",
                    icon: Sparkles,
                  },
                  {
                    title: "Event Templates",
                    url: "/liturgical-event-templates",
                    icon: FileText,
                  },
                ]}
                defaultOpen={false}
              /> */}

              <CollapsibleNavSection
                name="Mass Intentions"
                icon={Heart}
                items={[
                  {
                    title: "All Mass Intentions",
                    url: "/mass-intentions",
                    icon: Heart,
                  },
                  {
                    title: "Create Mass Intention",
                    url: "/mass-intentions/create",
                    icon: Sparkles,
                  },
                  {
                    title: "Calendar View",
                    url: "/mass-intentions/calendar",
                    icon: Calendar,
                  },
                  {
                    title: "Admin View",
                    url: "/mass-intentions/admin",
                    icon: Settings,
                  },
                  {
                    title: "Print Report",
                    url: "/mass-intentions-print",
                    icon: FileText,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Petitions"
                icon={FileText}
                items={[
                  {
                    title: "Our Petitions",
                    url: "/petitions",
                    icon: FileText,
                  },
                  {
                    title: "Create Petition",
                    url: "/petitions/create",
                    icon: Sparkles,
                  },
                  {
                    title: "Calendar View",
                    url: "/petitions/calendar",
                    icon: Calendar,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Announcements"
                icon={Megaphone}
                items={[
                  {
                    title: "Our Announcements",
                    url: "/announcements",
                    icon: Megaphone,
                  },
                  {
                    title: "Create Announcement",
                    url: "/announcements/create",
                    icon: Sparkles,
                  },
                  {
                    title: "Calendar View",
                    url: "/announcements/calendar",
                    icon: Calendar,
                  },
                  {
                    title: "Templates",
                    url: "/announcements/templates",
                    icon: FileText,
                  },
                ]}
                defaultOpen={false}
              />

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings section at the bottom */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <CollapsibleNavSection
                name="Settings"
                icon={Settings}
                items={[
                  {
                    title: "Parish Settings",
                    url: "/settings/parish",
                    icon: Church,
                  },
                  {
                    title: "Readings",
                    url: "/settings/readings",
                    icon: BookOpen,
                  },
                  {
                    title: "Categories",
                    url: "/settings/categories",
                    icon: FileText,
                  },
                ]}
                defaultOpen={false}
              />

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <ParishUserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
