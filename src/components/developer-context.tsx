'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface DeveloperContextType {
  isDeveloper: boolean
  developerEmail: string | null
}

const DeveloperContext = createContext<DeveloperContextType | undefined>(undefined)

interface DeveloperProviderProps {
  children: ReactNode
  isDeveloper: boolean
  developerEmail: string | null
}

export function DeveloperProvider({
  children,
  isDeveloper,
  developerEmail,
}: DeveloperProviderProps) {
  return (
    <DeveloperContext.Provider value={{ isDeveloper, developerEmail }}>
      {children}
    </DeveloperContext.Provider>
  )
}

export function useDeveloper() {
  const context = useContext(DeveloperContext)
  if (context === undefined) {
    throw new Error('useDeveloper must be used within a DeveloperProvider')
  }
  return context
}

/**
 * Hook to check if developer features should be shown
 * Returns false if context is not available (safe for optional usage)
 */
export function useIsDeveloper(): boolean {
  const context = useContext(DeveloperContext)
  return context?.isDeveloper ?? false
}
