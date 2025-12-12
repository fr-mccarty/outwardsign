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
  Calendar,
  Settings,
  Church,
  User, Users, Users2, CirclePlus, Plus, List,
  CalendarDays, Building, LayoutTemplate, UserCog, UsersIcon, Clock, HelpCircle, ScrollText,
  Library, Tag
} from "lucide-react"
import Link from "next/link"
import { ParishUserMenu } from "@/components/parish-user-menu"
import { CollapsibleNavSection } from "@/components/collapsible-nav-section"
import { Logo } from "@/components/logo"
import {APP_NAME, APP_TAGLINE} from "@/lib/constants";
import { getLucideIcon } from "@/lib/utils/lucide-icons"
import type { DynamicEventType } from "@/lib/types"

interface MainSidebarProps {
  eventTypes: DynamicEventType[]
}

export function MainSidebar({ eventTypes }: MainSidebarProps) {
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
                <Logo size="medium" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                  <span className="truncate text-xs">{APP_TAGLINE}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="pb-16">
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
                  <Link href="/calendar?view=month" onClick={handleLinkClick}>
                    <Calendar />
                    <span>Calendar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <CollapsibleNavSection
                name="Events"
                icon={CalendarDays}
                items={[
                  {
                    title: "Our Events",
                    url: "/events",
                    icon: CalendarDays,
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
                name="Locations"
                icon={Building}
                items={[
                  {
                    title: "Our Locations",
                    url: "/locations",
                    icon: Building,
                  },
                  {
                    title: "New Location",
                    url: "/locations/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Mass Intentions"
                icon={ScrollText}
                items={[
                  {
                    title: "Our Mass Intentions",
                    url: "/mass-intentions",
                    icon: ScrollText,
                  },
                  {
                    title: "Create Mass Intention",
                    url: "/mass-intentions/create",
                    icon: Plus,
                  },
                  {
                    title: "Report",
                    url: "/mass-intentions/report",
                    icon: FileText,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Mass Scheduling"
                icon={Clock}
                items={[
                  {
                    title: "Schedule Masses",
                    url: "/masses/schedule",
                    icon: CalendarDays,
                  },
                  {
                    title: "Mass Times Templates",
                    url: "/mass-times-templates",
                    icon: Clock,
                  },
                  {
                    title: "Mass Role Templates",
                    url: "/mass-role-templates",
                    icon: LayoutTemplate,
                  },
                  {
                    title: "Mass Roles",
                    url: "/mass-roles",
                    icon: UserCog,
                  },
                  {
                    title: "Role Members",
                    url: "/mass-role-members",
                    icon: UsersIcon,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="Masses"
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
                name="Families"
                icon={Users2}
                items={[
                  {
                    title: "Our Families",
                    url: "/families",
                    icon: Users2,
                  },
                  {
                    title: "Create Family",
                    url: "/families/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <SidebarMenuItem key="WeekendSummary">
                <SidebarMenuButton asChild>
                  <Link href="/weekend-summary" onClick={handleLinkClick}>
                    <CalendarDays />
                    <span>Weekend Summary</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Event Types Section */}
        {eventTypes.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Event Types</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {eventTypes.map((eventType) => {
                  const Icon = getLucideIcon(eventType.icon)
                  const slug = eventType.slug || eventType.id // Fallback to ID if slug missing
                  return (
                    <CollapsibleNavSection
                      key={eventType.id}
                      name={eventType.name}
                      icon={Icon}
                      items={[
                        {
                          title: `Our ${eventType.name}s`,
                          url: `/events?type=${slug}`,
                          icon: Icon,
                        },
                        {
                          title: `New ${eventType.name}`,
                          url: `/events/create?type=${slug}`,
                          icon: Plus,
                        },
                      ]}
                      defaultOpen={false}
                    />
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings section at the bottom */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <CollapsibleNavSection
                name="Parish Settings"
                icon={Church}
                items={[
                  {
                    title: "General",
                    url: "/settings/parish/general",
                    icon: Settings,
                  },
                  {
                    title: "Event Types",
                    url: "/settings/event-types",
                    icon: CalendarDays,
                  },
                  {
                    title: "Content Library",
                    url: "/settings/content-library",
                    icon: Library,
                  },
                  {
                    title: "Category Tags",
                    url: "/settings/category-tags",
                    icon: Tag,
                  },
                  {
                    title: "Custom Lists",
                    url: "/settings/custom-lists",
                    icon: List,
                  },
                  {
                    title: "Mass Intentions",
                    url: "/settings/parish/mass-intentions",
                    icon: ScrollText,
                  },
                  {
                    title: "Petitions",
                    url: "/settings/parish/petitions",
                    icon: FileText,
                  },
                  {
                    title: "Users",
                    url: "/settings/parish/users",
                    icon: Users,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name="User Settings"
                icon={User}
                items={[
                  {
                    title: "General",
                    url: "/settings/user",
                    icon: Settings,
                  },
                ]}
                defaultOpen={false}
              />

              <SidebarMenuItem key="Support">
                <SidebarMenuButton asChild>
                  <Link href="/support" onClick={handleLinkClick}>
                    <HelpCircle />
                    <span>Support</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

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
