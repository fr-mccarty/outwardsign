# Mass Roles Implementation Checklist

**Status:** Planning
**Priority:** High
**Documentation:** [MASSES.md](../docs/MASSES.md)
**Last Updated:** 2025-01-15

## Goal

Implement Mass Roles functionality to allow parish coordinators to:
1. Assign people to liturgical roles for each Mass
2. Filter/search people by their group roles
3. Apply mass templates to auto-populate role assignments
4. Track assignment status (assigned, confirmed, declined)
5. Allow roles to be empty (unfilled) without errors

---

## Prerequisites Met ✅

**Database Tables (Already Exist):**
- ✅ `mass_roles` table - Junction table linking masses, people, and roles
- ✅ `mass_roles_templates` table - Template definitions with role requirements
- ✅ `roles` table - Role definitions (from groups module)
- ✅ `people` table - Parish directory
- ✅ `masses` table - Mass events

**Existing Patterns to Follow:**
- ✅ Core Picker pattern (`core-picker.tsx`)
- ✅ Role Picker pattern (`role-picker.tsx`)
- ✅ Reading Picker with filters (`reading-picker-modal.tsx`)
- ✅ People Picker pattern (`people-picker.tsx`)

---

## Phase 1: Database Enhancements

### Migration: Add Status Tracking to mass_roles Table

**File:** `supabase/migrations/YYYYMMDD_add_mass_roles_status_tracking.sql`

```sql
-- Add status tracking columns to mass_roles table
ALTER TABLE mass_roles ADD COLUMN status TEXT DEFAULT 'ASSIGNED';
ALTER TABLE mass_roles ADD COLUMN confirmed_at TIMESTAMPTZ;
ALTER TABLE mass_roles ADD COLUMN notified_at TIMESTAMPTZ;
ALTER TABLE mass_roles ADD COLUMN notes TEXT;

-- Add index for status queries
CREATE INDEX idx_mass_roles_status ON mass_roles(status);

-- Add comment documenting status values
COMMENT ON COLUMN mass_roles.status IS 'Status: ASSIGNED | CONFIRMED | DECLINED | SUBSTITUTE_REQUESTED | SUBSTITUTE_FOUND | NO_SHOW';
```

**Tasks:**
- [ ] Create migration file with status tracking columns
- [ ] Test migration locally
- [ ] Document status field values in constants.ts
- [ ] Add MASS_ROLE_STATUS_VALUES and MASS_ROLE_STATUS_LABELS to constants

---

## Phase 2: Server Actions & Type Definitions

### Update mass actions (src/lib/actions/masses.ts)

**Add Types:**
```typescript
export interface MassRoleAssignment {
  id: string
  mass_id: string
  person_id: string
  role_id: string
  status: 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'SUBSTITUTE_REQUESTED' | 'SUBSTITUTE_FOUND' | 'NO_SHOW'
  confirmed_at?: string | null
  notified_at?: string | null
  notes?: string | null
  parameters?: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface MassRoleWithRelations extends MassRoleAssignment {
  person: Person
  role: Role
}

export interface ApplyTemplateData {
  mass_id: string
  template_id: string
  overwrite_existing: boolean  // Replace existing assignments or merge?
}
```

**Add Server Actions:**
- [ ] `getMassRoles(massId: string): Promise<MassRoleWithRelations[]>` - Fetch all role assignments for a mass
- [ ] `createMassRole(data): Promise<MassRoleAssignment>` - Assign person to role
- [ ] `updateMassRole(id, data): Promise<MassRoleAssignment>` - Update assignment status/notes
- [ ] `deleteMassRole(id): Promise<void>` - Remove role assignment
- [ ] `applyMassTemplate(data: ApplyTemplateData): Promise<MassRoleAssignment[]>` - Apply template to mass
- [ ] `bulkCreateMassRoles(massId, assignments[]): Promise<MassRoleAssignment[]>` - Create multiple assignments at once

