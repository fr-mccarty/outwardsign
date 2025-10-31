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
  Flower,
  Calendar,
  Settings,
  Church,
  Heart, ClipboardList, User, Users, Flame, Waves, CirclePlus, Plus, HandHeartIcon, VenusAndMars, List, Droplet, Cross
} from "lucide-react"
import Link from "next/link"
import { ParishUserMenu } from "@/components/parish-user-menu"
import { CollapsibleNavSection } from "@/components/collapsible-nav-section"
import {APP_NAME, APP_TAGLINE} from "@/lib/constants";

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
                  <Flower className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                  <span className="truncate text-xs">{APP_TAGLINE}</span>
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

              <SidebarMenuItem key="Calendar">
                <SidebarMenuButton asChild>
                  <Link href="/calendar" onClick={handleLinkClick}>
                    <Calendar />
                    <span>Calendar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <CollapsibleNavSection
                name="Events"
                icon={Calendar}
                items={[
                  {
                    title: "Our Events",
                    url: "/events",
                    icon: Calendar,
                  },
                  {
                    title: "Create Event",
                    url: "/events/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Reading"
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
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Mass"
                icon={CirclePlus}
                items={[
                  {
                    title: "Our Masses",
                    url: "/masses",
                    icon: CirclePlus,
                  },
                  {
                    title: "New Mass",
                    url: "/masses/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Wedding"
                icon={VenusAndMars}
                items={[
                  {
                    title: "Our Weddings",
                    url: "/weddings",
                    icon: VenusAndMars,
                  },
                  {
                    title: "New Wedding",
                    url: "/weddings/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Funeral"
                icon={Cross}
                items={[
                  {
                    title: "Our Funerals",
                    url: "/funerals",
                    icon: Cross,
                  },
                  {
                    title: "New Funeral",
                    url: "/funerals/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="People"
                icon={User}
                items={[
                  {
                    title: "Our People",
                    url: "/people",
                    icon: User,
                  },
                  {
                    title: "Create Person",
                    url: "/people/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Groups"
                icon={Users}
                items={[
                  {
                    title: "Our Groups",
                    url: "/groups",
                    icon: Users,
                  },
                  {
                    title: "New Group",
                    url: "/groups",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Mass Intention"
                icon={List}
                items={[
                  {
                    title: "Our Mass Intentions",
                    url: "/mass-intentions",
                    icon: List,
                  },
                  {
                    title: "Create Mass Intention",
                    url: "/mass-intentions/create",
                    icon: Plus,
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
                name="Baptism"
                icon={Droplet}
                items={[
                  {
                    title: "Our Baptisms",
                    url: "/baptisms",
                    icon: Droplet,
                  },
                  {
                    title: "New Baptisms",
                    url: "/baptisms/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Confirmation"
                icon={Flame}
                items={[
                  {
                    title: "Our Confirmations",
                    url: "/confirmations",
                    icon: Flame,
                  },
                  {
                    title: "New Confirmation",
                    url: "/confirmations",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Presentations"
                icon={HandHeartIcon}
                items={[
                  {
                    title: "Our Presentations",
                    url: "/presentations",
                    icon: HandHeartIcon,
                  },
                  {
                    title: "New Presentation",
                    url: "/presentations/create",
                    icon: Plus,
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
