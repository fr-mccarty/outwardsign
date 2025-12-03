'use client'

import { useEffect } from 'react'
import { useBreadcrumbs } from '@/components/breadcrumb-context'

interface Breadcrumb {
  label: string
  href?: string
}

interface BreadcrumbSetterProps {
  breadcrumbs: Breadcrumb[]
}

export function BreadcrumbSetter({ breadcrumbs }: BreadcrumbSetterProps) {
  // Safely get breadcrumbs context - return early if not available
  // This handles edge cases where the component is rendered outside the provider
  // (e.g., during HMR errors or in test environments)
  let setBreadcrumbs: ((breadcrumbs: Breadcrumb[]) => void) | null = null

  try {
    const context = useBreadcrumbs()
    setBreadcrumbs = context.setBreadcrumbs
  } catch (error) {
    // Provider not available - silently skip breadcrumb setting
    // This is acceptable because breadcrumbs are non-critical UI enhancement
    return null
  }

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs(breadcrumbs)
    }
  }, [setBreadcrumbs, breadcrumbs])

  return null
}
