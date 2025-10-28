'use client'

import { useEffect, useState } from 'react'
import { getParishSettings } from '@/lib/actions/setup'
import { ParishSettings } from '@/lib/types'

export function useParishSettings(parishId: string | null) {
  const [settings, setSettings] = useState<ParishSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!parishId) {
      setSettings(null)
      setLoading(false)
      setError(null)
      return
    }

    async function loadSettings() {
      try {
        setLoading(true)
        setError(null)
        const result = await getParishSettings(parishId!)
        if (result.success) {
          setSettings(result.settings)
        } else {
          setError('Failed to load parish settings')
        }
      } catch (err) {
        console.error('Error loading parish settings:', err)
        setError('Failed to load parish settings')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [parishId])

  return {
    settings,
    loading,
    error,
    quickAmounts: settings?.mass_intention_offering_quick_amounts || [
      { amount: 100, label: '$1' },
      { amount: 200, label: '$2' },
      { amount: 500, label: '$5' }
    ],
    donationsQuickAmounts: settings?.donations_quick_amounts || [
      { amount: 500, label: '$5' },
      { amount: 1000, label: '$10' },
      { amount: 2500, label: '$25' },
      { amount: 5000, label: '$50' }
    ]
  }
}