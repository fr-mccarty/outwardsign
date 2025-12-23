'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BookOpen,
  Menu,
  Home,
  RocketIcon,
  Users,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  Code,
  Mail,
  HandHeart
} from 'lucide-react'

interface NavItem {
  title: string
  href?: string
  icon?: any
  items?: NavItem[]
}

interface DocumentationSidebarProps {
  lang: 'en' | 'es'
}

export function DocumentationSidebar({ lang }: DocumentationSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Navigation structure
  const navigation: NavItem[] = [
    {
      title: lang === 'en' ? 'Home' : 'Inicio',
      href: `/documentation/${lang}`,
      icon: Home,
    },
    {
      title: lang === 'en' ? 'Getting Started' : 'Comenzando',
      icon: RocketIcon,
      items: [
        {
          title: lang === 'en' ? 'Introduction' : 'Introducción',
          href: `/documentation/${lang}/getting-started/introduction`,
        },
        {
          title: lang === 'en' ? 'Quick Start' : 'Inicio Rápido',
          href: `/documentation/${lang}/getting-started/quick-start`,
        },
        {
          title: lang === 'en' ? 'Parish Setup' : 'Configuración de Parroquia',
          href: `/documentation/${lang}/getting-started/parish-setup`,
        },
      ],
    },
    {
      title: lang === 'en' ? 'User Guides' : 'Guías de Usuario',
      icon: Users,
      items: [
        {
          title: lang === 'en' ? 'Staff Guide' : 'Guía de Personal',
          href: `/documentation/${lang}/user-guides/staff-guide`,
        },
        {
          title: lang === 'en' ? 'Inviting Team Members' : 'Invitar Miembros del Personal',
          href: `/documentation/${lang}/user-guides/inviting-staff`,
        },
        {
          title: lang === 'en' ? 'Managing People' : 'Gestión de Personas',
          href: `/documentation/${lang}/user-guides/people`,
        },
        {
          title: lang === 'en' ? 'Creating Events' : 'Creación de Eventos',
          href: `/documentation/${lang}/user-guides/events`,
        },
      ],
    },
    {
      title: lang === 'en' ? 'Features' : 'Características',
      icon: Sparkles,
      items: [
        {
          title: lang === 'en' ? 'Weddings' : 'Bodas',
          href: `/documentation/${lang}/features/weddings`,
        },
        {
          title: lang === 'en' ? 'Mass Intentions' : 'Intenciones de Misa',
          href: `/documentation/${lang}/features/mass-liturgies`,
        },
      ],
    },
    {
      title: lang === 'en' ? 'FAQ' : 'Preguntas Frecuentes',
      href: `/documentation/${lang}/faq`,
      icon: FileQuestion,
    },
    {
      title: lang === 'en' ? 'Contact Us' : 'Contáctanos',
      href: `/documentation/${lang}/contact`,
      icon: Mail,
    },
    {
      title: lang === 'en' ? 'Support the Project' : 'Apoya el Proyecto',
      href: `/documentation/${lang}/support`,
      icon: HandHeart,
    },
    {
      title: lang === 'en' ? 'For Developers' : 'Para Desarrolladores',
      href: `/documentation/${lang}/for-developers`,
      icon: Code,
    },
    // {
    //   title: lang === 'en' ? 'Sponsor' : 'Patrocinar',
    //   href: `/documentation/${lang}/sponsor`,
    //   icon: Heart,
    // },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Outward Sign</h2>
            <p className="text-xs text-muted-foreground">
              {lang === 'en' ? 'Documentation' : 'Documentación'}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavItemComponent key={item.title} item={item} pathname={pathname} />
          ))}
        </nav>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Documentation</span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card">
        <SidebarContent />
      </aside>
    </>
  )
}

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const [expanded, setExpanded] = useState(
    item.items?.some((subItem) => pathname.startsWith(subItem.href || '')) || false
  )
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.href === pathname

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <div className="flex items-center gap-2">
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.title}</span>
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {expanded && item.items && (
          <div className="ml-6 mt-1 space-y-1">
            {item.items.map((subItem) => {
              const isSubActive = subItem.href === pathname
              return (
                <Link
                  key={subItem.href}
                  href={subItem.href || '#'}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-md transition-colors',
                    isSubActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {subItem.title}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {item.icon && <item.icon className="h-4 w-4" />}
      <span>{item.title}</span>
    </Link>
  )
}
