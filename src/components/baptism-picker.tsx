'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { getBaptisms, type BaptismWithNames } from '@/lib/actions/baptisms'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'

interface BaptismPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (baptismId: string) => void
}

const ITEMS_PER_PAGE = 10

export function BaptismPicker({
  open,
  onOpenChange,
  onSelect,
}: BaptismPickerProps) {
  const [search, setSearch] = useState('')
  const [baptisms, setBaptisms] = useState<BaptismWithNames[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Debounce search
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  // Load available baptisms (not in any group)
  useEffect(() => {
    if (open) {
      loadBaptisms()
      setCurrentPage(1) // Reset to first page when opening or searching
    }
  }, [open, debouncedSearch])

  const loadBaptisms = async () => {
    setLoading(true)
    try {
      const allBaptisms = await getBaptisms({ search: debouncedSearch, status: 'all' })
      // Filter to only baptisms not in a group
      const available = allBaptisms.filter(b => !b.group_baptism_id)
      setBaptisms(available)
    } catch (error) {
      console.error('Failed to load baptisms:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate pagination
  const totalPages = Math.ceil(baptisms.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedBaptisms = baptisms.slice(startIndex, endIndex)

  const handleSelect = (baptismId: string) => {
    onSelect(baptismId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Existing Baptism to Group</DialogTitle>
          <DialogDescription>
            Select a baptism to add to this group ceremony. Search by child, parent, or godparent name. Only baptisms not already in a group are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Search */}
          <ClearableSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by child, parent, or godparent name..."
            className="flex-shrink-0"
          />

          {/* Baptisms list */}
          <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : baptisms.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No available baptisms found.</p>
                <p className="text-sm mt-1">All baptisms are either already in groups or don't match your search.</p>
              </div>
            ) : (
              <div className="divide-y">
                {paginatedBaptisms.map((baptism) => {
                  const childName = baptism.child?.full_name || 'No child assigned'
                  const parents = [baptism.mother?.full_name, baptism.father?.full_name]
                    .filter(Boolean)
                    .join(' and ') || 'No parents'
                  const godparents = [baptism.sponsor_1?.full_name, baptism.sponsor_2?.full_name]
                    .filter(Boolean)
                    .join(' and ') || 'No godparents'

                  return (
                    <div
                      key={baptism.id}
                      data-testid={`baptism-option-${baptism.id}`}
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleSelect(baptism.id)}
                    >
                      <div className="font-semibold mb-1">{childName}</div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <div><span className="font-medium">Parents:</span> {parents}</div>
                        <div><span className="font-medium">Godparents:</span> {godparents}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && baptisms.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3 flex-shrink-0">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, baptisms.length)} of {baptisms.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
