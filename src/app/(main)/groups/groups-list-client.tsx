'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContentCard } from "@/components/content-card"
import { ListViewCard } from "@/components/list-view-card"
import { Button } from "@/components/ui/button"
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { Plus, Users } from "lucide-react"
import { deleteGroup, type Group } from '@/lib/actions/groups'
import { GroupFormDialog } from '@/components/groups/group-form-dialog'
import { toast } from 'sonner'
import Link from 'next/link'

interface GroupsListClientProps {
  initialData: Group[]
}

export function GroupsListClient({ initialData }: GroupsListClientProps) {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>(initialData)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditingGroup(null)
    setDialogOpen(true)
  }

  const handleSuccess = async (groupId: string) => {
    if (editingGroup) {
      // Edit mode - refresh the page to reload data
      router.refresh()
    } else {
      // Create mode - redirect to view page
      router.push(`/groups/${groupId}`)
    }
  }

  const handleOpenDeleteDialog = (group: Group) => {
    setGroupToDelete(group)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return

    try {
      await deleteGroup(groupToDelete.id)
      toast.success('Group deleted successfully')
      setGroupToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error('Failed to delete group')
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Button */}
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Groups List */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <ListViewCard
              key={group.id}
              title={group.name}
              editHref={`/groups/${group.id}`}
              viewHref={`/groups/${group.id}`}
              viewButtonText="View Members"
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
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Group
          </Button>
        </ContentCard>
      )}

      <GroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Group"
        itemName={groupToDelete?.name}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
