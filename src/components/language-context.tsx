'use client'

import { useAppContext } from '@/contexts/AppContextProvider'

export function useLanguage() {
  const { userSettings } = useAppContext()

  return {
    language: (userSettings?.language || 'en') as 'en' | 'es'
  }
}
