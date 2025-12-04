'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, MessageCircle, Bell, LogOut, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from './language-context'

interface ParishionerNavigationProps {
  variant: 'sidebar' | 'bottom-tabs'
  unreadCount?: number
}

export function ParishionerNavigation({ variant, unreadCount = 0 }: ParishionerNavigationProps) {
  const tabs = [
    {
      name: 'Calendar',
      href: '/parishioner/calendar',
      icon: Calendar,
    },
    {
      name: 'Chat',
      href: '/parishioner/chat',
      icon: MessageCircle,
    },
    {
      name: 'Notifications',
      href: '/parishioner/notifications',
      icon: Bell,
      badge: unreadCount,
    },
  ]
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en')
  }

  if (variant === 'bottom-tabs') {
    return (
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    )
  }

  // Sidebar variant (desktop)
  return (
    <div className="flex flex-col w-full p-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold">Parishioner Portal</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link key={tab.href} href={tab.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{tab.name}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-auto h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={toggleLanguage}
        >
          <Languages className="h-5 w-5 mr-3" />
          {language === 'en' ? 'Español' : 'English'}
        </Button>
        <Link href="/parishioner/logout">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut className="h-5 w-5 mr-3" />
            {language === 'en' ? 'Log Out' : 'Cerrar sesión'}
          </Button>
        </Link>
      </div>
    </div>
  )
}
