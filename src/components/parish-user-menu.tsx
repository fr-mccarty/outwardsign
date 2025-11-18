"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { setSelectedParish, getCurrentParish } from '@/lib/auth/parish'
import { Parish } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LogOut,
  ChevronUp,
  Check,
  Plus,
  Monitor,
  Moon,
  Sun,
  Languages
} from 'lucide-react'
import { toast } from 'sonner'

interface UserData {
  email: string
  id: string
}

interface ParishWithDetails {
  user_id: string
  parish_id: string
  roles: string[]
  parish: Parish
}

export function ParishUserMenu() {
  const [user, setUser] = useState<UserData | null>(null)
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
  const [parishes, setParishes] = useState<ParishWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    try {
      // Get user data
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          email: user.email || '',
          id: user.id
        })

        // Get current parish
        const current = await getCurrentParish()
        setCurrentParish(current)

        // Get user's parish associations with parish details
        const { data: userParishes, error } = await supabase
          .from('parish_users')
          .select(`
            user_id,
            parish_id,
            roles,
            parishes (
              id,
              name,
              city,
              state,
              created_at
            )
          `)
          .eq('user_id', user.id)

        if (error) {
          toast.error('Failed to load parishes')
          return
        }

        const parishesWithDetails = userParishes?.map(item => ({
          user_id: item.user_id,
          parish_id: item.parish_id,
          roles: item.roles || [],
          parish: item.parishes as unknown as Parish
        })) || []

        setParishes(parishesWithDetails)
      }
    } catch (error) {
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSwitchParish(parishId: string) {
    setSwitching(parishId)
    
    try {
      await setSelectedParish(parishId)
      
      // Store in localStorage for persistence (client-side only)
      localStorage.setItem('selected_parish_id', parishId)
      
      toast.success('Parish switched successfully!')
      
      // Refresh the page to update all data
      window.location.reload()
    } catch (error) {
      toast.error('Failed to switch parish')
    } finally {
      setSwitching(null)
    }
  }

  function handleCreateParish() {
    router.push('/select-parish')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const getParishInitials = (parish: Parish) => {
    return parish.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-2 py-2 h-auto"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium truncate max-w-full block">
                {user.email}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-full block">
                {currentParish ? currentParish.name : 'No parish selected'}
              </span>
            </div>
          </div>
          <ChevronUp className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User Section */}
        <DropdownMenuLabel className="uppercase tracking-wide">
          User Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{user.email}</div>
          <div className="text-xs text-muted-foreground">
            {currentParish ? `${currentParish.name} • ${currentParish.city}, ${currentParish.state}` : 'No parish selected'}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Parish Section */}
        <DropdownMenuLabel className="uppercase tracking-wide">
          Parish Management
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {parishes.map((parishAssoc) => {
          const isCurrentParish = currentParish?.id === parishAssoc.parish_id
          const isSwitching = switching === parishAssoc.parish_id
          
          return (
            <DropdownMenuItem
              key={parishAssoc.parish_id}
              onClick={() => handleSwitchParish(parishAssoc.parish_id)}
              disabled={isSwitching || isCurrentParish}
              className="flex items-center gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getParishInitials(parishAssoc.parish)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium">{parishAssoc.parish.name}</span>
                <span className="text-xs text-muted-foreground">
                  {isCurrentParish ? 'Current parish' : 'Click to switch'} • {parishAssoc.parish.city}, {parishAssoc.parish.state}
                </span>
              </div>
              {isCurrentParish && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          )
        })}
        
        <DropdownMenuItem onClick={handleCreateParish} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create or Join Parish</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            {theme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Light</span>
              {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
              {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>System</span>
              {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <span>Language</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem className="flex items-center gap-2">
              <span>English</span>
              <Check className="ml-auto h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" disabled>
              <span>Español (Coming Soon)</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}