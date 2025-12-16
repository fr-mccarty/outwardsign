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
  User, Users, Users2, Plus,
  CalendarDays, Building, LayoutTemplate, UserCog, UsersIcon, Clock, HelpCircle, ScrollText,
} from "lucide-react"
import Link from "next/link"
import { ParishUserMenu } from "@/components/parish-user-menu"
import { CollapsibleNavSection } from "@/components/collapsible-nav-section"
import { Logo } from "@/components/logo"
import {APP_NAME, APP_TAGLINE} from "@/lib/constants";
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

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Group event types by system_type (using new unified data model)
  const groupedEventTypes = {
    mass: eventTypes.filter(et => et.system_type === 'mass'),
    'special-liturgy': eventTypes.filter(et => et.system_type === 'special-liturgy'),
    sacrament: eventTypes.filter(et => et.system_type === 'sacrament'),
    event: eventTypes.filter(et => et.system_type === 'event'),
  }

  // Get system type icons
  const MassIcon = getLucideIcon(SYSTEM_TYPE_METADATA.mass.icon)
  const SpecialLiturgyIcon = getLucideIcon(SYSTEM_TYPE_METADATA['special-liturgy'].icon)
  const SacramentIcon = getLucideIcon(SYSTEM_TYPE_METADATA.sacrament.icon)
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
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.application')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem key="Dashboard">
                <SidebarMenuButton asChild>
                  <Link href="/dashboard" onClick={handleLinkClick}>
                    <Home />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="Calendar">
                <SidebarMenuButton asChild>
                  <Link href="/calendar?view=month" onClick={handleLinkClick}>
                    <Calendar />
                    <span>{t('nav.calendar')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <CollapsibleNavSection
                name={t('nav.massScheduling')}
                icon={Clock}
                items={[
                  {
                    title: t('nav.scheduleMasses'),
                    url: "/masses/schedule",
                    icon: CalendarDays,
                  },
                  {
                    title: t('nav.massTimesTemplates'),
                    url: "/mass-times-templates",
                    icon: Clock,
                  },
                  {
                    title: t('nav.massRoleTemplates'),
                    url: "/mass-role-templates",
                    icon: LayoutTemplate,
                  },
                  {
                    title: t('nav.massRoles'),
                    url: "/mass-roles",
                    icon: UserCog,
                  },
                  {
                    title: t('nav.roleMembers'),
                    url: "/mass-role-members",
                    icon: UsersIcon,
                  },
                ]}
                defaultOpen={false}
              />

              <SidebarMenuItem key="EventScheduling">
                <SidebarMenuButton asChild>
                  <Link href="/event-scheduling" onClick={handleLinkClick}>
                    <CalendarDays />
                    <span>Event Scheduling</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Masses */}
        <SidebarGroup>
          <SidebarGroupLabel>{SYSTEM_TYPE_METADATA.mass.name_en}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Masses">
                <SidebarMenuButton asChild>
                  <Link href="/masses" onClick={handleLinkClick}>
                    <MassIcon />
                    <span>{t('nav.ourMasses')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Special Liturgies - Expandable by event type */}
        {groupedEventTypes['special-liturgy'].length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{SYSTEM_TYPE_METADATA['special-liturgy'].name_en}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedEventTypes['special-liturgy'].map((eventType) => {
                  const Icon = getLucideIcon(eventType.icon)
                  const slug = eventType.slug || eventType.id
                  return (
                    <SidebarMenuItem key={eventType.id}>
                      <SidebarMenuButton asChild>
                        <Link href={`/special-liturgies/${slug}`} onClick={handleLinkClick}>
                          <Icon />
                          <span>{eventType.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Sacraments - Expandable by event type */}
        {groupedEventTypes.sacrament.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{SYSTEM_TYPE_METADATA.sacrament.name_en}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedEventTypes.sacrament.map((eventType) => {
                  const Icon = getLucideIcon(eventType.icon)
                  const slug = eventType.slug || eventType.id
                  return (
                    <SidebarMenuItem key={eventType.id}>
                      <SidebarMenuButton asChild>
                        <Link href={`/sacraments/${slug}`} onClick={handleLinkClick}>
                          <Icon />
                          <span>{eventType.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Events */}
        <SidebarGroup>
          <SidebarGroupLabel>{SYSTEM_TYPE_METADATA.event.name_en}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Events">
                <SidebarMenuButton asChild>
                  <Link href="/events" onClick={handleLinkClick}>
                    <EventIcon />
                    <span>Our Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Supporting Modules */}
        <SidebarGroup>
          <SidebarGroupLabel>Parish Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

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
                    title: t('nav.newGroup'),
                    url: "/groups",
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
                    title: t('nav.newLocation'),
                    url: "/locations/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

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

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem key="WeekendSummary">
                <SidebarMenuButton asChild>
                  <Link href="/weekend-summary" onClick={handleLinkClick}>
                    <CalendarDays />
                    <span>{t('nav.weekendSummary')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <CollapsibleNavSection
                name={t('nav.massIntentions')}
                icon={ScrollText}
                items={[
                  {
                    title: t('nav.ourMassIntentions'),
                    url: "/mass-intentions",
                    icon: ScrollText,
                  },
                  {
                    title: t('nav.createMassIntention'),
                    url: "/mass-intentions/create",
                    icon: Plus,
                  },
                  {
                    title: t('nav.report'),
                    url: "/mass-intentions/report",
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
          <SidebarGroupLabel>{t('nav.settings')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem key="Settings">
                <SidebarMenuButton asChild>
                  <Link href="/settings" onClick={handleLinkClick}>
                    <Settings />
                    <span>{t('nav.settings')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="Support">
                <SidebarMenuButton asChild>
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
