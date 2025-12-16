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
  Church, BookOpen, Star,
} from "lucide-react"
import Link from "next/link"
import { ParishUserMenu } from "@/components/parish-user-menu"
import { CollapsibleNavSection } from "@/components/collapsible-nav-section"
import { Logo } from "@/components/logo"
import {APP_NAME, APP_TAGLINE} from "@/lib/constants";
import { getLucideIcon } from "@/lib/utils/lucide-icons"
import type { DynamicEventType } from "@/lib/types"
import { useTranslations } from 'next-intl'

interface MainSidebarProps {
  eventTypes: DynamicEventType[]
}

export function MainSidebar({ eventTypes }: MainSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const t = useTranslations()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Group event types by category
  const groupedEventTypes = {
    sacrament: eventTypes.filter(et => et.category === 'sacrament'),
    special_liturgy: eventTypes.filter(et => et.category === 'special_liturgy'),
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
                name={t('nav.masses')}
                icon={BookOpen}
                items={[
                  {
                    title: t('nav.ourMasses'),
                    url: "/masses",
                    icon: BookOpen,
                  },
                  {
                    title: t('nav.newMass'),
                    url: "/masses/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />

              <CollapsibleNavSection
                name={t('nav.calendarEvents')}
                icon={CalendarDays}
                items={[
                  {
                    title: t('nav.ourCalendarEvents'),
                    url: "/calendar-events",
                    icon: CalendarDays,
                  },
                  {
                    title: t('nav.newCalendarEvent'),
                    url: "/calendar-events/create",
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

              <SidebarMenuItem key="WeekendSummary">
                <SidebarMenuButton asChild>
                  <Link href="/weekend-summary" onClick={handleLinkClick}>
                    <CalendarDays />
                    <span>{t('nav.weekendSummary')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Special Liturgies - Simple Module Structure */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.application')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <CollapsibleNavSection
                name={t('nav.specialLiturgies')}
                icon={Star}
                items={[
                  {
                    title: `${t('common.our')} ${t('nav.specialLiturgies')}`,
                    url: "/settings/special-liturgies",
                    icon: Star,
                  },
                  {
                    title: `${t('common.new')} ${t('nav.specialLiturgy')}`,
                    url: "/settings/special-liturgies/create",
                    icon: Plus,
                  },
                ]}
                defaultOpen={false}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sacraments - Expanded */}
        {groupedEventTypes.sacrament.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <Church className="mr-2 h-4 w-4" />
              {t('nav.sacraments')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedEventTypes.sacrament.map((eventType) => {
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
                          url: `/events?type=${slug}`,
                          icon: Icon,
                        },
                        {
                          title: `${t('common.new')} ${eventType.name}`,
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
