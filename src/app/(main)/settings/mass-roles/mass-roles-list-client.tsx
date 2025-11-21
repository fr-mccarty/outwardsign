'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Users } from 'lucide-react'
import { ActiveInactiveBadge } from '@/components/active-inactive-badge'
import { MassRoleWithCount } from '@/lib/actions/mass-roles'

interface MassRolesListClientProps {
  massRoles: MassRoleWithCount[]
  searchQuery: string
}

export function MassRolesListClient({ massRoles, searchQuery }: MassRolesListClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(searchQuery)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams()
    if (value) {
      params.set('search', value)
    }
    router.push(`/settings/mass-roles?${params.toString()}`)
  }

  return (
    <PageContainer
      title="Mass Roles"
      description="Manage liturgical roles for Mass ministries"
      actions={
        <Button onClick={() => router.push('/settings/mass-roles/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Mass Role
        </Button>
      }
    >
      {/* Search */}
      <div className="flex items-center gap-2 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mass roles..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Mass Roles Grid */}
      {massRoles.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {search ? 'No mass roles found' : 'No mass roles yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first mass role'}
            </p>
            {!search && (
              <Button onClick={() => router.push('/settings/mass-roles/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Mass Role
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {massRoles.map((role) => (
            <Card
              key={role.id}
              className="p-4 hover:bg-accent transition-colors cursor-pointer"
              onClick={() => router.push(`/settings/mass-roles/${role.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{role.name}</h3>
                <ActiveInactiveBadge isActive={role.is_active} />
              </div>

              {role.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {role.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {role.member_count} {role.member_count === 1 ? 'member' : 'members'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
