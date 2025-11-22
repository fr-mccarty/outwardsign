'use client'

import { useRouter } from 'next/navigation'
import { ContentCard } from "@/components/content-card"
import { ListViewCard } from "@/components/list-view-card"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { type Group } from '@/lib/actions/groups'
import Link from 'next/link'

interface GroupsListClientProps {
  initialData: Group[]
}

export function GroupsListClient({ initialData }: GroupsListClientProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Groups List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((group) => (
            <ListViewCard
              key={group.id}
              title={group.name}
              editHref={`/groups/${group.id}/edit`}
              viewHref={`/groups/${group.id}`}
              viewButtonText="Preview"
              status={group.is_active ? 'ACTIVE' : 'INACTIVE'}
              statusType="module"
            >
              {group.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description}
                </p>
              )}
            </ListViewCard>
          ))}
        </div>
      ) : (
        <ContentCard className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No groups yet</h3>
          <p className="text-muted-foreground mb-6">
            Create and manage groups of people who can be scheduled together for liturgical services.
          </p>
          <Button asChild>
            <Link href="/groups/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Group
            </Link>
          </Button>
        </ContentCard>
      )}
    </div>
  )
}
