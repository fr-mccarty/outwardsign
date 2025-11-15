# Mass Role Templates - Drag & Drop Implementation

**Priority:** High
**Status:** Planning
**Created:** 2025-11-15

## Goal

Replace the JSON parameters field with a user-friendly drag-and-drop interface for building Mass role templates. Each template will have an ordered list of roles with counts (how many of each role are needed).

---

## Database Changes

### Phase 1: Create Junction Table

- [ ] Create migration: `mass_roles_template_items` table
  - `id` UUID primary key
  - `template_id` UUID FK to `mass_roles_templates` ON DELETE CASCADE
  - `role_id` UUID FK to `roles` ON DELETE RESTRICT (prevent deleting roles in use)
  - `count` INTEGER NOT NULL DEFAULT 1 (how many of this role needed)
  - `position` INTEGER NOT NULL (for ordering, starts at 0)
  - `created_at`, `updated_at` timestamps
  - UNIQUE constraint on (template_id, position)
  - UNIQUE constraint on (template_id, role_id) - same role can't appear twice in template

- [ ] Add RLS policies for `mass_roles_template_items`
  - SELECT: Parish members can read items for their parish templates
  - INSERT: Parish members can create items for their parish templates
  - UPDATE: Parish members can update items for their parish templates
  - DELETE: Parish members can delete items for their parish templates

- [ ] Add indexes
  - `idx_template_items_template_id` on (template_id)
  - `idx_template_items_role_id` on (role_id)
  - `idx_template_items_position` on (template_id, position)

- [ ] Add trigger for `updated_at`

- [ ] Run migration: `npm run db:push` (or tell user to push)

### Phase 2: Migrate Existing Data (if needed)

- [ ] Check if any templates have data in `parameters` JSONB field
- [ ] Create migration script to convert JSONB to template_items rows
- [ ] Or just start fresh (depends on production data)

---

## Server Actions

### Phase 1: Template Items CRUD

Create `src/lib/actions/mass-role-template-items.ts`:

- [ ] Define TypeScript types
  - `MassRoleTemplateItem` interface
  - `MassRoleTemplateItemWithRole` interface (includes role name)
  - `CreateTemplateItemData` interface
  - `UpdateTemplateItemData` interface

- [ ] `getTemplateItems(templateId)` - Get all items for a template, ordered by position
  - Join with roles table to get role names
  - Return array sorted by position

- [ ] `createTemplateItem(data)` - Add a role to template
  - Calculate next position (max position + 1)
  - Insert new item
  - Revalidate paths

- [ ] `updateTemplateItem(id, data)` - Update count or other fields
  - Allow updating count
  - Revalidate paths

- [ ] `deleteTemplateItem(id)` - Remove a role from template
  - Delete item
  - Reorder remaining items (close gaps in positions)
  - Revalidate paths

- [ ] `reorderTemplateItems(templateId, itemIds[])` - Update positions based on drag-drop
  - Take array of item IDs in new order
  - Update position for each item (0, 1, 2, 3...)
  - Use transaction for atomicity
  - Revalidate paths

### Phase 2: Roles CRUD (for "Add New Role" modal)

Enhance or create `src/lib/actions/roles.ts`:

- [ ] `getRoles()` - Get all roles for current parish
  - Filter by parish_id
  - Order by name

- [ ] `getRole(id)` - Get single role

- [ ] `createRole(data)` - Create new role
  - Validate name is unique in parish
  - Return created role

- [ ] `updateRole(id, data)` - Update role

- [ ] `deleteRole(id)` - Delete role
  - Check if role is used in any templates first
  - Show error if in use

---

## UI Components

### Phase 1: Drag & Drop List Component

Create `src/components/mass-role-template-item-list.tsx`:

- [ ] Install drag-and-drop library
  - Research options: `@dnd-kit/core`, `react-beautiful-dnd`, or native HTML5
  - Recommend: `@dnd-kit/core` (actively maintained, flexible)
  - Add to package.json: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

