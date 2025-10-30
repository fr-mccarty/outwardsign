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
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs)
  }, [setBreadcrumbs, breadcrumbs])

  return null
}
