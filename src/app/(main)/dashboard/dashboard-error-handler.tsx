'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const MODULE_LABELS: Record<string, string> = {
  masses: 'Masses',
  weddings: 'Weddings',
  funerals: 'Funerals',
  baptisms: 'Baptisms',
  presentations: 'Presentations',
  quinceaneras: 'Quinceañeras',
  groups: 'Groups',
  'mass-intentions': 'Mass Intentions',
}

export function DashboardErrorHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    const module = searchParams.get('module')

    if (error === 'no_permission' && module) {
      const moduleName = MODULE_LABELS[module] || module
      toast.error(`You do not have permission to access ${moduleName}`)
    } else if (error === 'not_parish_member') {
      toast.error('You are not a member of this parish')
    }
  }, [searchParams])

  return null
}
