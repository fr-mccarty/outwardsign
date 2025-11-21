'use client'

import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MassRoleForm } from './mass-role-form'
import { MassRoleWithRelations } from '@/lib/actions/mass-roles'

interface MassRoleFormWrapperProps {
  massRole?: MassRoleWithRelations
}

export function MassRoleFormWrapper({ massRole }: MassRoleFormWrapperProps) {
  const router = useRouter()
  const isEditing = !!massRole

  return (
    <PageContainer
      title={isEditing ? `Edit ${massRole.name}` : 'Create Mass Role'}
      description={isEditing ? 'Update mass role information and manage members' : 'Add a new liturgical role for Mass ministries'}
      actions={
        isEditing ? (
          <>
            <Button
              type="submit"
              form="mass-role-form"
              variant="default"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/settings/mass-roles/${massRole.id}`)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        ) : undefined
      }
    >
      <MassRoleForm massRole={massRole} />
    </PageContainer>
  )
}