**Template Application Logic:**
```typescript
export async function applyMassTemplate(data: ApplyTemplateData): Promise<MassRoleAssignment[]> {
  // 1. Fetch template with role requirements
  // 2. If overwrite_existing, delete current assignments
  // 3. For each role in template:
  //    - Create placeholder assignments (person_id can be null for unfilled roles)
  //    - Use template parameters to determine count needed
  // 4. Return created assignments
}
```

**Tasks:**
- [ ] Add MassRoleAssignment and MassRoleWithRelations type definitions
- [ ] Implement getMassRoles server action
- [ ] Implement createMassRole server action
- [ ] Implement updateMassRole server action
- [ ] Implement deleteMassRole server action
- [ ] Implement applyMassTemplate server action
- [ ] Implement bulkCreateMassRoles server action
- [ ] Add proper error handling and validation
- [ ] Add revalidatePath calls for affected routes
- [ ] Update MassWithRelations to include mass_roles array
- [ ] Update getMassWithRelations to fetch role assignments

---

## Phase 3: Mass Role Picker Component

### Create MassRolePicker Component

**File:** `src/components/mass-role-picker.tsx`

**Purpose:** Assign people to a specific mass role with filtering by group role

**Features:**
1. **Search & Filter People**
   - Text search by name
   - Filter by group role (similar to reading picker category filter)
   - Show only people with specific roles (e.g., "Lector", "EMHC", "Altar Server")
   - Clear "Filter by Role" button when active

2. **Display Person Info**
   - Name
   - Active group roles (badges)
   - Recent assignment count (optional)
   - Availability indicators (future: check blackout dates)

3. **Selection Modes**
   - Single select (assign one person to role)
   - Allow empty selection (role can remain unfilled)
   - Clear button to remove assignment

4. **Core Picker Integration**
   - Use CorePicker pattern for consistency
   - Pagination support
   - Loading states
   - Empty states

**Props Interface:**
```typescript
interface MassRolePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person | null) => void  // null = remove assignment
  selectedPersonId?: string
  filterByRoles?: string[]  // Filter people by these group role IDs
  massId?: string  // For checking existing assignments
  placeholder?: string
  emptyMessage?: string
  allowEmpty?: boolean  // Allow role to be unfilled (default: true)
}
```

**Implementation Pattern:**
```typescript
// Similar to ReadingPickerModal filtering logic
const filteredPeople = useMemo(() => {
  if (selectedRoles.length > 0) {
    // Filter people who have ALL selected roles (AND logic)
    return people.filter(person =>
      selectedRoles.every(roleId =>
        person.group_roles?.some(gr => gr.role_id === roleId)
      )
    )
  }
  return people
}, [people, selectedRoles])
```

**Tasks:**
- [ ] Create MassRolePicker component
- [ ] Implement role filter dropdown (similar to category filter in reading picker)
- [ ] Implement people search and filtering
- [ ] Add "Clear Filter" button when roles are selected
- [ ] Add badge display for person's active roles
- [ ] Integrate with CorePicker pattern
- [ ] Handle empty selection (allow unfilled roles)
- [ ] Add loading and empty states
- [ ] Style consistently with other pickers
- [ ] Test with large datasets (pagination)

---

## Phase 4: Mass Role Assignment UI

### Add Role Assignment Section to Mass Form

**File:** `src/app/(main)/masses/mass-form.tsx`

**Location:** After petitions/announcements fields, before save button

**UI Structure:**
```
┌─ Role Assignments ────────────────────────────────┐
│                                                    │
│ [Apply Template ▼]  (Template dropdown)           │
│                                                    │
│ Lector (First Reading)      Required              │
│ ├─ [Jane Smith ×]                                 │
│ └─ [+ Assign Person]                              │
│                                                    │
│ Lector (Second Reading)     Required              │
│ ├─ [Assign Person...]                             │
│                                                    │
│ Extraordinary Eucharistic Minister  (4 needed)    │
│ ├─ [John Doe ×]                                   │
│ ├─ [Mary Johnson ×]                               │
│ ├─ [+ Assign Person]                              │
│ ├─ [+ Assign Person]                              │
│                                                    │
│ Altar Server                Optional              │
│ ├─ [+ Assign Person]                              │
│                                                    │
└───────────────────────────────────────────────────┘
```

