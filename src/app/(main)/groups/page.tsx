'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from "@/components/page-container"
import { Loading } from '@/components/loading'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { getGroups, deleteGroup, type Group } from '@/lib/actions/groups'
import { GroupFormDialog } from '@/components/groups/group-form-dialog'
import { toast } from 'sonner'
import Link from 'next/link'

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Groups" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const data = await getGroups()
      setGroups(data)
    } catch (error) {
      console.error('Failed to load groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingGroup(null)
    setDialogOpen(true)
  }

  const handleSuccess = async (groupId: string) => {
    if (editingGroup) {
      // Edit mode - reload the list
      await loadGroups()
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
      await loadGroups()
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error('Failed to delete group')
    } finally {
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
    }
  }

  if (loading) {
    return (
      <PageContainer 
        title="Groups"
        description="Loading groups..."
      >
        <Loading variant="skeleton-list" />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Groups"
      description="Manage groups of people who serve together in liturgical ministries"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Ministry Groups</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create and manage groups of people who can be scheduled together for liturgical services.
          </p>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No groups found</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {group.name}
                          {!group.is_active && (
                            <span className="ml-2 px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                              Inactive
                            </span>
                          )}
                        </h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/groups/${group.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDeleteDialog(group)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group{' '}
              <span className="font-semibold">&quot;{groupToDelete?.name}&quot;</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}