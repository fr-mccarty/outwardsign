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
  Calendar,
  Settings,
  User,
  Users,
  Users2,
  Plus,
  CalendarDays,
  Building,
  HelpCircle,
  ScrollText,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ParishUserMenu } from "@/components/parish-user-menu"
import { CollapsibleNavSection } from "@/components/collapsible-nav-section"
import { Logo } from "@/components/logo"
import { APP_NAME, APP_TAGLINE } from "@/lib/constants"
import { getLucideIcon } from "@/lib/utils/lucide-icons"
import { SYSTEM_TYPE_METADATA } from "@/lib/constants/system-types"
import type { EventType } from "@/lib/types"
import { useTranslations } from 'next-intl'

interface MainSidebarProps {
  eventTypes: EventType[]
}

export function MainSidebar({ eventTypes }: MainSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const t = useTranslations()
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Helper to check if a route is active
  const isRouteActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    // For other routes, check if pathname starts with the href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Group event types by system_type
  const groupedEventTypes = {
    mass: eventTypes.filter(et => et.system_type === 'mass'),
    'special-liturgy': eventTypes.filter(et => et.system_type === 'special-liturgy'),
    event: eventTypes.filter(et => et.system_type === 'event'),
  }

  // Get system type icons
  const MassIcon = getLucideIcon(SYSTEM_TYPE_METADATA.mass.icon)
  const EventIcon = getLucideIcon(SYSTEM_TYPE_METADATA.event.icon)

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
        {/* Core Navigation (no label) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Dashboard">
                <SidebarMenuButton asChild isActive={isRouteActive('/dashboard')} tooltip={t('nav.dashboard')}>
                  <Link href="/dashboard" onClick={handleLinkClick}>
                    <Home />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="Calendar">
                <SidebarMenuButton asChild isActive={isRouteActive('/calendar')} tooltip={t('nav.calendar')}>
                  <Link href="/calendar?view=month" onClick={handleLinkClick}>
                    <Calendar />
                    <span>{t('nav.calendar')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Masses - Unified Section */}
        <SidebarGroup>
          <SidebarGroupLabel>{SYSTEM_TYPE_METADATA.mass.name_en}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="OurMasses">
                <SidebarMenuButton asChild isActive={pathname === '/masses'} tooltip={t('nav.ourMasses')}>
                  <Link href="/masses" onClick={handleLinkClick}>
                    <MassIcon />
                    <span>{t('nav.ourMasses')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="CreateMass">
                <SidebarMenuButton asChild isActive={pathname === '/masses/create'} tooltip={t('nav.createMass')}>
                  <Link href="/masses/create" onClick={handleLinkClick}>
                    <Plus />
                    <span>{t('nav.createMass')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Schedule Masses temporarily hidden - feature in development */}
              {/* <SidebarMenuItem key="ScheduleMasses">
                <SidebarMenuButton asChild tooltip={t('nav.scheduleMasses')}>
                  <Link href="/masses/schedule" onClick={handleLinkClick}>
                    <CalendarDays />
                    <span>{t('nav.scheduleMasses')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Mass Intentions - Moved to be adjacent to Masses */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.massIntentions')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="OurMassIntentions">
                <SidebarMenuButton asChild isActive={pathname === '/mass-intentions'} tooltip={t('nav.ourMassIntentions')}>
                  <Link href="/mass-intentions" onClick={handleLinkClick}>
                    <ScrollText />
                    <span>{t('nav.ourMassIntentions')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="CreateMassIntention">
                <SidebarMenuButton asChild isActive={pathname === '/mass-intentions/create'} tooltip={t('nav.createMassIntention')}>
                  <Link href="/mass-intentions/create" onClick={handleLinkClick}>
                    <Plus />
                    <span>{t('nav.createMassIntention')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="MassIntentionsReport">
                <SidebarMenuButton asChild isActive={pathname === '/mass-intentions/report'} tooltip={t('nav.viewReport')}>
                  <Link href="/mass-intentions/report" onClick={handleLinkClick}>
                    <ScrollText />
                    <span>{t('nav.viewReport')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Special Liturgies - Dynamic by event type with sub-navigation */}
        {groupedEventTypes['special-liturgy'].length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{SYSTEM_TYPE_METADATA['special-liturgy'].name_en}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedEventTypes['special-liturgy'].map((eventType) => {
                  const Icon = getLucideIcon(eventType.icon)
                  const slug = eventType.slug || eventType.id
                  return (
                    <CollapsibleNavSection
                      key={eventType.id}
                      name={eventType.name}
                      icon={Icon}
                      items={[
                        {
                          title: `${t('common.our')} ${eventType.name}s`,
                          url: `/special-liturgies/${slug}`,
                          icon: Icon,
                        },
                        {
                          title: `${t('common.create')} ${eventType.name}`,
                          url: `/special-liturgies/${slug}/create`,
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

        {/* Parish Events */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.parishEvents')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="OurEvents">
                <SidebarMenuButton asChild isActive={pathname === '/events'} tooltip={t('nav.ourEvents')}>
                  <Link href="/events" onClick={handleLinkClick}>
                    <EventIcon />
                    <span>{t('nav.ourEvents')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="CreateEvent">
                <SidebarMenuButton asChild isActive={pathname === '/events/create'} tooltip={t('nav.createEvent')}>
                  <Link href="/events/create" onClick={handleLinkClick}>
                    <Plus />
                    <span>{t('nav.createEvent')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Directory (formerly Supporting Resources) */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.directory')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <CollapsibleNavSection
                name={t('nav.people')}
                icon={User}
                items={[
                  {
                    title: t('nav.ourPeople'),
                    url: "/people",
                    icon: User,
                  },
                  {
                    title: t('nav.createPerson'),
                    url: "/people/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name={t('nav.families')}
                icon={Users2}
                items={[
                  {
                    title: t('nav.ourFamilies'),
                    url: "/families",
                    icon: Users2,
                  },
                  {
                    title: t('nav.createFamily'),
                    url: "/families/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name={t('nav.groups')}
                icon={Users}
                items={[
                  {
                    title: t('nav.ourGroups'),
                    url: "/groups",
                    icon: Users,
                  },
                  {
                    title: t('nav.createGroup'),
                    url: "/groups/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name={t('nav.locations')}
                icon={Building}
                items={[
                  {
                    title: t('nav.ourLocations'),
                    url: "/locations",
                    icon: Building,
                  },
                  {
                    title: t('nav.createLocation'),
                    url: "/locations/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.reports')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="WeekendSummary">
                <SidebarMenuButton asChild isActive={isRouteActive('/weekend-summary')} tooltip={t('nav.weekendSummary')}>
                  <Link href="/weekend-summary" onClick={handleLinkClick}>
                    <CalendarDays />
                    <span>{t('nav.weekendSummary')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.settings')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Settings">
                <SidebarMenuButton asChild isActive={isRouteActive('/settings')} tooltip={t('nav.settings')}>
                  <Link href="/settings" onClick={handleLinkClick}>
                    <Settings />
                    <span>{t('nav.settings')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="Support">
                <SidebarMenuButton asChild isActive={isRouteActive('/support')} tooltip={t('nav.support')}>
                  <Link href="/support" onClick={handleLinkClick}>
                    <HelpCircle />
                    <span>{t('nav.support')}</span>
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