**Components Needed:**
1. **Template Selector** - Dropdown to choose mass template
2. **Apply Template Button** - Apply selected template's roles
3. **Role Assignment List** - Display each role from template
4. **Assignment Row** - Each assigned person with remove button
5. **Add Assignment Button** - Opens MassRolePicker for that role

**State Management:**
```typescript
const [roleAssignments, setRoleAssignments] = useState<MassRoleWithRelations[]>([])
const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
const [rolePickerOpen, setRolePickerOpen] = useState(false)
const [currentRoleId, setCurrentRoleId] = useState<string | null>(null)

// Load role assignments when editing existing mass
useEffect(() => {
  if (entity?.id) {
    loadMassRoles(entity.id)
  }
}, [entity?.id])

const handleApplyTemplate = async () => {
  if (!selectedTemplate) return
  const result = await applyMassTemplate({
    mass_id: entity.id,
    template_id: selectedTemplate,
    overwrite_existing: confirm('Replace existing assignments?')
  })
  setRoleAssignments(result)
}

const handleAssignPerson = (roleId: string, person: Person | null) => {
  if (person) {
    // Create new assignment
    createMassRole({ mass_id: entity.id, person_id: person.id, role_id: roleId })
  } else {
    // Remove assignment (person clicked clear)
    const assignment = roleAssignments.find(ra => ra.role_id === roleId && ra.person_id === person.id)
    if (assignment) deleteMassRole(assignment.id)
  }
}
```

**Tasks:**
- [ ] Add template selector dropdown (fetch mass_roles_templates)
- [ ] Add "Apply Template" button with confirmation dialog
- [ ] Create RoleAssignmentSection component
- [ ] Create RoleAssignmentRow component
- [ ] Integrate MassRolePicker for each role
- [ ] Add "Remove" button for each assignment
- [ ] Show role requirements from template (required count, optional, etc.)
- [ ] Handle empty/unfilled roles gracefully
- [ ] Add visual indicators (green = filled, yellow = partially filled, red = unfilled required)
- [ ] Add save handling for role assignments
- [ ] Add form validation (warn about unfilled required roles)
- [ ] Add loading states during template application
- [ ] Test with different template types

---

## Phase 5: Mass View Client Enhancements

### Add Role Assignments Display to View Page

**File:** `src/app/(main)/masses/[id]/mass-view-client.tsx`

**Display:**
```
Role Assignments
├─ Lector (First Reading): Jane Smith ✓
├─ Lector (Second Reading): (Unfilled)
├─ EMHC: John Doe ✓, Mary Johnson ✓
└─ Altar Server: (Unfilled)
```

**Tasks:**
- [ ] Add role assignments section to view page
- [ ] Display assigned people with status badges
- [ ] Show unfilled roles clearly
- [ ] Add link to edit assignments
- [ ] Color-code by status (assigned, confirmed, declined)

---

## Phase 6: Mass Templates Management (Future Phase)

**Create Template Management UI** (can be done later, not blocking for basic functionality)

**File:** `src/app/(main)/mass-templates/...`

**Features:**
- [ ] List all templates
- [ ] Create new template
- [ ] Edit template role requirements
- [ ] Clone template
- [ ] Delete template
- [ ] Set default template for parish

**Template Editor Features:**
- [ ] Add roles with counts (min, ideal, max)
- [ ] Set priority (required, optional)
- [ ] Configure sub-roles (e.g., EEM - Host, EEM - Chalice)
- [ ] Save template parameters as JSONB

---

## Phase 7: Constants & Validation

### Add Constants

**File:** `src/lib/constants.ts`

