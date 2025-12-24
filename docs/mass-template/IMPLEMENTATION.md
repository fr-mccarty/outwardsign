# Mass Template System - Implementation Guide

> **⚠️ DEPRECATED:** This document describes the legacy Mass Role Template system that was removed in December 2024. The Mass Liturgies module now uses the unified event data model with roles defined via `input_field_definitions` and assignments in `people_event_assignments`. This file is kept for historical reference only.

> **Purpose:** Complete implementation documentation for Mass Role Template components, server actions, and UI behavior patterns.

## Table of Contents

- [Component Structure](#component-structure)
- [Server Actions API](#server-actions-api)
- [UI Behavior](#ui-behavior)
- [Code Examples](#code-examples)
- [Related Documentation](#related-documentation)

---

## Component Structure

### Template Management Components

**Location:** `src/app/(main)/mass-role-templates/`

#### 1. List Page (Server) - `page.tsx`
- Fetches all templates for parish
- Passes to `mass-role-templates-list-client.tsx`
- Server Component (no 'use client' directive)

#### 2. List Client - `mass-role-templates-list-client.tsx`
- Displays template cards with name, description
- Search/filter functionality
- Client Component

#### 3. Create Page (Server) - `create/page.tsx`
- Renders `MassRoleTemplateFormWrapper` with no template
- Server Component

#### 4. View Page (Server) - `[id]/page.tsx`
- Fetches template by ID
- Passes to `mass-role-template-view-client.tsx`
- Server Component

#### 5. View Client - `[id]/mass-role-template-view-client.tsx`
- Displays template info
- Fetches and displays template items
- Shows role names and counts
- Client Component

#### 6. Edit Page (Server) - `[id]/edit/page.tsx`
- Fetches template by ID
- Renders `MassRoleTemplateFormWrapper` with template
- Server Component

#### 7. Form Wrapper - `mass-role-template-form-wrapper.tsx`
- PageContainer for form
- Renders `MassRoleTemplateForm`
- Client Component

#### 8. Unified Form - `mass-role-template-form.tsx`
- Basic fields (name, description, note)
- In edit mode: Shows `MassRoleTemplateItemList` for managing role items
- In create mode: Shows helper text "Save first, then add roles"
- Client Component

#### 9. View Client - `[id]/mass-role-template-view-client.tsx`
- Uses `ModuleViewPanel` with `onDelete` prop for delete functionality
- Edit button links to edit page
- Client Component

---

### Template Item Components

**Location:** `src/components/`

#### 1. MassRoleTemplateItemList - `mass-role-template-item-list.tsx`
- Drag-and-drop list using `@dnd-kit/core`
- "Add Mass Role" button
- Uses `MassRolePicker` for adding new roles
- Renders `MassRoleTemplateItem` for each item
- Client Component

**Key Features:**
- Drag-and-drop reordering with `@dnd-kit/sortable`
- Adds new roles via `MassRolePicker` modal
- Filters out already-added roles from picker
- Optimistic UI updates

#### 2. MassRoleTemplateItem - `mass-role-template-item.tsx`
- Sortable item with drag handle (⋮⋮)
- Role name and description display
- Count input with debounced updates (500ms)
- Delete button with confirmation dialog
- Client Component

**Key Features:**
- Inline count editing (1-99 range)
- Debounced server updates to reduce API calls
- Confirmation dialog before deletion
- Visual drag handle for reordering

#### 3. MassRolePicker - `mass-role-picker.tsx`
- Modal dialog to select mass role
- Filters out already-added roles
- Includes option to create new mass roles on-the-fly
- Default count is 1
- Client Component

**Key Features:**
- Search/filter roles
- Create new roles inline
- Prevents duplicate role selection
- Immediate feedback on selection

---

### Mass Form Integration

**Location:** `src/app/(main)/mass-liturgies/mass-liturgy-form.tsx`

**Role Assignment Section Code:**
```typescript
// Load mass role instances when editing
useEffect(() => {
  if (isEditing && mass?.id) {
    loadMassRoles()  // Fetches instances with relations
  }
}, [isEditing, mass?.id])

const loadMassRoles = async () => {
  const roles = await getMassRoleInstances(mass.id)
  setMassRoles(roles)
}

// Assign person to role
const handleSelectPersonForRole = async (person: Person) => {
  await createMassRoleInstance({
    mass_id: mass.id,
    person_id: person.id,
    mass_roles_template_item_id: currentRoleId  // Template item ID
  })
  await loadMassRoles()
}

// Get assignments for a specific role
const getRoleAssignments = (roleId: string) => {
  return massRoles.filter(mr =>
    mr.mass_roles_template_item?.mass_role.id === roleId
  )
}
```

---

## Server Actions API

### Mass Role Templates

**File:** `src/lib/actions/mass-role-templates.ts`

```typescript
// Get all templates for parish
getMassRoleTemplates(): Promise<MassRoleTemplate[]>

// Get single template
getMassRoleTemplate(id: string): Promise<MassRoleTemplate | null>

// Create template
createMassRoleTemplate(data: CreateMassRoleTemplateData): Promise<MassRoleTemplate>

// Update template
updateMassRoleTemplate(id: string, data: UpdateMassRoleTemplateData): Promise<MassRoleTemplate>

// Delete template
deleteMassRoleTemplate(id: string): Promise<void>
```

**Type Definitions:**
```typescript
interface CreateMassRoleTemplateData {
  name: string
  description?: string | null
  note?: string | null
}

interface UpdateMassRoleTemplateData {
  name?: string
  description?: string | null
  note?: string | null
}
```

---

### Mass Role Template Items

**File:** `src/lib/actions/mass-role-template-items.ts`

```typescript
// Get all items for a template (ordered by position)
getTemplateItems(templateId: string): Promise<MassRoleTemplateItemWithRole[]>

// Create template item (add role to template)
createTemplateItem(data: CreateTemplateItemData): Promise<MassRoleTemplateItem>
// - Automatically calculates next position
// - Returns error if role already exists in template (unique constraint)

// Update template item (change count)
updateTemplateItem(id: string, data: UpdateTemplateItemData): Promise<MassRoleTemplateItem>

// Delete template item and reorder remaining
deleteTemplateItem(id: string): Promise<void>
// - Deletes item
// - Reorders remaining items to close gaps in positions

// Reorder template items (drag-and-drop)
reorderTemplateItems(templateId: string, itemIds: string[]): Promise<void>
// - Updates position for each item based on array index
```

**Type Definitions:**
```typescript
interface CreateTemplateItemData {
  template_id: string
  mass_role_id: string
  count?: number  // Defaults to 1
}

interface UpdateTemplateItemData {
  count?: number
}
```

**Key Implementation Details:**

**Position Calculation:**
```typescript
// When creating new item
const maxPosition = await getMaxPosition(templateId)
const newPosition = maxPosition !== null ? maxPosition + 1 : 0
```

**Reorder Logic:**
```typescript
// Updates positions based on array order
itemIds.forEach((id, index) => {
  updateTemplateItem(id, { position: index })
})
```

**Delete and Reorder:**
```typescript
// After deleting item, close gaps
const remainingItems = await getTemplateItems(templateId)
remainingItems.forEach((item, index) => {
  updateTemplateItem(item.id, { position: index })
})
```

---

### Mass Role Instances

**File:** `src/lib/actions/mass-roles.ts`

```typescript
// Get all instances for a Mass (with person and role details)
getMassRoleInstances(massId: string): Promise<MassRoleInstanceWithRelations[]>

// Get single instance
getMassRoleInstance(id: string): Promise<MassRoleInstance | null>

// Create instance (assign person to role)
createMassRoleInstance(data: CreateMassRoleInstanceData): Promise<MassRoleInstance>

// Update instance (change person or role)
updateMassRoleInstance(id: string, data: UpdateMassRoleInstanceData): Promise<MassRoleInstance>

// Delete instance (remove assignment)
deleteMassRoleInstance(id: string): Promise<void>
```

**Type Definitions:**
```typescript
interface CreateMassRoleInstanceData {
  mass_id: string
  person_id: string
  mass_roles_template_item_id: string
}

interface UpdateMassRoleInstanceData {
  person_id?: string
  mass_roles_template_item_id?: string
}

interface MassRoleInstanceWithRelations extends MassRoleInstance {
  person?: Person | null
  mass_roles_template_item?: {
    id: string
    mass_role: MassRole
  } | null
}
```

---

## UI Behavior

### Template Item Drag-and-Drop

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable`

**Workflow:**
1. User drags item by grip handle (⋮⋮)
2. Item position updates optimistically in UI
3. On drop, array is reordered: `arrayMove(items, oldIndex, newIndex)`
4. New order sent to server: `reorderTemplateItems(templateId, itemIds)`
5. If error, original order is restored

**Position Calculation:**
- Position is zero-based: 0, 1, 2, 3, ...
- When reordering, position = index in array
- When deleting, positions are recalculated to close gaps

**Code Example:**
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'

function MassRoleTemplateItemList({ templateId, items }) {
  const [localItems, setLocalItems] = useState(items)

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localItems.findIndex(item => item.id === active.id)
    const newIndex = localItems.findIndex(item => item.id === over.id)

    // Optimistic update
    const newItems = arrayMove(localItems, oldIndex, newIndex)
    setLocalItems(newItems)

    try {
      // Persist to server
      await reorderTemplateItems(
        templateId,
        newItems.map(item => item.id)
      )
    } catch (error) {
      // Revert on error
      setLocalItems(items)
      toast.error('Failed to reorder items')
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localItems} strategy={verticalListSortingStrategy}>
        {localItems.map(item => (
          <MassRoleTemplateItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

---

### Template Item Count Updates

**Debouncing:** 500ms delay using `useDebounce` hook

**Workflow:**
1. User types in count input
2. Local state updates immediately (optimistic)
3. After 500ms of no changes, debounced value triggers
4. Server Action: `updateTemplateItem(id, { count: newCount })`
5. If error, count reverts to original value

**Validation:**
- Min: 1 (enforced in UI and database)
- Max: 99 (enforced in UI only)
- Database constraint: `CHECK (count >= 1)`

**Code Example:**
```typescript
import { useDebounce } from '@/hooks/use-debounce'

function MassRoleTemplateItem({ item }) {
  const [count, setCount] = useState(item.count)
  const debouncedCount = useDebounce(count, 500)

  useEffect(() => {
    if (debouncedCount !== item.count && debouncedCount >= 1 && debouncedCount <= 99) {
      handleUpdateCount(debouncedCount)
    }
  }, [debouncedCount])

  const handleUpdateCount = async (newCount: number) => {
    try {
      await updateTemplateItem(item.id, { count: newCount })
      toast.success('Count updated')
    } catch (error) {
      setCount(item.count) // Revert on error
      toast.error('Failed to update count')
    }
  }

  return (
    <Input
      type="number"
      min={1}
      max={99}
      value={count}
      onChange={(e) => setCount(parseInt(e.target.value) || 1)}
    />
  )
}
```

---

### Role Assignment in Mass Form

**Workflow:**
1. Mass must be saved first (create mode shows message: "Save the mass before assigning roles")
2. In edit mode:
   - If template selected: Load template items and show requirements
   - For each role: Show count needed and current assignments
3. Click "Add Person" → Opens `PeoplePicker`
4. Select person → Creates `mass_role_instance`
5. Reload instances to show updated list
6. No limit on assignments (can assign more or fewer than template count suggests)

**Template Item ID Storage:**
```typescript
const [currentRoleId, setCurrentRoleId] = useState<string | null>(null)

const handleOpenRolePicker = (roleId: string) => {
  setCurrentRoleId(roleId)  // Store template item ID
  setRolePickerOpen(true)
}

const handleSelectPersonForRole = async (person: Person) => {
  await createMassRoleInstance({
    mass_id: mass.id,
    person_id: person.id,
    mass_roles_template_item_id: currentRoleId  // Use stored template item ID
  })
}
```

**Displaying Assignments:**
```typescript
function RoleAssignmentSection({ mass, templateItems }) {
  const [massRoles, setMassRoles] = useState<MassRoleInstanceWithRelations[]>([])

  useEffect(() => {
    if (mass?.id) {
      loadMassRoles()
    }
  }, [mass?.id])

  const loadMassRoles = async () => {
    const roles = await getMassRoleInstances(mass.id)
    setMassRoles(roles)
  }

  const getAssignmentsForItem = (itemId: string) => {
    return massRoles.filter(mr =>
      mr.mass_roles_template_item_id === itemId
    )
  }

  return (
    <div>
      {templateItems.map(item => {
        const assignments = getAssignmentsForItem(item.id)
        return (
          <div key={item.id}>
            <h3>{item.mass_role.name} ({item.count} needed)</h3>
            {assignments.map(assignment => (
              <div key={assignment.id}>
                {assignment.person?.full_name}
                <Button onClick={() => deleteMassRoleInstance(assignment.id)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={() => handleOpenRolePicker(item.id)}>
              Add Person
            </Button>
          </div>
        )
      })}
    </div>
  )
}
```

---

### Delete Protection

**Mass Roles:**
- Cannot delete if used in any template items
- Cannot delete if used in any mass role instances
- Check performed in `deleteMassRole()` before deletion

**Implementation:**
```typescript
export async function deleteMassRole(id: string): Promise<void> {
  // Check if used in template items
  const { count: itemCount } = await supabase
    .from('mass_roles_template_items')
    .select('*', { count: 'exact', head: true })
    .eq('mass_role_id', id)

  if (itemCount && itemCount > 0) {
    throw new Error('Cannot delete role that is used in templates')
  }

  // Check if used in instances (via template items)
  const { count: instanceCount } = await supabase
    .from('mass_role_instances')
    .select('*, mass_roles_template_items!inner(*)', { count: 'exact', head: true })
    .eq('mass_roles_template_items.mass_role_id', id)

  if (instanceCount && instanceCount > 0) {
    throw new Error('Cannot delete role that is used in Mass assignments')
  }

  // Safe to delete
  await supabase
    .from('mass_roles')
    .delete()
    .eq('id', id)
}
```

**Templates:**
- Can be deleted even if used in Masses
- Cascade delete removes all template items
- Mass role instances remain (orphaned from template item if template item deleted)

---

## Code Examples

### Complete Create Template Flow

```typescript
// 1. Create template
const template = await createMassRoleTemplate({
  name: 'Sunday Mass - Full',
  description: 'Standard Sunday Mass with full choir',
  note: 'Use for 9 AM and 11 AM'
})

// 2. Redirect to edit page
router.push(`/mass-role-templates/${template.id}/edit`)

// 3. Add roles to template
const lectorItem = await createTemplateItem({
  template_id: template.id,
  mass_role_id: 'role-lector-id',
  count: 3
})

const eemItem = await createTemplateItem({
  template_id: template.id,
  mass_role_id: 'role-eem-id',
  count: 6
})

// 4. Reorder if needed
await reorderTemplateItems(template.id, [eemItem.id, lectorItem.id])
```

### Complete Mass Assignment Flow

```typescript
// 1. Create Mass with template
const mass = await createMass({
  event_id: 'event-123',
  presider_id: 'priest-456',
  mass_roles_template_id: 'template-789'  // Link to template
})

// 2. Get template items
const templateItems = await getTemplateItems('template-789')

// 3. Assign people to roles
for (const item of templateItems) {
  // Assign required number of people
  for (let i = 0; i < item.count; i++) {
    const person = selectPerson()  // Your person selection logic
    await createMassRoleInstance({
      mass_id: mass.id,
      person_id: person.id,
      mass_roles_template_item_id: item.id
    })
  }
}

// 4. View assignments
const assignments = await getMassRoleInstances(mass.id)
assignments.forEach(assignment => {
  console.log(`${assignment.person?.full_name} - ${assignment.mass_roles_template_item?.mass_role.name}`)
})
```

---

## Related Documentation

- [OVERVIEW.md](./OVERVIEW.md) - System architecture and data structures
- [DATABASE.md](./DATABASE.md) - Database schema and migrations
- [WORKFLOWS.md](./WORKFLOWS.md) - Template creation and assignment workflows
- [../MASSES.md](../MASSES.md) - Complete Mass module architecture
- [../FORMS.md](../FORMS.md) - Form patterns and component usage
- [../COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md) - Reusable components
- [../DRAG_AND_DROP.md](../DRAG_AND_DROP.md) - Drag-and-drop implementation patterns

---

**Last Updated:** 2025-12-02
**Status:** Complete implementation documented
**Coverage:** Components, server actions, UI behavior, and code examples
