"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { MassRole } from "@/lib/types"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { Plus, Search } from "lucide-react"
import { canAccessModule, type UserParishRole } from "@/lib/auth/permissions-client"
import { DraggableListItem } from "@/components/draggable-list-item"
import { reorderMassRoles } from "@/lib/actions/mass-roles"
import { toast } from "sonner"

interface MassRolesListClientProps {
  massRoles: MassRole[]
  userParish: UserParishRole
}

export function MassRolesListClient({ massRoles: initialData, userParish }: MassRolesListClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<MassRole[]>(initialData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  const canManageRoles = canAccessModule(userParish, "masses")

  // Fix hydration mismatch with @dnd-kit
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Optimistically update UI
    const reorderedItems = arrayMove(items, oldIndex, newIndex)
    setItems(reorderedItems)

    try {
      // Save to server
      const itemIds = reorderedItems.map((item) => item.id)
      await reorderMassRoles(itemIds)
      toast.success("Order updated")
    } catch (error) {
      console.error("Failed to reorder items:", error)
      toast.error("Failed to update order")
      // Revert on error
      setItems(initialData)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    // Update URL with search param
    const params = new URLSearchParams()
    if (value) params.set("search", value)
    router.push(`/mass-roles${value ? `?${params.toString()}` : ""}`)
  }

  // Filter items based on search
  const filteredItems = searchQuery
    ? items.filter(
        (role) =>
          role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          role.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items

  return (
    <PageContainer
      title="Mass Roles"
      description="Define liturgical roles for Mass celebrations. Drag to reorder."
      actions={
        canManageRoles ? (
          <Link href="/mass-roles/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Mass Role
            </Button>
          </Link>
        ) : undefined
      }
    >
      {/* Search Card */}
      <SearchCard title="Search Mass Roles" className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search mass roles..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </SearchCard>

      {/* Mass Roles List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No mass roles found matching "${searchQuery}"` : 'No mass roles defined yet'}
          action={!searchQuery && canManageRoles ? (
            <Link href="/mass-roles/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Mass Role
              </Button>
            </Link>
          ) : undefined}
        />
      ) : !isMounted ? (
        // Render static list during SSR to avoid hydration mismatch
        <div className="flex flex-col gap-2 overflow-hidden">
          {filteredItems.map((role) => (
            <DraggableListItem
              key={role.id}
              id={role.id}
              title={role.name}
              description={role.description}
              editHref={`/mass-roles/${role.id}/edit`}
              viewHref={`/mass-roles/${role.id}`}
              status={role.is_active ? "ACTIVE" : "INACTIVE"}
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 overflow-hidden">
              {filteredItems.map((role) => (
                <DraggableListItem
                  key={role.id}
                  id={role.id}
                  title={role.name}
                  description={role.description}
                  editHref={`/mass-roles/${role.id}/edit`}
                  viewHref={`/mass-roles/${role.id}`}
                  status={role.is_active ? "ACTIVE" : "INACTIVE"}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </PageContainer>
  )
}
