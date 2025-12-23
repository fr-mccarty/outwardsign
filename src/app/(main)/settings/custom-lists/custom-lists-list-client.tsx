'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/content-card'
import { Plus, Trash2, List, ChevronRight } from 'lucide-react'
import type { CustomList } from '@/lib/types'
import { deleteCustomList } from '@/lib/actions/custom-lists'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import Link from 'next/link'
import { useBreadcrumbs } from '@/components/breadcrumb-context'

interface CustomListsListClientProps {
  initialData: CustomList[]
}

export function CustomListsListClient({ initialData }: CustomListsListClientProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [lists, setLists] = useState<CustomList[]>(initialData)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listToDelete, setListToDelete] = useState<CustomList | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
      { label: 'Custom Lists' }
    ])
  }, [setBreadcrumbs])

  const handleDelete = async () => {
    if (!listToDelete) return

    try {
      await deleteCustomList(listToDelete.id)
      toast.success('Custom list deleted successfully')
      setLists(lists.filter((list) => list.id !== listToDelete.id))
      setListToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete custom list:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete custom list'
      toast.error(errorMessage)
      throw error
    }
  }

  const confirmDelete = (list: CustomList) => {
    setListToDelete(list)
    setDeleteDialogOpen(true)
  }

  return (
    <PageContainer
      title="Custom Lists"
      description="Manage custom lists for event field options. Create lists like song choices, reading selections, or any custom options."
      primaryAction={
        <Button asChild>
          <Link href="/settings/custom-lists/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Custom List
          </Link>
        </Button>
      }
    >
      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No custom lists yet. Create a list to use in event fields.
              </p>
              <Button asChild>
                <Link href="/settings/custom-lists/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom List
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <Card key={list.id} className="hover:shadow-lg transition-shadow !py-0">
              <CardContent className="py-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{list.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Click to manage items
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/settings/custom-lists/${list.slug}`}>
                      Manage Items
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      confirmDelete(list)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Custom List"
        description={`Are you sure you want to delete "${listToDelete?.name}"? This action cannot be undone. If this list is used in event type field definitions, you must remove those field definitions first.`}
      />
    </PageContainer>
  )
}
