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
  // useBreadcrumbs hook must be called unconditionally per React rules
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs)
  }, [setBreadcrumbs, breadcrumbs])

  return null
}
