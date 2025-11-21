'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { DASHBOARD_MODULE_LABELS } from '@/lib/constants'

export function DashboardErrorHandler() {
  const searchParams = useSearchParams()
  // TODO: When language selector is implemented, get language from context
  // For now, hard-coded to English
  const lang: 'en' | 'es' = 'en'

  useEffect(() => {
    const error = searchParams.get('error')
    const module = searchParams.get('module')

    if (error === 'no_permission' && module) {
      const moduleLabel = DASHBOARD_MODULE_LABELS[module]
      const moduleName = moduleLabel ? moduleLabel[lang] : module
      toast.error(`You do not have permission to access ${moduleName}`)
    } else if (error === 'not_parish_member') {
      toast.error('You are not a member of this parish')
    }
  }, [searchParams, lang])

  return null
}
