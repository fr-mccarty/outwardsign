'use client'

import { Card, CardContent } from '@/components/content-card'
import { FamilyForm } from './family-form'
import type { FamilyWithMembers } from '@/lib/actions/families'

interface FamilyFormWrapperProps {
  family?: FamilyWithMembers
}

/**
 * FamilyFormWrapper Component
 *
 * Wraps the FamilyForm in a Card container following the module pattern.
 */
export function FamilyFormWrapper({ family }: FamilyFormWrapperProps) {
  return (
    <Card className="bg-card text-card-foreground border">
      <CardContent className="pt-6">
        <FamilyForm family={family} />
      </CardContent>
    </Card>
  )
}
