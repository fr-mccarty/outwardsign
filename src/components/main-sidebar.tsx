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
  Heart, ClipboardList, User, Users, Flame, Waves, CirclePlus, Plus, HandHeartIcon, VenusAndMars, List, Droplet, Cross,
  BookHeart, CalendarDays, Building, LayoutTemplate, UserCog, UsersIcon, Clock
} from "lucide-react"
import Link from "next/link"
import { ParishUserMenu } from "@/components/parish-user-menu"
import { CollapsibleNavSection } from "@/components/collapsible-nav-section"
import {APP_NAME, APP_TAGLINE} from "@/lib/constants";
import { canAccessModule, canManageParishSettings, type UserParishRole, type ModuleName } from "@/lib/auth/permissions-client"

interface MainSidebarProps {
  userParish: UserParishRole | null
}

export function MainSidebar({ userParish }: MainSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Helper to check if user can access a module
  const canAccess = (moduleName: ModuleName): boolean => {
    if (!userParish) return false
    return canAccessModule(userParish, moduleName)
  }

  // Check if user can manage parish settings
  const canManageParish = userParish ? canManageParishSettings(userParish) : false

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
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              {canAccess('masses') && (
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
              )}

              {canAccess('masses') && (
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
                      title: "Mass Types",
                      url: "/mass-types",
                      icon: List,
                    },
                    {
                      title: "Role Templates",
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
              )}

              {canAccess('weddings') && (
                <CollapsibleNavSection
                  name="Weddings"
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
              )}

              {canAccess('funerals') && (
                <CollapsibleNavSection
                  name="Funerals"
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
              )}

              {canAccess('presentations') && (
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
              )}

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

              {canAccess('groups') && (
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
              )}

              {canAccess('mass-intentions') && (
                <CollapsibleNavSection
                  name="Mass Intentions"
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
                      title: "Report",
                      url: "/mass-intentions/report",
                      icon: FileText,
                    },
                  ]}
                  defaultOpen={false}
                />
              )}

              {canAccess('baptisms') && (
                <CollapsibleNavSection
                  name="Baptisms"
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
              )}

              {/*<CollapsibleNavSection*/}
              {/*  name="Confirmations"*/}
              {/*  icon={Flame}*/}
              {/*  items={[*/}
              {/*    {*/}
              {/*      title: "Our Confirmations",*/}
              {/*      url: "/confirmations",*/}
              {/*      icon: Flame,*/}
              {/*    },*/}
              {/*    {*/}
              {/*      title: "New Confirmation",*/}
              {/*      url: "/confirmations",*/}
              {/*      icon: Plus,*/}
              {/*    },*/}
              {/*  ]}*/}
              {/*  defaultOpen={false}*/}
              {/*/>*/}

              {canAccess('quinceaneras') && (
                <CollapsibleNavSection
                  name="Quinceañeras"
                  icon={BookHeart}
                  items={[
                    {
                      title: "Our Quinceañeras",
                      url: "/quinceaneras",
                      icon: BookHeart,
                    },
                    {
                      title: "New Quinceañera",
                      url: "/quinceaneras/create",
                      icon: Plus,
                    },
                  ]}
                  defaultOpen={false}
                />
              )}

            </SidebarMenu>
          </SidebarGroupContent>


        </SidebarGroup>

        {/* Settings section at the bottom */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              {canManageParish && (
                <SidebarMenuItem key="ParishSettings">
                  <SidebarMenuButton asChild>
                    <Link href="/settings/parish" onClick={handleLinkClick}>
                      <Church />
                      <span>Parish Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem key="UserSettings">
                <SidebarMenuButton asChild>
                  <Link href="/settings" onClick={handleLinkClick}>
                    <User />
                    <span>User Settings</span>
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