```typescript
// Mass Role Status
export const MASS_ROLE_STATUS_VALUES = ['ASSIGNED', 'CONFIRMED', 'DECLINED', 'SUBSTITUTE_REQUESTED', 'SUBSTITUTE_FOUND', 'NO_SHOW'] as const
export type MassRoleStatus = typeof MASS_ROLE_STATUS_VALUES[number]
export const MASS_ROLE_STATUS_LABELS: Record<MassRoleStatus, { en: string; es: string }> = {
  ASSIGNED: { en: 'Assigned', es: 'Asignado' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  DECLINED: { en: 'Declined', es: 'Declinado' },
  SUBSTITUTE_REQUESTED: { en: 'Substitute Requested', es: 'Sustituto Solicitado' },
  SUBSTITUTE_FOUND: { en: 'Substitute Found', es: 'Sustituto Encontrado' },
  NO_SHOW: { en: 'No Show', es: 'No Asistió' }
}
```

**Tasks:**
- [ ] Add MASS_ROLE_STATUS constants
- [ ] Add validation schemas for mass role data

---

## Testing Checklist

### Manual Testing
- [ ] Create a mass and apply a template
- [ ] Assign people to various roles
- [ ] Filter people by group role in picker
- [ ] Remove role assignments
- [ ] Save mass with role assignments
- [ ] View mass with role assignments on view page
- [ ] Edit mass and modify role assignments
- [ ] Leave some roles unfilled (should not error)
- [ ] Apply different templates and verify roles update

### Edge Cases
- [ ] Template with no roles defined
- [ ] Person assigned to multiple roles in same mass
- [ ] Role with no qualified people available
- [ ] Applying template with existing assignments (confirm overwrite)
- [ ] Deleting person who has mass role assignments
- [ ] Mass with 0 role assignments (should be valid)

---

## Success Criteria

✅ **Must Have (Phase 1-4):**
1. Ability to assign people to mass roles through UI
2. MassRolePicker with group role filtering
3. Template application to auto-populate roles
4. Roles can be left empty without errors
5. View page displays role assignments

✅ **Should Have (Future):**
1. Template management UI
2. Status tracking (confirmed, declined)
3. Bulk assignment operations
4. Assignment history/reporting

---

## Questions to Answer

**For User:**
1. ✅ Should roles be allowed to be empty? **Answer: Yes, roles can be unfilled**
2. ✅ Should we use CorePicker pattern? **Answer: Yes, implement core picker**
3. ✅ Should we filter by group roles like reading picker? **Answer: Yes, similar filtering pattern**
4. Can one person be assigned to multiple roles in the same mass? **Likely yes - needs confirmation**
5. Should applying a template overwrite existing assignments or merge? **Needs decision - probably ask user with confirmation**
6. Should we show recent assignment count to help rotation? **Future enhancement**
7. Do we need to track "preferred roles" per person? **Future - use minister_preferences table from MASSES.md**

**For Implementation:**
1. Should mass_roles.person_id be nullable (to represent unfilled roles)? **Recommend: nullable or use a different approach**
2. How to handle template parameters JSONB structure? **Use structure from MASSES.md**
3. Should we create a separate component for template role editor? **Yes, but later phase**

---

## Related Documentation

- [MASSES.md](../docs/MASSES.md) - Complete Mass module architecture
- [COMPONENT_REGISTRY.md](../docs/COMPONENT_REGISTRY.md) - Reusable component patterns
- [PICKER_PATTERNS.md](../docs/PICKER_PATTERNS.md) - Picker behavior guidelines
- [FORMS.md](../docs/FORMS.md) - Form patterns and validation
- [ROADMAP.md](../docs/ROADMAP.md) - Overall project roadmap

---

## Notes

**Key Design Decisions:**
- **Roles can be empty** - Not every role needs to be filled for every mass
- **Filter by group roles** - Quick way to find qualified people
- **Template-driven** - Templates define standard configurations
- **Status tracking** - Track confirmed/declined for future notification system
- **Core picker pattern** - Consistent UX across all pickers

**Implementation Order:**
1. Database migration (add status fields)
2. Server actions (CRUD for mass_roles)
3. MassRolePicker component
4. Mass form role assignment section
5. View page display
6. Template management (later)

**Future Enhancements (Not in Scope):**
- Email notifications for assignments
- Substitute request workflow
- Minister preference management
- Auto-assignment algorithm
- Conflict detection
- Mobile-optimized minister portal