- [ ] Create draggable list component
  - Display roles in order
  - Each item shows: drag handle icon, role name, count input, delete button
  - Implement drag-and-drop reordering
  - Call `reorderTemplateItems()` on drop
  - Optimistic UI updates (update locally, then sync to server)

- [ ] Create "Add Role" button
  - Opens role selector dropdown/combobox
  - Filters out roles already in template
  - On select: calls `createTemplateItem()`
  - Auto-scrolls to newly added item

- [ ] Style for empty state
  - "No roles added yet. Click 'Add Role' to get started."
  - Visual cue to add first role

### Phase 2: Role Selector Component

Create `src/components/role-selector.tsx`:

- [ ] Searchable dropdown/combobox
  - List all available roles (not already in template)
  - Search by role name
  - "Add New Role..." option at bottom (opens modal)

- [ ] Use shadcn Combobox or Command component
  - Follow existing patterns in codebase
  - Keyboard navigation support

### Phase 3: Add Role Modal

Create `src/components/add-role-modal.tsx`:

- [ ] Modal/dialog with form
  - Role Name (required, text input)
  - Description (optional, textarea)
  - Internal Note (optional, textarea)

- [ ] Validation
  - Role name required
  - Check uniqueness in parish (handled by server)

- [ ] On submit
  - Call `createRole()`
  - Show success toast
  - Close modal
  - Auto-select newly created role in parent selector
  - Add to template immediately (call `createTemplateItem()`)

### Phase 4: Template Item Component

Create `src/components/mass-role-template-item.tsx`:

- [ ] Display single draggable item
  - Drag handle icon (6 dots or grab icon)
  - Role name (read-only)
  - Count input (number, min=1, default=1)
  - Delete button (trash icon with confirmation)

- [ ] Count input behavior
  - Debounce updates (500ms delay)
  - Call `updateTemplateItem()` on change
  - Show loading state during update

- [ ] Delete confirmation
  - Click delete → show confirmation dialog
  - "Remove {role name} from template?"
  - On confirm: call `deleteTemplateItem()`

---

## Form Integration

### Update Template Form

Edit `src/app/(main)/mass-role-templates/mass-role-template-form.tsx`:

- [ ] Remove parameters JSON textarea section entirely

- [ ] Add new "Template Roles" section
  - Card with "Roles & Counts" title
  - Description: "Define which roles are needed and how many of each"

- [ ] Integrate `MassRoleTemplateItemList` component
  - Pass template.id as prop
  - Component manages its own state and server actions
  - Independent of main form submission

- [ ] Important: Template items are saved immediately (not on form submit)
  - Add/delete/reorder operations happen in real-time
  - This is separate from template name/description save

- [ ] Update form validation
  - Remove parameters field from Zod schema
  - Template can be saved without any roles (empty template is valid)

### Update Template View

Edit `src/app/(main)/mass-role-templates/[id]/mass-role-template-view-client.tsx`:

- [ ] Remove JSON parameters display

- [ ] Add "Template Roles" section
  - Display roles in order (read-only, not draggable)
  - Show: role name, count needed
  - Format: "Lector (2 needed)" or similar

- [ ] Empty state
  - If no roles: "No roles defined for this template."

---

## Server Actions Updates

### Update mass-role-templates.ts

- [ ] Remove `parameters` field from all operations
  - Remove from `CreateMassRoleTemplateData` type
  - Remove from `UpdateMassRoleTemplateData` type
  - Remove from `createMassRoleTemplate()` function
  - Remove from `updateMassRoleTemplate()` function

- [ ] Add `getMassRoleTemplateWithItems()` function
  - Fetch template
  - Fetch all template items with role details
  - Return combined object: `{ ...template, items: [...] }`

- [ ] Update existing actions to work without parameters field

---

## Testing

### Manual Testing Checklist

- [ ] Create new template with roles
  - Add multiple roles
  - Set different counts
  - Verify saved correctly

