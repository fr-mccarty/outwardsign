'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import type { AppLanguage } from '@/i18n/config'
import { DEFAULT_APP_LANGUAGE } from '@/i18n/config'

interface AppLanguageContextType {
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => void
}

const AppLanguageContext = createContext<AppLanguageContextType | undefined>(undefined)

export function AppLanguageProvider({
  children,
  messages
}: {
  children: ReactNode
  messages: Record<string, unknown>
}) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
  const [currentMessages, setCurrentMessages] = useState(messages)

  // Load language preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('app-language') as AppLanguage
    if (saved === 'en' || saved === 'es') {
      setLanguageState(saved)
      // Load the appropriate messages
      import(`@/i18n/locales/${saved}.json`).then((messagesModule) => {
        setCurrentMessages(messagesModule.default)
      })
    }
  }, [])

  const setLanguage = async (lang: AppLanguage) => {
    setLanguageState(lang)
    localStorage.setItem('app-language', lang)

    // Load the appropriate messages
    const messagesModule = await import(`@/i18n/locales/${lang}.json`)
    setCurrentMessages(messagesModule.default)

    // Sync with documentation route if needed
    // When user navigates to documentation, they'll see docs in the selected language
  }

  return (
    <AppLanguageContext.Provider value={{ language, setLanguage }}>
      <NextIntlClientProvider locale={language} messages={currentMessages}>
        {children}
      </NextIntlClientProvider>
    </AppLanguageContext.Provider>
  )
}

export function useAppLanguage() {
  const context = useContext(AppLanguageContext)
  if (context === undefined) {
    throw new Error('useAppLanguage must be used within an AppLanguageProvider')
  }
  return context
}
