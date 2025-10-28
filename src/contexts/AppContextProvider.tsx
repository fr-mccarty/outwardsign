'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UserSettings {
  id: string
  user_id: string
  selected_parish_id: string | null
  language: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface AppContextType {
  user: User | null
  userSettings: UserSettings | null
  isLoading: boolean
  refreshSettings: () => Promise<void>
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppContextProviderProps {
  children: React.ReactNode
  initialUser?: User | null
  initialSettings?: UserSettings | null
}

export function AppContextProvider({ 
  children, 
  initialUser = null, 
  initialSettings = null 
}: AppContextProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(initialSettings)
  const [isLoading, setIsLoading] = useState(!initialUser)
  const supabase = createClient()

  // Default settings for new users (only use columns that exist in database)
  const getDefaultSettings = (userId: string) => ({
    user_id: userId,
    selected_parish_id: null,
    language: 'en',
    full_name: null,
    avatar_url: null
  })

  const refreshSettings = async () => {
    if (!user?.id) {
      console.log('No user found, cannot refresh settings')
      return
    }

    try {
      console.log('Refreshing settings for user:', user.id)
      
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          console.log('No settings found, creating default settings')
          const defaultSettings = getDefaultSettings(user.id)
          
          const { data: newSettings, error: createError } = await supabase
            .from('user_settings')
            .insert(defaultSettings)
            .select()
            .single()

          if (createError) {
            console.error('Error creating default settings:', createError)
            return
          }

          setUserSettings(newSettings)
          console.log('Default settings created:', newSettings)
        } else {
          console.error('Error fetching user settings:', error)
        }
        return
      }

      setUserSettings(settings)
      console.log('Settings refreshed:', settings)
    } catch (error) {
      console.error('Error in refreshSettings:', error)
    }
  }

  const updateSettings = async (settingsUpdate: Partial<UserSettings>) => {
    if (!user?.id || !userSettings?.id) {
      console.error('No user or settings found, cannot update settings')
      return
    }

    try {
      console.log('Updating settings:', settingsUpdate)
      
      const { data: updatedSettings, error } = await supabase
        .from('user_settings')
        .update(settingsUpdate)
        .eq('id', userSettings.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating settings:', error)
        return
      }

      setUserSettings(updatedSettings)
      console.log('Settings updated:', updatedSettings)
    } catch (error) {
      console.error('Error in updateSettings:', error)
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)
      
      if (session?.user) {
        setUser(session.user)
        setIsLoading(false)
        
        // Don't refresh settings if we already have initial settings
        if (!initialSettings) {
          await refreshSettings()
        }
      } else {
        setUser(null)
        setUserSettings(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, initialSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  // If we have initial user but haven't loaded settings yet, load them
  useEffect(() => {
    if (user && !userSettings && !initialSettings) {
      refreshSettings()
    }
  }, [user, userSettings, initialSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  const value: AppContextType = {
    user,
    userSettings,
    isLoading,
    refreshSettings,
    updateSettings
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}

// Export types for use in other components
export type { UserSettings, AppContextType }