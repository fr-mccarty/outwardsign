'use client'

import { useEffect, useState, useCallback } from 'react'
import { searchAnnouncements, deleteAnnouncement, duplicateAnnouncement } from '@/lib/actions/announcements'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from 'next/link'
import { Megaphone, Plus, Printer, ChevronLeft, ChevronRight, Copy, Calendar } from 'lucide-react'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Announcement } from '@/lib/actions/announcements'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  DataTable,
  DataTableColumn,
  DataTableHeader,
  DataTableRowActions,
} from '@/components/data-table'
import { DeleteRowDialog } from '@/components/delete-row-dialog'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [itemsPerPage] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<number | null>(null)
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Announcements" }
    ])
  }, [setBreadcrumbs])

  const loadAnnouncements = useCallback(async () => {
    setLoading(true)
    try {
      const result = await searchAnnouncements({
        query: searchTerm,
        page: currentPage,
        limit: itemsPerPage
      })
      
      setAnnouncements(result.announcements)
      setTotalPages(result.totalPages)
      setTotal(result.total)
    } catch (error) {
      console.error('Failed to load announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, currentPage, itemsPerPage])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  // Reset to first page when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const openDeleteDialog = (announcementId: number) => {
    setAnnouncementToDelete(announcementId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!announcementToDelete) return
    
    try {
      await deleteAnnouncement(announcementToDelete)
      toast.success("Announcement deleted successfully")
      // Reload the announcements list
      await loadAnnouncements()
      setAnnouncementToDelete(null)
    } catch (error) {
      toast.error("Failed to delete announcement. Please try again.")
      throw error // Re-throw so the dialog can handle the loading state
    }
  }

  const getAnnouncementById = (announcementId: number) => {
    return announcements.find(a => a.id === announcementId)
  }

  const handleDuplicate = async (announcement: Announcement) => {
    try {
      const duplicatedAnnouncement = await duplicateAnnouncement(announcement.id)
      toast.success('Announcement duplicated successfully!')
      router.push(`/announcements/${duplicatedAnnouncement.id}/edit`)
    } catch (error) {
      console.error('Failed to duplicate announcement:', error)
      toast.error('Failed to duplicate announcement')
    }
  }

  const columns: DataTableColumn<Announcement>[] = [
    {
      key: "text",
      header: "Content",
      sortable: true,
      accessorFn: (announcement) => announcement.text,
      cell: (announcement) => (
        <span className="font-medium line-clamp-2">
          {announcement.text 
            ? (announcement.text.length > 100 
                ? `${announcement.text.substring(0, 100)}...` 
                : announcement.text)
            : <span className="italic text-muted-foreground">No content</span>
          }
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      hiddenOn: "md",
      sortable: true,
      accessorFn: (announcement) => new Date(announcement.created_at),
      cell: (announcement) => new Date(announcement.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      className: "text-center",
      cell: (announcement) => (
        <DataTableRowActions
          row={announcement}
          variant="hybrid"
          onDelete={(row) => openDeleteDialog(row.id)}
          customActions={[
            {
              label: "Duplicate",
              icon: <Copy className="h-4 w-4" />,
              onClick: (row) => handleDuplicate(row),
              variant: "ghost",
            },
            {
              label: "Print",
              icon: <Printer className="h-4 w-4" />,
              onClick: (row) => window.open(`/print/announcements/${row.id}`, '_blank'),
              variant: "ghost",
            },
          ]}
        />
      ),
    },
  ]

  if (loading) {
    return (
      <PageContainer 
        title="Our Announcements" 
        description="Manage your created announcements"
        maxWidth="6xl"
      >
        <Loading variant="skeleton-table" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Our Announcements" 
      description="Manage your created announcements"
      maxWidth="6xl"
    >
      <div className="space-y-4">
        <DataTableHeader
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search announcements..."
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/announcements/calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </Link>
              </Button>
              <Button asChild>
                <Link href="/announcements/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Link>
              </Button>
            </div>
          }
        />

        <DataTable
          data={announcements}
          columns={columns}
          keyExtractor={(announcement) => announcement.id.toString()}
          onRowClick={(announcement) => window.location.href = `/announcements/${announcement.id}/edit`}
          emptyState={{
            icon: <Megaphone className="h-12 w-12 mx-auto text-muted-foreground" />,
            title: searchTerm ? "No announcements found" : "No announcements yet",
            description: searchTerm 
              ? "No announcements found matching your search. Try different keywords." 
              : "Get started by creating your first announcement",
            action: !searchTerm && (
              <Button asChild>
                <Link href="/announcements/create">Create Announcement</Link>
              </Button>
            ),
          }}
        />
      </div>

      {/* Pagination */}
      {total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, total)} to{' '}
            {Math.min(currentPage * itemsPerPage, total)} of {total} announcements
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current page
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  )
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1]
                  const showEllipsis = prevPage && page - prevPage > 1

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  )
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <DeleteRowDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Announcement"
        itemName={getAnnouncementById(announcementToDelete || 0)?.title || getAnnouncementById(announcementToDelete || 0)?.text?.substring(0, 50) + '...' || 'this announcement'}
      />
    </PageContainer>
  )
}