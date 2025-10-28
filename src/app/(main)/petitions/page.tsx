'use client'

import { useEffect, useState, useCallback } from 'react'
import { searchPetitions, deletePetition, duplicatePetition } from '@/lib/actions/petitions'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from 'next/link'
import { FileText, Plus, Printer, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Petition } from '@/lib/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  DataTable,
  DataTableColumn,
  DataTableHeader,
  DataTableRowActions,
} from '@/components/data-table'
import { DeleteRowDialog } from '@/components/delete-row-dialog'

export default function PetitionsPage() {
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [itemsPerPage] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [petitionToDelete, setPetitionToDelete] = useState<string | null>(null)
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Petitions" }
    ])
  }, [setBreadcrumbs])

  const loadPetitions = useCallback(async () => {
    setLoading(true)
    try {
      const result = await searchPetitions({
        query: searchTerm,
        page: currentPage,
        limit: itemsPerPage
      })
      
      setPetitions(result.petitions)
      setTotalPages(result.totalPages)
      setTotal(result.total)
    } catch (error) {
      console.error('Failed to load petitions:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, currentPage, itemsPerPage])

  useEffect(() => {
    loadPetitions()
  }, [loadPetitions])

  // Reset to first page when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm])

  const openDeleteDialog = (petitionId: string) => {
    setPetitionToDelete(petitionId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!petitionToDelete) return
    
    try {
      await deletePetition(petitionToDelete)
      toast.success("Petition deleted successfully")
      // Reload the petitions list
      await loadPetitions()
      setPetitionToDelete(null)
    } catch (error) {
      toast.error("Failed to delete petition. Please try again.")
      throw error // Re-throw so the dialog can handle the loading state
    }
  }

  const getPetitionById = (petitionId: string) => {
    return petitions.find(p => p.id === petitionId)
  }

  const handleDuplicate = async (petition: Petition) => {
    try {
      const duplicatedPetition = await duplicatePetition(petition.id)
      toast.success('Petition duplicated successfully!')
      router.push(`/petitions/${duplicatedPetition.id}/edit`)
    } catch (error) {
      console.error('Failed to duplicate petition:', error)
      toast.error('Failed to duplicate petition')
    }
  }

  const columns: DataTableColumn<Petition>[] = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      accessorFn: (petition) => petition.title,
      cell: (petition) => (
        <span className="font-medium">{petition.title}</span>
      ),
    },
    {
      key: "language",
      header: "Language",
      hiddenOn: "md",
      sortable: true,
      accessorFn: (petition) => petition.language,
      cell: (petition) => (
        <span className="capitalize">{petition.language}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      hiddenOn: "lg",
      sortable: true,
      accessorFn: (petition) => new Date(petition.date),
      cell: (petition) => new Date(petition.date).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      className: "text-center",
      cell: (petition) => (
        <DataTableRowActions
          row={petition}
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
              onClick: (row) => window.open(`/print/petitions/${row.id}`, '_blank'),
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
        title="Our Petitions" 
        description="Manage your created petitions"
        maxWidth="6xl"
      >
        <Loading variant="skeleton-table" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Our Petitions" 
      description="Manage your created petitions"
      maxWidth="6xl"
    >
      <div className="space-y-4">
        <DataTableHeader
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search petitions..."
          actions={
            <Button asChild>
              <Link href="/petitions/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Link>
            </Button>
          }
        />

        <DataTable
          data={petitions}
          columns={columns}
          keyExtractor={(petition) => petition.id}
          onRowClick={(petition) => window.location.href = `/petitions/${petition.id}`}
          emptyState={{
            icon: <FileText className="h-12 w-12 mx-auto text-muted-foreground" />,
            title: searchTerm ? "No petitions found" : "No petitions yet",
            description: searchTerm 
              ? "No petitions found matching your search. Try different keywords." 
              : "Get started by creating your first petition",
            action: !searchTerm && (
              <Button asChild>
                <Link href="/petitions/create">Create Petition</Link>
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
            {Math.min(currentPage * itemsPerPage, total)} of {total} petitions
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
        title="Delete Petition"
        itemName={getPetitionById(petitionToDelete || '')?.title}
      />
    </PageContainer>
  )
}