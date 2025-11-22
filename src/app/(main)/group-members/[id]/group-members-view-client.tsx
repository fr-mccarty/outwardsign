'use client'

import { useRouter } from 'next/navigation'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar } from 'lucide-react'
import { formatDatePretty } from '@/lib/utils/formatters'
import type { Person } from '@/lib/types'
import type { PersonGroupMembership } from '@/lib/actions/groups'

interface GroupMembersViewClientProps {
  person: Person
  memberships: PersonGroupMembership[]
}

export function GroupMembersViewClient({
  person,
  memberships
}: GroupMembersViewClientProps) {
  const router = useRouter()

  const activeMemberships = memberships.filter(m => m.group.is_active)
  const inactiveMemberships = memberships.filter(m => !m.group.is_active)

  // Action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <a href={`/group-members/${person.id}/memberships`}>
          Manage Memberships
        </a>
      </Button>
      <Button variant="outline" asChild className="w-full">
        <a href={`/people/${person.id}`}>
          View Full Profile
        </a>
      </Button>
    </>
  )

  // Details section content
  const details = (
    <>
      {person.email && (
        <div>
          <span className="font-medium">Email:</span>{' '}
          <a href={`mailto:${person.email}`} className="hover:underline text-sm">
            {person.email}
          </a>
        </div>
      )}
      {person.phone_number && (
        <div className={person.email ? "pt-2 border-t" : ""}>
          <span className="font-medium">Phone:</span>{' '}
          <a href={`tel:${person.phone_number}`} className="hover:underline text-sm">
            {person.phone_number}
          </a>
        </div>
      )}
      {(person.street || person.city || person.state) && (
        <div className={person.email || person.phone_number ? "pt-2 border-t" : ""}>
          <span className="font-medium">Address:</span>
          <div className="text-sm mt-1">
            {person.street && <div>{person.street}</div>}
            {(person.city || person.state) && (
              <div>
                {person.city}
                {person.city && person.state && ', '}
                {person.state} {person.zipcode}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={person}
      entityType="Group Member"
      modulePath="group-members"
      actionButtons={actionButtons}
      details={details}
    >
      <div className="space-y-6">
        {/* Active Group Memberships */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Group Memberships
                </CardTitle>
                <CardDescription>
                  {activeMemberships.length} active {activeMemberships.length === 1 ? 'membership' : 'memberships'}
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push(`/group-members/${person.id}/memberships`)}
              >
                Manage Memberships
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeMemberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active group memberships</p>
            ) : (
              <div className="space-y-4">
                {activeMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => router.push(`/groups/${membership.group_id}`)}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{membership.group.name}</div>
                      {membership.group.description && (
                        <div className="text-sm text-muted-foreground">
                          {membership.group.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDatePretty(membership.joined_at)}
                      </div>
                    </div>
                    {membership.group_role && (
                      <Badge variant="secondary">
                        {membership.group_role.name}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inactive Group Memberships */}
        {inactiveMemberships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">Inactive Group Memberships</CardTitle>
              <CardDescription>
                {inactiveMemberships.length} inactive {inactiveMemberships.length === 1 ? 'membership' : 'memberships'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inactiveMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-start justify-between p-4 border rounded-lg opacity-60"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{membership.group.name}</div>
                      {membership.group.description && (
                        <div className="text-sm text-muted-foreground">
                          {membership.group.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDatePretty(membership.joined_at)}
                      </div>
                    </div>
                    {membership.group_role && (
                      <Badge variant="outline">
                        {membership.group_role.name}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleViewContainer>
  )
}
