"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { setSelectedParish, getCurrentParish } from "@/lib/auth/parish"
import { Parish } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { toast } from "sonner"

interface ParishWithDetails {
  user_id: string
  parish_id: string
  roles: string[]
  parish: Parish
}

export function ParishSwitcher() {
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
  const [parishes, setParishes] = useState<ParishWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadParishData()
  }, [])

  async function loadParishData() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get current parish
      const current = await getCurrentParish()
      setCurrentParish(current)

      // Get user's parish associations with parish details
      const { data: userParishes, error } = await supabase
        .from('parish_user')
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
        console.error('Error loading parishes:', error)
        return
      }

      const parishesWithDetails = userParishes?.map(item => ({
        user_id: item.user_id,
        parish_id: item.parish_id,
        roles: item.roles || [],
        parish: item.parishes as unknown as Parish
      })) || []

      setParishes(parishesWithDetails)
    } catch (error) {
      console.error('Error loading parish data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSwitchParish(parishId: string) {
    setSwitching(parishId)
    
    try {
      await setSelectedParish(parishId)
      toast.success('Parish switched successfully!')
      
      // Refresh the page to update all data
      window.location.reload()
    } catch (error) {
      console.error('Error switching parish:', error)
      toast.error('Failed to switch parish')
    } finally {
      setSwitching(null)
    }
  }

  function handleCreateParish() {
    router.push('/select-parish')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </div>
    )
  }

  const getParishInitials = (parish: Parish) => {
    return parish.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {currentParish ? getParishInitials(currentParish) : 'PP'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium truncate">
              {currentParish ? currentParish.name : 'Select Parish'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {currentParish ? `${currentParish.city}, ${currentParish.state}` : 'No parish selected'}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Switch Parish</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {parishes.map((parishAssoc) => (
          <DropdownMenuItem
            key={parishAssoc.parish_id}
            onClick={() => handleSwitchParish(parishAssoc.parish_id)}
            disabled={switching === parishAssoc.parish_id}
            className="flex items-center gap-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getParishInitials(parishAssoc.parish)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{parishAssoc.parish.name}</span>
              <span className="text-xs text-muted-foreground">
                {parishAssoc.parish.city}, {parishAssoc.parish.state}
              </span>
            </div>
            {currentParish?.id === parishAssoc.parish_id && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCreateParish} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create or Join Parish</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}