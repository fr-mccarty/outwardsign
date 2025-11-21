'use client'

import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, User, Users, Calendar } from 'lucide-react'
import { formatPersonName } from '@/lib/utils/formatters'
import { formatDatePretty } from '@/lib/utils/date-format'
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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups', href: '/groups' },
    { label: 'Group Members', href: '/group-members' },
    { label: formatPersonName(person), href: `/group-members/${person.id}` },
  ]

  const activeMemberships = memberships.filter(m => m.group.is_active)
  const inactiveMemberships = memberships.filter(m => !m.group.is_active)

  return (
    <PageContainer
      title={formatPersonName(person)}
      description="Group memberships and roles"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Person Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {person.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${person.email}`} className="hover:underline">
                  {person.email}
                </a>
              </div>
            )}
            {person.phone_number && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${person.phone_number}`} className="hover:underline">
                  {person.phone_number}
                </a>
              </div>
            )}
            {(person.street || person.city || person.state) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
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
          </CardContent>
        </Card>

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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/people/${person.id}`)}
            >
              View Full Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/group-members/${person.id}/memberships`)}
            >
              Manage Memberships
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