- [ ] Reorder roles via drag-and-drop
  - Drag first to last
  - Drag middle to top
  - Verify positions update correctly

- [ ] Update role counts
  - Change count from 1 to 5
  - Verify updates save
  - Verify debouncing works (doesn't spam server)

- [ ] Delete roles from template
  - Delete first role
  - Delete middle role
  - Delete last role
  - Verify remaining roles re-order correctly

- [ ] Add new role via modal
  - Open "Add New Role" modal
  - Create role
  - Verify it appears in selector
  - Verify it gets added to template

- [ ] Role validation
  - Try to add same role twice (should be prevented)
  - Try to delete role that's in use (should warn or prevent)

- [ ] Empty states
  - Create template with no roles
  - View template with no roles
  - Verify messaging is clear

### Automated Testing

- [ ] Write test for `reorderTemplateItems()`
  - Test correct position updates
  - Test transaction rollback on error

- [ ] Write test for role uniqueness in template
  - Verify can't add same role twice

---

## UI/UX Considerations

### Drag & Drop Experience

- [ ] Visual feedback during drag
  - Ghost/placeholder showing where item will drop
  - Highlight drop zones
  - Cursor changes to grabbing

- [ ] Accessibility
  - Keyboard support for reordering (up/down arrows?)
  - Screen reader announcements
  - Focus management

- [ ] Mobile support
  - Touch drag-and-drop
  - Larger touch targets
  - Consider alternative UI for mobile (up/down buttons?)

### Count Input

- [ ] Validation
  - Minimum: 1
  - Maximum: reasonable limit (99? 999?)
  - Only allow integers

- [ ] UX
  - Show spinner/loading state during save
  - Show success indicator (checkmark?)
  - Show error if save fails

### Performance

- [ ] Optimistic updates
  - Update UI immediately on drag
  - Show loading state during server sync
  - Rollback on error

- [ ] Debouncing
  - Count input changes debounced (500ms)
  - Prevents excessive server calls

---

## Migration Strategy

### Option A: Fresh Start (Recommended if no production data)

- [ ] Drop `parameters` column from `mass_roles_templates` table
- [ ] All new templates use `mass_roles_template_items` table
- [ ] No migration needed

### Option B: Gradual Migration (If production data exists)

- [ ] Keep `parameters` column for backward compatibility
- [ ] Add migration script to convert old templates
- [ ] Support both old and new format during transition
- [ ] Eventually deprecate parameters field

---

## Implementation Order

**Recommended sequence:**

1. **Database** - Create migration for `mass_roles_template_items` table
2. **Server Actions** - Implement template items CRUD + roles CRUD
3. **UI Components** - Build drag-drop list (start simple, add complexity)
4. **Role Selector** - Add role selector dropdown
5. **Add Role Modal** - Implement "Add New Role" functionality
6. **Form Integration** - Replace JSON textarea with new UI
7. **View Page** - Update template view to show roles
8. **Testing** - Manual testing + automated tests
9. **Polish** - Accessibility, mobile, animations, loading states

---

## Open Questions

- [ ] Should we show role descriptions in the template list? (Or just name + count?)
- [ ] Do we need role icons/colors for visual identification?
- [ ] Should templates show which Masses are using them? (for context)
- [ ] Do we need template versioning (if someone changes a template, affect existing Masses?)
- [ ] Should deleting a role from roles table be prevented if it's in any template?

---

## Resources

**Libraries:**
- [@dnd-kit/core](https://docs.dndkit.com/) - Modern drag-and-drop for React
- [shadcn/ui Combobox](https://ui.shadcn.com/docs/components/combobox) - Searchable dropdown

**Reference Implementations:**
- Wedding form (`src/app/(main)/weddings/wedding-form.tsx`) - Complex form pattern
- Groups module - Dialog/modal patterns
- Reading picker - Picker modal pattern

---

**Next Steps:** Start with Phase 1 - Database migration for junction table.
